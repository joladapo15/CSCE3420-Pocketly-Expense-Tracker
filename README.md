
# Pocketly - Personal Expense Tracker

Pocketly is a web application designed to help college students manage their income, expenses, and spending habits.

## Tech Stack

- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Version Control: Git and GitHub

## Project Structure

```text
pocketly/
├── frontend/          # React application
├── backend/           # Express REST API
│   ├── server.js
│   ├── db.js
│   └── .env.example
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/joladapo15/CSCE3420-Pocketly-Expense-Tracker.git
cd CSCE3420-Pocketly-Expense-Tracker
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually http://localhost:5173.

### 3. Backend Setup

Open a separate terminal:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the database credentials.

```bash
cp .env.example .env
```

Start the backend:

```bash
node server.js
```

The backend runs on http://localhost:5001 by default.

Test the API:

http://localhost:5001/api/health

### 4. PostgreSQL Setup

Install PostgreSQL and create a local database named `pocketly_db`.

Create a login role named `pocketly_user` with a private password, then grant it the permissions needed for the application.

Update `backend/.env` with your local PostgreSQL credentials.

Run the connection test:

```bash
cd backend
node test-db.js
```

Expected output:

```text
Database connection successful!
Database: pocketly_db
User: pocketly_user
```

## Git Workflow

- `main`: Stable project code
- `feature/frontend-ui`: Frontend development
- `feature/backend-api`: Backend API development
- `feature/database`: Database development

Each member should work on their assigned feature branch and create a Pull Request before merging changes into `main`.

## Security

Never commit `.env`, passwords, or database credentials to GitHub. Use `.env.example` as a configuration template.

## Project Status

Initial development environment setup completed. Application features are under development.
