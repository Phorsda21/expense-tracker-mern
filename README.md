# Expense Tracker

A simple web application to track your income and expenses. Built with React and Node.js.

## Features

*   **Dashboard**: View your total balance, income, and expense charts.
*   **Transactions**: Add and delete income and expenses easily.
*   **Currency**: Support for multiple currencies with custom exchange rates.
*   **Export**: Download your financial data to Excel files.
*   **Secure**: Protected with secure login and registration.

## Tech Stack

This project works because these cool technologies work together:

**Frontend**
*   **React**: The library that builds the user interface.
*   **Tailwind CSS**: Makes the app look beautiful and responsive.
*   **Recharts**: Draws the pie charts and bar charts.
*   **Axios**: Talks to the backend server.
*   **React Router**: Handles navigation between pages.

**Backend**
*   **Node.js**: The environment that runs the server.
*   **Express.js**: Manages the API routes and server logic.
*   **MongoDB**: The database where data is stored.
*   **Mongoose**: Helps the server talk to the database.
*   **JSON Web Tokens (JWT)**: Keeps your login session secure.

---

## How to Run

Follow these steps to run the application on your computer.

### 1. Get the Project

Clone the repository to your local machine.

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Set Up Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Create a file named `.env` in the `backend` folder and add this:

```env
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=secret_key
PORT=5000
```

Then start the backend:

```bash
npm run dev
```

### 3. Set Up Frontend

Open a **new** terminal window and run:

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App

Go to your browser and visit: `http://localhost:3000`

