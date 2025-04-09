<<<<<<< HEAD
# Voting-app
Voting APP With Python And React
=======
# Employee Voting System

A web application for employees to vote for their best colleagues. Built with Python Flask backend and React frontend.

## Features

- User authentication (login/register)
- Voting system where users can vote for 3 employees
- Admin panel to view results
- Secure database storage
- Modern and responsive UI

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Initialize the database:
   ```bash
   python init_db.py
   ```

6. Run the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Access the application at `http://localhost:3000`
2. Register a new account or use the default admin credentials:
   - Username: admin
   - Password: admin123
3. Log in and cast your vote for 3 employees
4. Admin users can access the admin panel to view voting results

## Security Notes

- The default admin credentials should be changed in production
- Implement proper password hashing in production
- Use environment variables for sensitive configuration
- Enable HTTPS in production

## License

MIT 
>>>>>>> 88a4b5ce5 (Initial commit)
