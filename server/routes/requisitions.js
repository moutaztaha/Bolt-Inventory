import express from 'express';
import { logUserActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Generate requisition number
const generateRequisitionNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `REQ-${year}${month}${day}-${timestamp}`;
};

// Get all requisitions
router.get('/', (req, res) => {
  const { db } = req.app.locals;
  const { status, department, priority } = req.query;
  
  let query = `
    SELECT r.*, 
           u.username as requested_by_name,
           u.email as requested_by_email,
           a.username as approved_by_name,
           COUNT(ri.id) as item_count,
           SUM(ri.quantity_requested) as total_quantity_requested,
           SUM(ri.quantity_approved) as total_quantity_approved,
           SUM(ri.quantity_fulfilled) as total_quantity_fulfilled
    FROM requisitions r
    LEFT JOIN users u ON r.requested_by = u.id
    LEFT JOIN users a ON r.approved_by = a.id
    LEFT JOIN requisition_items ri ON r.id = ri.requisition_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ` AND r.status = ?`;
    params.push(status);
  }
  
  if (department) {
    query += ` AND r.department = ?`;
    params.push(department);
  }
  
  if (priority) {
    query += ` AND r.priority = ?`;
    params.push(priority);
  }
  
  // Non-admin users can only see their own requisitions
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    query += ` AND r.requested_by = ?`;
    params.push(req.user.id);
  }
  
  query += ` GROUP BY r.id ORDER BY r.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get single requisition with items
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { db } = req.app.locals;
  
  // Get requisition details
  const requisitionQuery = `
    SELECT r.*, 
           u.username as requested_by_name,
           u.email as requested_by_email,
           a.username as approved_by_name
    FROM requisitions r
    LEFT JOIN users u ON r.requested_by = u.id
    LEFT JOIN users a ON r.approved_by = a.id
    WHERE r.id = ?
  `;
  
  db.get(requisitionQuery, [id], (err, requisition) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && requisition.requested_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get requisition items
    const itemsQuery = `
      SELECT ri.*, 
             i.name as inventory_name,
             i.sku as inventory_sku,
             u.name as unit_name,
             u.abbreviation as unit_abbr
      FROM requisition_items ri
      LEFT JOIN inventory i ON ri.inventory_id = i.id
      LEFT JOIN units u ON ri.unit_id = u.id
      WHERE ri.requisition_id = ?
      ORDER BY ri.created_at
    `;
    
    db.all(itemsQuery, [id], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get approval history
      const approvalsQuery = `
        SELECT ra.*, u.username as approver_name
        FROM requisition_approvals ra
        LEFT JOIN users u ON ra.approver_id = u.id
        WHERE ra.requisition_id = ?
        ORDER BY ra.approval_level, ra.created_at
      `;
      
      db.all(approvalsQuery, [id], (err, approvals) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          ...requisition,
          items,
          approvals
        });
      });
    });
  });
});

// Create new requisition
router.post('/', (req, res) => {
  const { title, description, department, priority, required_date, items, notes } = req.body;
  const { db } = req.app.locals;
  
  if (!title || !items || items.length === 0) {
    return res.status(400).json({ error: 'Title and items are required' });
  }
  
  const requisitionNumber = generateRequisitionNumber();
  const totalEstimatedCost = items.reduce((sum, item) => sum + (item.quantity_requested * item.estimated_unit_cost), 0);
  
  db.run(`INSERT INTO requisitions (requisition_number, title, description, requested_by, department, 
           priority, required_date, total_estimated_cost, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [requisitionNumber, title, description, req.user.id, department, priority, required_date, totalEstimatedCost, notes],
    function(err) {
      if (err) {
        console.error('Error creating requisition:', err);
        return res.status(400).json({ error: 'Requisition creation failed' });
      }
      
      const requisitionId = this.lastID;
      
      // Insert requisition items
      let itemsInserted = 0;
      const itemErrors = [];
      
      items.forEach((item, index) => {
        const totalCost = item.quantity_requested * item.estimated_unit_cost;
        
        db.run(`INSERT INTO requisition_items (requisition_id, inventory_id, item_name, description,
                quantity_requested, unit_id, estimated_unit_cost, total_estimated_cost, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [requisitionId, item.inventory_id, item.item_name, item.description, 
           item.quantity_requested, item.unit_id, item.estimated_unit_cost, totalCost, item.notes],
          function(itemErr) {
            if (itemErr) {
              itemErrors.push(`Item ${index + 1}: ${itemErr.message}`);
            }
            
            itemsInserted++;
            
            if (itemsInserted === items.length) {
              if (itemErrors.length > 0) {
                return res.status(400).json({ 
                  error: 'Some items failed to insert', 
                  details: itemErrors 
                });
              }
              
              logUserActivity(db, req.user.id, 'create', `Created requisition: ${requisitionNumber}`, 
                `${items.length} items, Total: $${totalEstimatedCost}`, req);
              
              res.json({ 
                message: 'Requisition created successfully', 
                id: requisitionId,
                requisition_number: requisitionNumber
              });
            }
          }
        );
      });
    }
  );
});

