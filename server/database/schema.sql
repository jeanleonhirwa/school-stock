-- School Stock Management System Database Schema
-- Database: school_stock

CREATE DATABASE IF NOT EXISTS school_stock;
USE school_stock;

-- Students table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    section_or_trade VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    quantity_available INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Borrowed materials table
CREATE TABLE borrowed_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    borrow_date DATE NOT NULL,
    is_returned BOOLEAN DEFAULT FALSE,
    return_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

-- Insert default cleaning materials
INSERT INTO materials (name, quantity_available) VALUES
('Mops', 10),
('Brooms', 15),
('Long Broom', 8),
('Slashes', 12),
('Brushes', 20),
('Hoes', 6);

-- Insert sample students for testing
INSERT INTO students (full_name, class, section_or_trade) VALUES
('John Doe', 'Form 2', 'A'),
('Jane Smith', 'Form 3', 'B'),
('Mike Johnson', 'Trade A', 'Carpentry'),
('Sarah Wilson', 'Form 1', 'C');
