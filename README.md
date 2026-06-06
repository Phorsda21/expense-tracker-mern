# Expense Tracker

A full-stack MERN web application to track your personal income and expenses. Features AI-powered receipt scanning, bank statement import, multi-currency support, and detailed financial dashboards.

## Features

*   **Dashboard**: View your total balance, income vs. expense overview with interactive charts (pie & bar).
*   **Income Management**: Add, view, and delete income entries with emoji icons and date tracking.
*   **Expense Management**: Add, view, and delete expenses by category with emoji icons and date tracking.
*   **AI Receipt Scanner**: Upload a receipt image and let Google Gemini AI automatically extract the amount, category, and date.
*   **AI Bank Statement Import**: Upload a PDF bank statement and Gemini AI parses all transactions — review and selectively import them as income or expenses.
*   **Multi-Currency Support**: Set your preferred currency with custom exchange rates.
*   **Export to Excel**: Download your income and expense data as `.xlsx` files.
*   **Authentication**: Secure user registration and login using JWT-based authentication.
*   **Toast Notifications**: Real-time feedback for all user actions.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI component library |
| **Vite** | Build tool and dev server |
| **Tailwind CSS v3** | Utility-first styling |
| **React Router DOM v6** | Client-side navigation |
| **Recharts** | Pie charts and bar charts |
| **Axios** | HTTP requests to the backend API |
| **React Toastify** | Toast notification system |
| **React Icons** | Icon library |
| **Emoji Picker React** | Emoji selector for transaction icons |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | HTTP server and API routing |
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose** | MongoDB ODM / schema modeling |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Google Gemini AI** | Receipt scanning & bank statement parsing |
| **Multer** | File upload handling (images & PDFs) |
| **pdf-parse** | PDF text extraction for bank statements |
| **xlsx** | Excel file generation for data export |
| **Tesseract.js** | OCR engine (installed, available for image text extraction) |

---

## Project Structure

```
expense-tracker/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handler logic
│   │   ├── authController.js
│   │   ├── currencyController.js
│   │   ├── dashboardController.js
│   │   ├── expenseController.js
│   │   ├── incomeController.js
│   │   ├── receiptController.js
│   │   └── statementController.js
│   ├── middleware/     # Auth middleware (JWT verification)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express route definitions
│   ├── server.js       # Express app entry point
│   └── .env.example    # Environment variable template
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components & layouts
    │   ├── context/    # React context (UserContext)
    │   ├── pages/      # Page-level components
    │   │   ├── Auth/           # Login & Register
    │   │   ├── Dashboard/
    │   │   ├── Income/
    │   │   ├── Expense/
    │   │   ├── Currency/
    │   │   └── ImportStatement/
    │   └── utils/      # Helper utilities
    ├── index.html
    └── vite.config.js
```

---

## How to Run

Follow these steps to run the application locally.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Set Up the Backend

Navigate to the `backend` folder and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder. Use `.env.example` as a reference:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/

# JWT secret key (use a strong, random string in production)
JWT_SECRET=your_super_secret_jwt_key_here

# Server port
PORT=5000

# Google Gemini API key (required for receipt scanning & statement import)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Get a free Gemini API key** at [aistudio.google.com](https://aistudio.google.com). Without it, the AI receipt scanner and bank statement import features will not work.

Start the backend development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Set Up the Frontend

Open a **new** terminal window, navigate to the `frontend` folder, and install dependencies:

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App

Go to your browser and visit: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive a JWT | No |
| `GET` | `/api/income` | Get all income records | Yes |
| `POST` | `/api/income` | Add a new income record | Yes |
| `DELETE` | `/api/income/:id` | Delete an income record | Yes |
| `GET` | `/api/expense` | Get all expense records | Yes |
| `POST` | `/api/expense` | Add a new expense record | Yes |
| `DELETE` | `/api/expense/:id` | Delete an expense record | Yes |
| `GET` | `/api/dashboard` | Get dashboard summary data | Yes |
| `GET` | `/api/currency` | Get user currency settings | Yes |
| `POST` | `/api/currency` | Update currency settings | Yes |
| `POST` | `/api/receipt/scan` | Scan a receipt image with Gemini AI | Yes |
| `POST` | `/api/statement/parse` | Parse a bank statement PDF with Gemini AI | Yes |
| `POST` | `/api/statement/import` | Import parsed transactions into the database | Yes |
| `GET` | `/api/health` | API health check | No |
