# 💸 Expense Tracker – MERN Stack Interactive Finance Dashboard

An intuitive full-stack Expense Tracker web application built using the **MERN stack** (MongoDB, Express, React, Node.js). This app allows users to manage their finances effectively, with smart visualization, real-time updates, and downloadable reports.

> 🎯 **Inspired by:** [Time to Program](https://timetoprogram.com) & [Aadarsh-max/Expense-Tracker](https://github.com/Aadarsh-max/Expense-Tracker)

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=for-the-badge&logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Tailwind CSS, Recharts, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **File Export** | xlsx (Excel file generation) |

---

## 💡 Key Features

### 📊 Dynamic Finance Dashboard
- Displays **Total Balance**, **Income**, and **Expenses** in beautiful cards
- **Pie Charts** showing expense breakdown by category
- **Bar Charts** for income by source visualization
- **Line Charts** for income vs expense trends over time
- Recent transactions list with real-time updates

### ➕ Add Transactions
- Add income and expenses using clean, responsive forms
- **Emoji Picker** for fun and intuitive categorization
- Support for custom categories and dates

### 📁 Download Data
- Export your financial data as an **Excel sheet** with one click
- Separate downloads for income and expenses

### ⚡ Real-Time Updates
- All transactions update instantly across charts and summaries
- Smart categorization of transactions by type

### 🔐 Authentication
- Secure user registration and login
- JWT-based authentication with protected routes
- Password hashing with bcrypt

---

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (login/register)
│   │   ├── incomeController.js   # Income CRUD + Excel export
│   │   ├── expenseController.js  # Expense CRUD + Excel export
│   │   └── dashboardController.js # Dashboard statistics
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Income.js             # Income schema
│   │   └── Expense.js            # Expense schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Charts/           # Pie, Bar, Line charts
│   │   │   ├── Dashboard/        # InfoCard, TransactionList
│   │   │   ├── layouts/          # Sidebar, Navbar, DashboardLayout
│   │   │   └── EmojiPicker.jsx
│   │   ├── context/
│   │   │   └── UserContext.jsx   # Auth state management
│   │   ├── pages/
│   │   │   ├── Auth/             # Login, Register
│   │   │   ├── Dashboard/
│   │   │   ├── Income/
│   │   │   └── Expense/
│   │   ├── utils/
│   │   │   ├── axiosInstance.js  # API configuration
│   │   │   └── helper.js         # Utilities & API calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** installed
- **MongoDB** installed locally or MongoDB Atlas account
- **npm** or **yarn** package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` with your settings:**
```env
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
```

```bash
# Start the backend server
npm run dev
```

✅ Backend running at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

✅ Frontend running at `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

1. **Register** a new account
2. **Login** with your credentials
3. Start tracking your **income** and **expenses**!

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |

### Income
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/income` | Get all income |
| POST | `/api/income` | Add new income |
| DELETE | `/api/income/:id` | Delete income |
| GET | `/api/income/download/excel` | Download Excel |

### Expense
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expense` | Get all expenses |
| POST | `/api/expense` | Add new expense |
| DELETE | `/api/expense/:id` | Delete expense |
| GET | `/api/expense/download/excel` | Download Excel |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

---

## 🎨 Screenshots

### 🏠 Dashboard
- Total balance, income, and expense cards with gradient styling
- Income vs Expense line/area chart
- Expense breakdown pie chart
- Income by source bar chart
- Recent transactions list

### 💰 Income Page
- Add income with emoji picker
- Income distribution pie chart
- Income by source bar chart
- Income history list with delete option
- Export to Excel button

### 💸 Expense Page
- Add expenses with category emoji picker
- Expense by category pie chart
- Expense trend line chart
- Expense history list with delete option
- Export to Excel button

### 🔐 Auth Pages
- Beautiful split-screen login/register design
- Form validation with toast notifications
- Password visibility toggle

---

## 🎯 Key Highlights

- ✅ **Beautiful Dark Theme UI** with Tailwind CSS
- ✅ **Multiple Chart Types** (Pie, Bar, Line/Area)
- ✅ **Emoji Picker** for transaction categorization
- ✅ **Excel Export** functionality
- ✅ **JWT Authentication** with protected routes
- ✅ **Fully Responsive** design
- ✅ **Real-time Updates** across all components
- ✅ **Modern Animations** and transitions

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Time to Program](https://timetoprogram.com) - For project inspiration
- [Aadarsh-max/Expense-Tracker](https://github.com/Aadarsh-max/Expense-Tracker) - For UI/UX inspiration
- [Recharts](https://recharts.org/) - For beautiful charts
- [Tailwind CSS](https://tailwindcss.com/) - For styling

---

**Built with ❤️ using the MERN Stack**
