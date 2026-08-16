# TripSplit — Trip Expense Manager

A full-stack web app for tracking group trip expenses, calculating fair shares, and settling up with the minimum number of payments.

## Features

- **Create trips** with members, dates, and emoji icons
- **Add expenses** with equal, custom ₹, or percentage splits
- **Automatic balance calculation** — `Balance = Amount Paid − Fair Share`
- **Minimum settlement algorithm** — who pays whom, fewest transactions
- **Dashboard** with stats, balances, and settlement preview
- **Expense history** with search, member/category/date filters, edit & delete
- **Member profiles** — name, emoji, color
- **Analytics charts** — contributions, categories, daily spending, balances
- **Settlement export** — copy or share via WhatsApp
- **Indian Rupees (₹)** throughout

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 19, Vite, Tailwind CSS  |
| Charts   | Recharts                      |
| Backend  | Node.js, Express.js           |
| Database | MongoDB, Mongoose             |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI
npm run dev
```

Server runs at **http://localhost:5000**

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/trips` | List all trips |
| POST   | `/api/trips` | Create trip |
| GET    | `/api/trips/:id` | Trip detail |
| PUT    | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| GET    | `/api/trips/:id/members` | List members |
| POST   | `/api/trips/:id/members` | Add member |
| GET    | `/api/trips/:id/expenses` | List expenses (filters: paidBy, category, startDate, endDate) |
| POST   | `/api/trips/:id/expenses` | Add expense |
| GET    | `/api/trips/:id/summary` | Balances + settlements + analytics data |

## Split Modes

| Mode | Description |
|------|-------------|
| **Equal** | Amount divided equally among selected members |
| **Custom ₹** | Enter exact amount each member owes (must sum to total) |
| **Percentage** | Enter % per member (must sum to 100) |

## Example

5 friends spend ₹25,000:

| Person | Paid | Fair Share | Balance |
|--------|-----:|-----------:|--------:|
| A | ₹10,000 | ₹5,000 | +₹5,000 |
| B | ₹5,000 | ₹5,000 | ₹0 |
| C | ₹4,000 | ₹5,000 | −₹1,000 |
| D | ₹3,000 | ₹5,000 | −₹2,000 |
| E | ₹3,000 | ₹5,000 | −₹2,000 |

Settlement: C→A ₹1,000, D→A ₹2,000, E→A ₹2,000

## Project Structure

```
trip-expense/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Home, Dashboard, AddExpense, etc.
│       ├── components/
│       └── utils/
└── server/          # Express API
    ├── models/
    ├── routes/
    └── utils/calculations.js
```

## License

MIT
