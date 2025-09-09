# School Stock Management System - Setup Guide

## Prerequisites

1. **XAMPP** - Make sure MySQL is running
2. **Node.js** - Version 14 or higher
3. **npm** - Comes with Node.js

## Database Setup

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin or MySQL command line
3. Run the SQL script from `server/database/schema.sql`:
   ```sql
   -- This will create the database and tables with sample data
   ```

## Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Check `.env` file and update database credentials if needed
   - Default settings work with XAMPP default configuration

4. Start the backend server:
   ```bash
   npm start
   ```
   
   The server will run on http://localhost:5000

## Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   
   The app will open at http://localhost:3000

## Testing the Application

### 1. Database Connection Test
- Visit http://localhost:5000/api/health
- Should return: `{"message": "School Stock Management API is running!"}`

### 2. Stock Data Test
- Visit http://localhost:5000/api/stock
- Should return list of materials with quantities

### 3. Frontend Test
- Open http://localhost:3000
- You should see the School Stock Management interface

## Usage Flow

1. **Add/Manage Stock** (Admin)
   - Go to "Manage Stock" tab
   - Add new materials or update quantities

2. **Borrow Items** (Students)
   - Go to "Borrow Items" tab
   - Fill out student information and select materials

3. **Process Returns** (Admin)
   - Go to "Return Items" tab
   - Mark items as returned

4. **View Dashboard** (Admin)
   - Go to "Dashboard" tab
   - See statistics and alerts

5. **Check History** (Admin)
   - Go to "History" tab
   - Filter and export records

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/stock` - Get all materials
- `POST /api/stock` - Add new material
- `PUT /api/stock/:id` - Update material quantity
- `POST /api/borrow` - Create borrow record
- `GET /api/borrowed` - Get currently borrowed items
- `POST /api/return/:id` - Mark item as returned
- `GET /api/history` - Get complete history with filters
- `GET /api/stats` - Get dashboard statistics

## Troubleshooting

### Database Connection Issues
- Ensure XAMPP MySQL is running
- Check database credentials in `.env`
- Verify database `school_stock` exists

### Port Conflicts
- Backend runs on port 5000
- Frontend runs on port 3000
- Change ports in respective configuration files if needed

### CORS Issues
- CORS is configured to allow frontend requests
- Proxy is set up in client package.json

## Default Test Data

The system comes with:
- 6 cleaning materials (Mops, Brooms, etc.)
- 4 sample students
- Ready to use for testing

## Features Included

✅ Student borrowing form with validation
✅ Return management with overdue tracking
✅ Stock management with low stock alerts
✅ Admin dashboard with statistics
✅ Complete history with filtering
✅ CSV export functionality
✅ Responsive design (mobile-friendly)
✅ Real-time stock updates
✅ Transaction integrity
✅ Error handling and user feedback
