import express from 'express';
import { logUserActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Get user activity reports
router.get('/activities', (req, res) => {
  const { db } = req.app.locals;
  const { days = '30', user_id, action } = req.query;

  let query = `
    SELECT ua.*, u.username, u.email, u.role
    FROM user_activity ua
    LEFT JOIN users u ON ua.user_id = u.id
    WHERE 1=1
  `;
  
  const params = [];

  // Add date filter
  if (days !== 'all') {
    query += ` AND ua.created_at >= datetime('now', '-${parseInt(days)} days')`;
  }

  // Add user filter
  if (user_id) {
    query += ` AND ua.user_id = ?`;
    params.push(user_id);
  }

  // Add action filter
  if (action) {
    query += ` AND ua.action = ?`;
    params.push(action);
  }

  query += ` ORDER BY ua.created_at DESC LIMIT 1000`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error in reports/activities:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    logUserActivity(db, req.user.id, 'view', 'Generated activity report', `Days: ${days}`, req);
    
    res.json(rows);
  });
});

// Get user statistics
router.get('/user-stats', (req, res) => {
  const { db } = req.app.locals;
  const { days = '30' } = req.query;

  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    activeUsers: 'SELECT COUNT(*) as count FROM users WHERE is_active = 1',
    usersByRole: 'SELECT role, COUNT(*) as count FROM users GROUP BY role',
    recentLogins: `
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_activity 
      WHERE action = 'login' 
      AND created_at >= datetime('now', '-${parseInt(days)} days')
    `,
    usersByDepartment: `
      SELECT 
        COALESCE(department, 'Unassigned') as department, 
        COUNT(*) as count 
      FROM users 
      GROUP BY department
    `
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`Error in query ${key}:`, err);
        results[key] = [];
      } else {
        results[key] = rows;
      }
      
      completed++;
      if (completed === total) {
        logUserActivity(db, req.user.id, 'view', 'Generated user statistics report', `Days: ${days}`, req);
        res.json(results);
      }
    });
  });
});

// Get login analytics
router.get('/login-analytics', (req, res) => {
  const { db } = req.app.locals;
  const { days = '30' } = req.query;

  const queries = {
    loginsByDay: `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as logins
      FROM user_activity 
      WHERE action = 'login' 
      AND created_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `,
    loginsByHour: `
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as logins
      FROM user_activity 
      WHERE action = 'login' 
      AND created_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY strftime('%H', created_at)
      ORDER BY hour
    `,
    topActiveUsers: `
      SELECT 
        u.username,
        u.email,
        u.role,
        COUNT(ua.id) as activity_count
      FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.user_id
      WHERE ua.created_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY u.id
      ORDER BY activity_count DESC
      LIMIT 10
    `
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`Error in query ${key}:`, err);
        results[key] = [];
      } else {
        results[key] = rows;
      }
      
      completed++;
      if (completed === total) {
        logUserActivity(db, req.user.id, 'view', 'Generated login analytics report', `Days: ${days}`, req);
        res.json(results);
      }
    });
  });
});

// Get performance metrics
router.get('/performance-metrics', (req, res) => {
  const { db } = req.app.locals;
  const { days = '30' } = req.query;

  const queries = {
    activityTrends: `
      SELECT 
        DATE(created_at) as date,
        action,
        COUNT(*) as count
      FROM user_activity 
      WHERE created_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY DATE(created_at), action
      ORDER BY date, action
    `,
    userEngagement: `
      SELECT 
        u.username,
        u.role,
        COUNT(ua.id) as total_activities,
        COUNT(DISTINCT DATE(ua.created_at)) as active_days,
        MAX(ua.created_at) as last_activity
      FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.user_id
      WHERE ua.created_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY u.id
      HAVING total_activities > 0
      ORDER BY total_activities DESC
    `,
    systemUsage: `
      SELECT 
        action,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_activity 
      WHERE created_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY action
      ORDER BY count DESC
    `
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`Error in query ${key}:`, err);
        results[key] = [];
      } else {
        results[key] = rows;
      }
      
      completed++;
      if (completed === total) {
        logUserActivity(db, req.user.id, 'view', 'Generated performance metrics report', `Days: ${days}`, req);
        res.json(results);
      }
    });
  });
});

export default router;