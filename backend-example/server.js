// 🚀 Simple HealthyWallet Backend Server Example
// This is a minimal backend server to get you started

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 2000;

// CORS Configuration - CRITICAL for frontend connectivity
app.use(cors({
  origin: [
    'http://localhost:3000',        // React dev server
    'http://127.0.0.1:3000',       // Alternative localhost
    'http://192.168.0.145:3000'    // Your local network IP
  ],
  credentials: true,               // REQUIRED for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================
// HEALTH CHECK ENDPOINTS
// ========================
// Health endpoint at /health (as per your setup)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HealthyWallet Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Also provide health at /api/health for compatibility
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HealthyWallet Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// ========================
// AUTHENTICATION ENDPOINTS
// ========================
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Mock successful registration
  res.json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: '1',
        name: name || 'Test User',
        email: email || 'test@example.com'
      },
      token: 'mock-jwt-token-' + Date.now()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock successful login
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: email || 'test@example.com'
      },
      token: 'mock-jwt-token-' + Date.now()
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Mock user info
  res.json({
    success: true,
    data: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }
  });
});

// ========================
// INCOME ENDPOINTS
// ========================
app.get('/api/income', (req, res) => {
  // Mock income data
  const mockIncomes = [
    {
      _id: '1',
      amount: 5000,
      source: 'Salary',
      category: 'salary',
      date: new Date().toISOString().split('T')[0],
      description: 'Monthly salary'
    },
    {
      _id: '2',
      amount: 500,
      source: 'Freelance',
      category: 'freelance',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      description: 'Web development project'
    }
  ];

  res.json({
    success: true,
    data: mockIncomes
  });
});

app.post('/api/income', (req, res) => {
  const { amount, source, category, date, description } = req.body;
  
  // Mock successful creation
  res.json({
    success: true,
    message: 'Income created successfully',
    data: {
      _id: Date.now().toString(),
      amount: parseFloat(amount),
      source,
      category: category || 'other',
      date,
      description
    }
  });
});

// ========================
// EXPENSE ENDPOINTS
// ========================
app.get('/api/expenses', (req, res) => {
  // Mock expense data
  const mockExpenses = [
    {
      _id: '1',
      amount: 50,
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      description: 'Lunch at restaurant'
    },
    {
      _id: '2',
      amount: 100,
      category: 'bills',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      description: 'Internet bill'
    }
  ];

  res.json({
    success: true,
    data: mockExpenses
  });
});

app.post('/api/expenses', (req, res) => {
  const { amount, category, date, description } = req.body;
  
  // Mock successful creation
  res.json({
    success: true,
    message: 'Expense created successfully',
    data: {
      _id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      date,
      description
    }
  });
});

// ========================
// GOALS ENDPOINTS
// ========================
app.get('/api/goals', (req, res) => {
  // Mock goals data
  const mockGoals = [
    {
      _id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6500,
      category: 'savings',
      targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: 'active'
    }
  ];

  res.json({
    success: true,
    data: mockGoals
  });
});

// ========================
// REPORTS ENDPOINTS
// ========================
app.get('/api/reports/dashboard', (req, res) => {
  // Mock dashboard data
  res.json({
    success: true,
    data: {
      yearlyOverview: {
        income: 60000,
        expenses: 36000
      },
      monthlyOverview: {
        income: 5000,
        expenses: 3000,
        savings: 2000,
        savingsRate: 40
      },
      previousMonthOverview: {
        balance: 22000
      },
      activeGoals: [
        {
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 6500,
          remainingAmount: 3500,
          daysRemaining: 90
        }
      ],
      recentTransactions: {
        income: [
          {
            _id: '1',
            amount: 5000,
            source: 'Salary',
            date: new Date().toISOString().split('T')[0]
          }
        ],
        expenses: [
          {
            _id: '1',
            amount: 50,
            category: 'food',
            date: new Date().toISOString().split('T')[0]
          }
        ]
      },
      categoryBreakdown: {
        income: [
          { _id: 'salary', total: 5000 }
        ],
        expenses: [
          { _id: 'food', total: 150 },
          { _id: 'bills', total: 300 }
        ]
      },
      financialHealth: {
        score: 85,
        status: {
          level: 'Excellent',
          message: 'Your financial health is excellent! Keep up the good work.'
        }
      }
    }
  });
});

app.get('/api/reports/trend-analysis', (req, res) => {
  const months = parseInt(req.query.months) || 12;
  
  // Mock trend data
  const mockTrends = [];
  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    mockTrends.unshift({
      month: date.toISOString().slice(0, 7),
      income: 4500 + Math.random() * 1000,
      expenses: 2500 + Math.random() * 1000,
      goalProgress: 60 + Math.random() * 20,
      savingsRate: 30 + Math.random() * 20
    });
  }

  res.json({
    success: true,
    data: mockTrends
  });
});

// ========================
// ERROR HANDLING
// ========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} not found`
  });
});

app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ========================
// START SERVER
// ========================
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 HealthyWallet Backend Server Started!');
  console.log('=====================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('=====================================');
  console.log('✅ CORS enabled for frontend origins');
  console.log('✅ All API endpoints configured');
  console.log('✅ Ready to accept requests!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  process.exit(0);
});
