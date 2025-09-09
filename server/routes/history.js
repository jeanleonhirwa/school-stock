const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/history - Get complete borrow/return history with filters
router.get('/history', async (req, res) => {
    try {
        const { student, class_name, date_from, date_to, material, return_status } = req.query;

        let query = `
            SELECT 
                bm.id,
                s.full_name,
                s.class,
                s.section_or_trade,
                m.name as material_name,
                bm.quantity,
                bm.borrow_date,
                bm.is_returned,
                bm.return_date,
                CASE 
                    WHEN bm.is_returned = TRUE THEN 'Returned'
                    WHEN DATEDIFF(CURDATE(), bm.borrow_date) > 7 THEN 'Overdue'
                    ELSE 'Borrowed'
                END as status,
                DATEDIFF(CURDATE(), bm.borrow_date) as days_since_borrow
            FROM borrowed_materials bm
            JOIN students s ON bm.student_id = s.id
            JOIN materials m ON bm.material_id = m.id
            WHERE 1=1
        `;

        const params = [];

        // Apply filters
        if (student) {
            query += ' AND s.full_name LIKE ?';
            params.push(`%${student}%`);
        }

        if (class_name) {
            query += ' AND s.class LIKE ?';
            params.push(`%${class_name}%`);
        }

        if (date_from) {
            query += ' AND bm.borrow_date >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND bm.borrow_date <= ?';
            params.push(date_to);
        }

        if (material) {
            query += ' AND m.name LIKE ?';
            params.push(`%${material}%`);
        }

        if (return_status) {
            if (return_status === 'returned') {
                query += ' AND bm.is_returned = TRUE';
            } else if (return_status === 'borrowed') {
                query += ' AND bm.is_returned = FALSE';
            } else if (return_status === 'overdue') {
                query += ' AND bm.is_returned = FALSE AND DATEDIFF(CURDATE(), bm.borrow_date) > 7';
            }
        }

        query += ' ORDER BY bm.borrow_date DESC';

        const [rows] = await db.execute(query, params);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total materials
        const [materialCount] = await db.execute('SELECT COUNT(*) as total FROM materials');
        
        // Get total students
        const [studentCount] = await db.execute('SELECT COUNT(*) as total FROM students');
        
        // Get currently borrowed items
        const [borrowedCount] = await db.execute('SELECT COUNT(*) as total FROM borrowed_materials WHERE is_returned = FALSE');
        
        // Get overdue items (more than 7 days)
        const [overdueCount] = await db.execute(`
            SELECT COUNT(*) as total 
            FROM borrowed_materials 
            WHERE is_returned = FALSE AND DATEDIFF(CURDATE(), borrow_date) > 7
        `);

        // Get low stock items (less than 5)
        const [lowStockItems] = await db.execute(`
            SELECT name, quantity_available 
            FROM materials 
            WHERE quantity_available < 5 
            ORDER BY quantity_available ASC
        `);

        // Get most borrowed materials
        const [popularMaterials] = await db.execute(`
            SELECT 
                m.name,
                COUNT(bm.id) as borrow_count
            FROM materials m
            LEFT JOIN borrowed_materials bm ON m.id = bm.material_id
            GROUP BY m.id, m.name
            ORDER BY borrow_count DESC
            LIMIT 5
        `);

        res.json({
            total_materials: materialCount[0].total,
            total_students: studentCount[0].total,
            currently_borrowed: borrowedCount[0].total,
            overdue_items: overdueCount[0].total,
            low_stock_items: lowStockItems,
            popular_materials: popularMaterials
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
