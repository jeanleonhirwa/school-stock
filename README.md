# School Stock Management System

A full-stack application for managing the borrowing and returning of cleaning materials in a school environment.

## Technologies Used

### Frontend
- React.js
- Manual CSS (no frameworks)
- Axios for API communication

### Backend
- Node.js with Express.js
- MySQL database

## Features

- Student borrowing form for cleaning materials
- Return management system
- Admin dashboard for stock management
- Complete borrowing/return history
- Stock level monitoring

## Setup Instructions

### Database Setup
1. Start XAMPP and ensure MySQL is running
2. Create database `school_stock`
3. Run the SQL schema provided in `/server/database/schema.sql`

### Backend Setup
```bash
cd server
npm install
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## Database Schema

The system uses three main tables:
- `students`: Student information
- `materials`: Available cleaning materials
- `borrowed_materials`: Borrowing records with return status

## API Endpoints

- `POST /api/borrow` - Create borrow record
- `POST /api/return/:id` - Mark item as returned
- `GET /api/stock` - Get current stock levels
- `POST /api/stock` - Add new material
- `GET /api/borrowed` - Get all borrowed items
- `GET /api/history` - Get complete history
