const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/return/:id - Mark borrow record as returned
router.post('/return/:id', async (req, res) => {
    try {
        const borrowId = req.params.id;
        const return_date = new Date().toISOString().split('T')[0]; // Current date

        // Check if borrow record exists and is not already returned
        const [borrowRows] = await db.execute(
            'SELECT * FROM borrowed_materials WHERE id = ? AND is_returned = FALSE',
            [borrowId]
        );

        if (borrowRows.length === 0) {
            return res.status(404).json({ error: 'Borrow record not found or already returned' });
        }

        const borrowRecord = borrowRows[0];

        // Start transaction
        await db.execute('START TRANSACTION');

        try {
            // Mark as returned
            await db.execute(
                'UPDATE borrowed_materials SET is_returned = TRUE, return_date = ? WHERE id = ?',
                [return_date, borrowId]
            );

            // Update material stock (add back the quantity)
            await db.execute(
                'UPDATE materials SET quantity_available = quantity_available + ? WHERE id = ?',
                [borrowRecord.quantity, borrowRecord.material_id]
            );

            // Commit transaction
            await db.execute('COMMIT');

            res.json({
                message: 'Item returned successfully',
                return_date: return_date
            });

        } catch (error) {
            // Rollback transaction on error
            await db.execute('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error returning item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/borrowed - Get all currently borrowed items
router.get('/borrowed', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                bm.id,
                s.full_name,
                s.class,
                s.section_or_trade,
                m.name as material_name,
                bm.quantity,
                bm.borrow_date,
                DATEDIFF(CURDATE(), bm.borrow_date) as days_borrowed
            FROM borrowed_materials bm
            JOIN students s ON bm.student_id = s.id
            JOIN materials m ON bm.material_id = m.id
            WHERE bm.is_returned = FALSE
            ORDER BY bm.borrow_date ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching borrowed items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
