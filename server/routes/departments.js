import express from 'express';
import { logUserActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Get all departments
router.get('/', (req, res) => {
  const { db } = req.app.locals;
  
  const query = `
    SELECT d.*, 
           COUNT(u.id) as user_count
    FROM departments d
    LEFT JOIN users u ON d.name = u.department
    GROUP BY d.id
    ORDER BY d.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create department
router.post('/', (req, res) => {
  const { name, description, manager, location } = req.body;
  const { db } = req.app.locals;

  db.run('INSERT INTO departments (name, description, manager, location) VALUES (?, ?, ?, ?)',
    [name, description, manager, location],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Department creation failed' });
      }
      
      logUserActivity(db, req.user.id, 'create', `Created department: ${name}`, description, req);
      
      res.json({ message: 'Department created successfully', id: this.lastID });
    }
  );
});

// Update department
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, manager, location } = req.body;
  const { db } = req.app.locals;

  db.run('UPDATE departments SET name = ?, description = ?, manager = ?, location = ? WHERE id = ?',
    [name, description, manager, location, id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Department update failed' });
      }
      
      logUserActivity(db, req.user.id, 'update', `Updated department: ${name}`, description, req);
      
      res.json({ message: 'Department updated successfully' });
    }
  );
});

// Delete department
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { db } = req.app.locals;

  // Get department info for logging
  db.get('SELECT name FROM departments WHERE id = ?', [id], (err, department) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Check if department is used by users
    db.get('SELECT COUNT(*) as count FROM users WHERE department = ?', [department?.name], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.count > 0) {
        return res.status(400).json({ error: 'Cannot delete department with assigned users' });
      }

      // Delete department
      db.run('DELETE FROM departments WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Delete failed' });
        }
        
        if (department) {
          logUserActivity(db, req.user.id, 'delete', `Deleted department: ${department.name}`, null, req);
        }
        
        res.json({ message: 'Department deleted successfully' });
      });
    });
  });
});

export default router;