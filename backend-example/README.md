# 🚀 HealthyWallet Backend Example

This is a simple Express.js backend server that provides mock API endpoints for the HealthyWallet frontend.

## 🎯 Quick Start

### 1. Install Dependencies
```bash
cd backend-example
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will start on `http://localhost:2000`

## ✅ What This Provides

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - Mock login
- `POST /api/auth/register` - Mock registration  
- `GET /api/auth/me` - Get user info
- `GET /api/income` - Get income records
- `POST /api/income` - Create income record
- `GET /api/expenses` - Get expense records
- `POST /api/expenses` - Create expense record
- `GET /api/goals` - Get goals
- `GET /api/reports/dashboard` - Dashboard data
- `GET /api/reports/trend-analysis` - Trend analysis

### CORS Configuration
- Properly configured for `http://localhost:3000`
- Includes `credentials: true` for authentication
- Supports all necessary HTTP methods

### Mock Data
- Realistic sample data for testing
- Proper response formats matching your frontend expectations
- Error handling and validation

## 🔧 Customization

You can modify `server.js` to:
- Add real database connections
- Implement actual authentication
- Add more endpoints
- Customize response data

## 🧪 Testing

Test the server directly:
```bash
# Health check
curl http://localhost:2000/api/health

# Get income data
curl http://localhost:2000/api/income

# Test CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:2000/api/health
```

## 🚨 Important Notes

1. **This is for development only** - Don't use in production
2. **No real authentication** - All requests return mock success
3. **No data persistence** - Data is not saved between restarts
4. **CORS is configured** - Should work with your React frontend

## 🔄 Next Steps

Once this basic server is working with your frontend:
1. Replace with a real database (MongoDB, PostgreSQL, etc.)
2. Implement proper authentication (JWT, sessions, etc.)
3. Add data validation and sanitization
4. Implement proper error handling
5. Add logging and monitoring