// Update requisition
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, department, priority, required_date, notes, status } = req.body;
  const { db } = req.app.locals;
  
  // Check if user can update this requisition
  db.get('SELECT * FROM requisitions WHERE id = ?', [id], (err, requisition) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }
    
    // Only allow updates by the requester (if draft) or admin/manager
    const canUpdate = (
      (requisition.requested_by === req.user.id && requisition.status === 'draft') ||
      req.user.role === 'admin' ||
      req.user.role === 'manager'
    );
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Cannot update this requisition' });
    }
    
    db.run(`UPDATE requisitions SET title = ?, description = ?, department = ?, priority = ?, 
            required_date = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, description, department, priority, required_date, notes, status || requisition.status, id],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Update failed' });
        }
        
        logUserActivity(db, req.user.id, 'update', `Updated requisition: ${requisition.requisition_number}`, 
          `Status: ${status || requisition.status}`, req);
        
        res.json({ message: 'Requisition updated successfully' });
      }
    );
  });
});

// Submit requisition for approval
router.post('/:id/submit', (req, res) => {
  const { id } = req.params;
  const { db } = req.app.locals;
  
  db.get('SELECT * FROM requisitions WHERE id = ? AND requested_by = ?', [id, req.user.id], (err, requisition) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }
    
    if (requisition.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft requisitions can be submitted' });
    }
    
    db.run('UPDATE requisitions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['submitted', id],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Submit failed' });
        }
        
        logUserActivity(db, req.user.id, 'update', `Submitted requisition: ${requisition.requisition_number}`, 
          'Status changed to submitted', req);
        
        res.json({ message: 'Requisition submitted successfully' });
      }
    );
  });
});

// Approve/Reject requisition
router.post('/:id/approve', (req, res) => {
  const { id } = req.params;
  const { action, comments } = req.body; // action: 'approve' or 'reject'
  const { db } = req.app.locals;
  
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers and admins can approve requisitions' });
  }
  
  db.get('SELECT * FROM requisitions WHERE id = ?', [id], (err, requisition) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }
    
    if (requisition.status !== 'submitted' && requisition.status !== 'pending_approval') {
      return res.status(400).json({ error: 'Requisition is not in a state that can be approved/rejected' });
    }
    
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const approvedDate = action === 'approve' ? new Date().toISOString() : null;
    const rejectionReason = action === 'reject' ? comments : null;
    
    db.run(`UPDATE requisitions SET status = ?, approved_by = ?, approved_date = ?, 
            rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStatus, req.user.id, approvedDate, rejectionReason, id],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Approval/rejection failed' });
        }
        
        // If approved, update all items to approved status
        if (action === 'approve') {
          db.run('UPDATE requisition_items SET status = ?, quantity_approved = quantity_requested WHERE requisition_id = ?',
            ['approved', id]);
        }
        
        logUserActivity(db, req.user.id, 'update', 
          `${action === 'approve' ? 'Approved' : 'Rejected'} requisition: ${requisition.requisition_number}`, 
          comments, req);
        
        res.json({ message: `Requisition ${action}d successfully` });
      }
    );
  });
});

// Delete requisition
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { db } = req.app.locals;
  
  db.get('SELECT * FROM requisitions WHERE id = ?', [id], (err, requisition) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }
    
    // Only allow deletion by the requester (if draft) or admin
    const canDelete = (
      (requisition.requested_by === req.user.id && requisition.status === 'draft') ||
      req.user.role === 'admin'
    );
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Cannot delete this requisition' });
    }
    
    db.run('DELETE FROM requisitions WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Delete failed' });
      }
      
      logUserActivity(db, req.user.id, 'delete', `Deleted requisition: ${requisition.requisition_number}`, null, req);
      
      res.json({ message: 'Requisition deleted successfully' });
    });
  });
});

// Get requisition statistics
router.get('/stats/dashboard', (req, res) => {
  const { db } = req.app.locals;
  
  const queries = {
    total: 'SELECT COUNT(*) as count FROM requisitions',
    pending: "SELECT COUNT(*) as count FROM requisitions WHERE status IN ('submitted', 'pending_approval')",
    approved: "SELECT COUNT(*) as count FROM requisitions WHERE status = 'approved'",
    rejected: "SELECT COUNT(*) as count FROM requisitions WHERE status = 'rejected'",
    myRequisitions: 'SELECT COUNT(*) as count FROM requisitions WHERE requested_by = ?'
  };
  
  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    const params = key === 'myRequisitions' ? [req.user.id] : [];
    
    db.get(query, params, (err, result) => {
      if (err) {
        console.error(`Error in query ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = result.count;
      }
      
      completed++;
      if (completed === total) {
        res.json(stats);
      }
    });
  });
});

export default router;