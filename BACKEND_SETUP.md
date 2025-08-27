# 🔧 Backend Setup Guide for HealthyWallet

## 🚨 **IMPORTANT: You Need a Backend Server!**

The proxy error `ECONNREFUSED` means **no backend server is running on port 2000**.

### 🎯 **Quick Solution: Use the Example Backend**

I've created a complete example backend server for you:

```bash
# 1. Navigate to the backend example
cd backend-example

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

**That's it!** Your frontend should now work perfectly.

## 📡 **How the Proxy Works**

- **Frontend** (`package.json`): `"proxy": "http://localhost:2000"` 
  - React forwards `/api/*` requests to port 2000
- **Backend**: Must run on port 2000 and handle API requests
  - **No proxy configuration needed in backend**
  - Just needs to listen on port 2000

## 🚀 Quick Fix Checklist

### 1. **Start the Backend Server**
```bash
cd backend-example
npm install
npm start
```

### 2. **Verify It's Running**
```bash
# Check if backend is running on port 2000
curl http://localhost:2000/api/health
# or
netstat -an | grep 2000
```

### 2. **Check CORS Configuration**
Your backend must include these CORS settings:

```javascript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',          // Development
    'http://192.168.0.145:3000',     // Local network
    'https://yourdomain.com'          // Production
  ],
  credentials: true,                  // REQUIRED for cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
```

### 3. **Environment Variables**
Create `.env` file in your React app root:

```env
# Development
REACT_APP_BASE_API_URI=http://localhost:2000/api

# Production
REACT_APP_BASE_API_URI=https://your-backend-domain.com/api
```

## 🔍 Diagnostic Tools

### Run Network Diagnostics
Open browser console and run:
```javascript
// This will run comprehensive diagnostics
window.runNetworkDiagnostics?.();
```

### Manual Testing
Test your backend endpoints directly:

```bash
# Health check
curl -X GET http://localhost:2000/api/health \
  -H "Content-Type: application/json" \
  -v

# CORS preflight test
curl -X OPTIONS http://localhost:2000/api/health \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" on all requests
**Cause:** Backend server not running or wrong URL
**Solution:**
```bash
# Start your backend server
npm start  # or yarn start in backend directory
# Verify it's running on port 2000
```

### Issue 2: CORS policy error
**Cause:** Backend doesn't allow your frontend origin
**Solution:** Update backend CORS configuration to include your frontend URL

### Issue 3: Credentials not included
**Cause:** Backend doesn't accept credentials
**Solution:** Ensure backend CORS has `credentials: true`

### Issue 4: Network timeout
**Cause:** Slow backend response
**Solution:** The frontend now has retry logic and 10-second timeout

## 📋 Backend Requirements

Your backend should implement these endpoints:

### Health Check
```
GET /api/health
Response: { "status": "ok", "timestamp": "..." }
```

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

### Data Endpoints
```
GET /api/income
POST /api/income
GET /api/expenses
POST /api/expenses
GET /api/goals
POST /api/goals
GET /api/reports/dashboard
GET /api/reports/trend-analysis
```

## 🔧 Frontend Configuration

The frontend is configured to:

1. **Auto-retry failed requests** (3 attempts with exponential backoff)
2. **10-second request timeout**
3. **Comprehensive error logging**
4. **Network diagnostics on startup failure**
5. **Visual backend status indicator**

## 🚨 Troubleshooting Steps

1. **Check Backend Status**
   - Look for the backend status indicator in top-right corner
   - Red = Offline, Yellow = Checking, No indicator = Online

2. **Run Diagnostics**
   - Click "Diagnose" button in status indicator
   - Check browser console for detailed diagnostics

3. **Verify Network**
   - Ensure no firewall blocking port 2000
   - Check if backend is accessible from browser: `http://localhost:2000/api/health`

4. **Check Logs**
   - Frontend: Browser console
   - Backend: Server console/logs

## 📞 Need Help?

If you're still experiencing issues:

1. Check browser console for detailed error messages
2. Run the network diagnostics tool
3. Verify backend server logs
4. Ensure CORS is properly configured with credentials support

## 🎯 Production Deployment

For production deployment:

1. Update `REACT_APP_BASE_API_URI` to your production backend URL
2. Ensure production backend has CORS configured for your frontend domain
3. Use HTTPS for both frontend and backend
4. Configure proper SSL certificates

## 🔒 Security Notes

- Always use HTTPS in production
- Configure CORS to only allow your specific domains
- Implement proper authentication and authorization
- Use secure session management
- Validate all inputs on the backend
