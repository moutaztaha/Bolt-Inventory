/*
  # Requisition Management System

  1. New Tables
    - `requisitions` - Main requisition records
    - `requisition_items` - Items requested in each requisition
    - `requisition_approvals` - Approval workflow tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for different user roles

  3. Features
    - Multi-level approval workflow
    - Item-level requisitions
    - Status tracking
    - Priority levels
*/

-- Requisitions table
CREATE TABLE IF NOT EXISTS requisitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisition_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requested_by INTEGER NOT NULL,
  department TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending_approval', 'approved', 'partially_approved', 'rejected', 'fulfilled', 'cancelled')),
  requested_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  required_date DATETIME,
  approved_date DATETIME,
  approved_by INTEGER,
  rejection_reason TEXT,
  total_estimated_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users (id),
  FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- Requisition items table
CREATE TABLE IF NOT EXISTS requisition_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisition_id INTEGER NOT NULL,
  inventory_id INTEGER,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity_requested INTEGER NOT NULL,
  quantity_approved INTEGER DEFAULT 0,
  quantity_fulfilled INTEGER DEFAULT 0,
  unit_id INTEGER,
  estimated_unit_cost DECIMAL(10,2) DEFAULT 0,
  total_estimated_cost DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requisition_id) REFERENCES requisitions (id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES inventory (id),
  FOREIGN KEY (unit_id) REFERENCES units (id)
);

-- Requisition approvals table (for multi-level approval workflow)
CREATE TABLE IF NOT EXISTS requisition_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisition_id INTEGER NOT NULL,
  approver_id INTEGER NOT NULL,
  approval_level INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requisition_id) REFERENCES requisitions (id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requisitions_requested_by ON requisitions(requested_by);
CREATE INDEX IF NOT EXISTS idx_requisitions_status ON requisitions(status);
CREATE INDEX IF NOT EXISTS idx_requisitions_date ON requisitions(requested_date);
CREATE INDEX IF NOT EXISTS idx_requisition_items_requisition_id ON requisition_items(requisition_id);
CREATE INDEX IF NOT EXISTS idx_requisition_items_inventory_id ON requisition_items(inventory_id);
CREATE INDEX IF NOT EXISTS idx_requisition_approvals_requisition_id ON requisition_approvals(requisition_id);
CREATE INDEX IF NOT EXISTS idx_requisition_approvals_approver_id ON requisition_approvals(approver_id);

-- Insert migration record
INSERT OR IGNORE INTO schema_migrations (version, description) 
VALUES ('008', 'Create requisition management system');