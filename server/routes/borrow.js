const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/borrow - Create a new borrow record
router.post('/borrow', async (req, res) => {
    try {
        const { student_name, class_name, section_or_trade, material_id, quantity, borrow_date } = req.body;

        // Validate required fields
        if (!student_name || !class_name || !section_or_trade || !material_id || !quantity || !borrow_date) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if material exists and has enough quantity
        const [materialRows] = await db.execute(
            'SELECT * FROM materials WHERE id = ?',
            [material_id]
        );

        if (materialRows.length === 0) {
            return res.status(404).json({ error: 'Material not found' });
        }

        const material = materialRows[0];
        if (material.quantity_available < quantity) {
            return res.status(400).json({ 
                error: `Insufficient stock. Available: ${material.quantity_available}, Requested: ${quantity}` 
            });
        }

        // Check if student exists, if not create new student
        let student_id;
        const [studentRows] = await db.execute(
            'SELECT id FROM students WHERE full_name = ? AND class = ? AND section_or_trade = ?',
            [student_name, class_name, section_or_trade]
        );

        if (studentRows.length > 0) {
            student_id = studentRows[0].id;
        } else {
            // Create new student
            const [insertResult] = await db.execute(
                'INSERT INTO students (full_name, class, section_or_trade) VALUES (?, ?, ?)',
                [student_name, class_name, section_or_trade]
            );
            student_id = insertResult.insertId;
        }

        // Check if student already has unreturned items of the same material
        const [existingBorrow] = await db.execute(
            'SELECT * FROM borrowed_materials WHERE student_id = ? AND material_id = ? AND is_returned = FALSE',
            [student_id, material_id]
        );

        if (existingBorrow.length > 0) {
            return res.status(400).json({ 
                error: 'Student already has unreturned items of this material' 
            });
        }

        // Start transaction
        await db.execute('START TRANSACTION');

        try {
            // Create borrow record
            const [borrowResult] = await db.execute(
                'INSERT INTO borrowed_materials (student_id, material_id, quantity, borrow_date) VALUES (?, ?, ?, ?)',
                [student_id, material_id, quantity, borrow_date]
            );

            // Update material stock
            await db.execute(
                'UPDATE materials SET quantity_available = quantity_available - ? WHERE id = ?',
                [quantity, material_id]
            );

            // Commit transaction
            await db.execute('COMMIT');

            res.status(201).json({
                message: 'Borrow record created successfully',
                borrow_id: borrowResult.insertId,
                student_id: student_id
            });

        } catch (error) {
            // Rollback transaction on error
            await db.execute('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error creating borrow record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
