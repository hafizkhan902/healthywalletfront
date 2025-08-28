# Reports Component - Backend API Integration Guide

## 🔍 Current Situation

The **Reports component** is using **hardcoded data** instead of real backend APIs. Here's what needs to be implemented:

### 📊 Reports Component Data Requirements

#### **1. Expense Data for Pie Chart**
- **Current**: Hardcoded expense array
- **Needed**: Real expense data with categories
- **Used for**: Category breakdown pie chart

#### **2. Income Data for Analysis**  
- **Current**: Hardcoded income array
- **Needed**: Real income data with sources
- **Used for**: Income vs expense comparison

#### **3. Monthly Trend Data**
- **Current**: Hardcoded 3-month data
- **Needed**: Dynamic monthly trends (6-12 months)
- **Used for**: Bar chart showing income/expense trends

---

## 🛠 Backend Endpoints Needed

### **✅ Available Endpoints**

#### **1. Dashboard Data** - `/api/reports/dashboard`
```bash
curl -X GET http://localhost:2000/api/reports/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyOverview": {
      "income": 5000,
      "expenses": 3000,
      "savings": 2000,
      "savingsRate": 40
    },
    "categoryBreakdown": {
      "expenses": [
        { "_id": "food", "total": 150 },
        { "_id": "bills", "total": 300 }
      ]
    },
    "recentTransactions": {
      "income": [...],
      "expenses": [...]
    }
  }
}
```

#### **2. Trend Analysis** - `/api/reports/trend-analysis`
```bash
curl -X GET http://localhost:2000/api/reports/trend-analysis?months=6 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": "2024-01",
      "income": 4500,
      "expenses": 2500,
      "savingsRate": 44.4
    }
  ]
}
```

### **❌ Missing Endpoints (Need Implementation)**

#### **3. Category Analysis** - `/api/reports/category-analysis`
```bash
curl -X GET http://localhost:2000/api/reports/category-analysis?period=12 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "category": "Food",
        "amount": 570.50,
        "percentage": 28.5,
        "count": 3
      },
      {
        "category": "Bills", 
        "amount": 1000.00,
        "percentage": 50.0,
        "count": 2
      }
    ],
    "totalExpenses": 2000.00
  }
}
```

#### **4. Monthly Report** - `/api/reports/monthly/{year}/{month}`
```bash
curl -X GET http://localhost:2000/api/reports/monthly/2024/01 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "month": "2024-01",
    "income": {
      "total": 5420,
      "sources": [
        { "source": "Salary", "amount": 3500 },
        { "source": "Freelance", "amount": 500 },
        { "source": "Investment", "amount": 1420 }
      ]
    },
    "expenses": {
      "total": 2125,
      "categories": [
        { "category": "Food", "amount": 570.50 },
        { "category": "Bills", "amount": 1000.00 }
      ]
    },
    "savings": 3295
  }
}
```

---

## 🔧 Implementation Steps

### **Step 1: Add Missing Backend Endpoints**

Add these endpoints to `backend-example/server.js`:

```javascript
// Category Analysis Endpoint
app.get('/api/reports/category-analysis', (req, res) => {
  const period = parseInt(req.query.period) || 12;
  
  // This should aggregate real expense data by category
  const categoryData = [
    { category: 'Food', amount: 570.50, percentage: 28.5, count: 3 },
    { category: 'Bills', amount: 1000.00, percentage: 50.0, count: 2 },
    { category: 'Transport', amount: 225.00, percentage: 11.3, count: 2 },
    { category: 'Entertainment', amount: 240.00, percentage: 12.0, count: 1 },
    { category: 'Other', amount: 89.99, percentage: 4.5, count: 1 }
  ];
  
  res.json({
    success: true,
    data: {
      expenses: categoryData,
      totalExpenses: categoryData.reduce((sum, cat) => sum + cat.amount, 0),
      period: period
    }
  });
});

// Monthly Report Endpoint  
app.get('/api/reports/monthly/:year/:month', (req, res) => {
  const { year, month } = req.params;
  
  // This should aggregate real data for the specific month
  res.json({
    success: true,
    data: {
      month: `${year}-${month.padStart(2, '0')}`,
      income: {
        total: 5420,
        sources: [
          { source: 'Salary', amount: 3500 },
          { source: 'Freelance', amount: 500 },
          { source: 'Investment', amount: 1420 }
        ]
      },
      expenses: {
        total: 2125,
        categories: [
          { category: 'Food', amount: 570.50 },
          { category: 'Bills', amount: 1000.00 },
          { category: 'Transport', amount: 225.00 },
          { category: 'Entertainment', amount: 240.00 },
          { category: 'Other', amount: 89.99 }
        ]
      },
      savings: 3295
    }
  });
});
```

### **Step 2: Update Reports Component**

Replace hardcoded data with API calls:

```javascript
// In Reports.js - replace useState with useEffect + API calls
const [expenseData, setExpenseData] = useState([]);
const [incomeData, setIncomeData] = useState([]);
const [monthlyData, setMonthlyData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadReportsData();
}, []);

const loadReportsData = async () => {
  try {
    setLoading(true);
    
    // Load category analysis for pie chart
    const categoryResponse = await reportsAPI.getCategoryAnalysis(12);
    if (categoryResponse.success) {
      // Transform to expected format
      const expenses = categoryResponse.data.expenses.map(cat => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage
      }));
      setExpenseData(expenses);
    }
    
    // Load trend analysis for bar chart
    const trendResponse = await reportsAPI.getTrendAnalysis(6);
    if (trendResponse.success) {
      setMonthlyData(trendResponse.data);
    }
    
    // Load dashboard for income data
    const dashboardResponse = await reportsAPI.getDashboard();
    if (dashboardResponse.success) {
      setIncomeData(dashboardResponse.data.recentTransactions.income);
    }
    
  } catch (error) {
    console.error('Failed to load reports data:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testing the Integration

### **Test Current Available Endpoints:**
```bash
# Test dashboard endpoint
curl -X GET http://localhost:2000/api/reports/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test trend analysis
curl -X GET http://localhost:2000/api/reports/trend-analysis?months=6 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **After Adding Missing Endpoints:**
```bash
# Test category analysis
curl -X GET http://localhost:2000/api/reports/category-analysis?period=12 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test monthly report
curl -X GET http://localhost:2000/api/reports/monthly/2024/01 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Next Steps

1. **Add missing backend endpoints** (category-analysis, monthly report)
2. **Update Reports component** to use real API calls
3. **Add loading states** and error handling
4. **Test with real data** from income/expense endpoints
5. **Optimize data aggregation** for better performance

Would you like me to implement the frontend integration first, or would you prefer to add the missing backend endpoints?
