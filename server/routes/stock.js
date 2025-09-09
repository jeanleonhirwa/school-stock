const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/stock - Get current stock levels
router.get('/stock', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                id,
                name,
                quantity_available,
                created_at
            FROM materials
            ORDER BY name ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/stock - Add new material or update existing stock
router.post('/stock', async (req, res) => {
    try {
        const { name, quantity } = req.body;

        // Validate required fields
        if (!name || quantity === undefined || quantity < 0) {
            return res.status(400).json({ error: 'Name and valid quantity are required' });
        }

        // Check if material already exists
        const [existingRows] = await db.execute(
            'SELECT * FROM materials WHERE name = ?',
            [name]
        );

        if (existingRows.length > 0) {
            // Update existing material quantity
            await db.execute(
                'UPDATE materials SET quantity_available = quantity_available + ? WHERE name = ?',
                [quantity, name]
            );

            res.json({
                message: 'Stock updated successfully',
                material: name,
                quantity_added: quantity
            });
        } else {
            // Create new material
            const [insertResult] = await db.execute(
                'INSERT INTO materials (name, quantity_available) VALUES (?, ?)',
                [name, quantity]
            );

            res.status(201).json({
                message: 'New material added successfully',
                material_id: insertResult.insertId,
                material: name,
                quantity: quantity
            });
        }

    } catch (error) {
        console.error('Error managing stock:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Material with this name already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// PUT /api/stock/:id - Update material quantity directly
router.put('/stock/:id', async (req, res) => {
    try {
        const materialId = req.params.id;
        const { quantity_available } = req.body;

        if (quantity_available === undefined || quantity_available < 0) {
            return res.status(400).json({ error: 'Valid quantity is required' });
        }

        const [result] = await db.execute(
            'UPDATE materials SET quantity_available = ? WHERE id = ?',
            [quantity_available, materialId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.json({
            message: 'Stock quantity updated successfully',
            material_id: materialId,
            new_quantity: quantity_available
        });

    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
