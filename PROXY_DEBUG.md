# 🔧 Proxy Connection Debug Guide

## 🚨 **Current Error:**
```
Proxy error: Could not proxy request /api/settings from 192.168.0.145:3000 to http://localhost:2000.
ECONNREFUSED
```

## 🔍 **What This Error Means:**
- ✅ **Proxy is configured correctly** in `package.json`: `"proxy": "http://localhost:2000"`
- ❌ **Backend server is NOT running** on port 2000
- ❌ **Connection refused** = No server listening on that port

## 🧪 **Diagnostic Steps:**

### **1. Check if Backend is Running:**
```bash
# Test if anything is listening on port 2000
lsof -i :2000

# Or use netstat
netstat -an | grep 2000

# Or try telnet
telnet localhost 2000
```

### **2. Test Backend Directly:**
```bash
# Your curl command (this should work if backend is running)
curl http://localhost:2000/api/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWM5MWUyNzhiYTViNzRmYzJiZDk2MCIsImlhdCI6MTc1NjI0MTI1MCwiZXhwIjoxNzU2MzI3NjUwfQ.2o5FwkNKKioCD9Ur-qrdYO6v6QmQE1XCA_CGF5GdHTE" \
  -H "Content-Type: application/json"
```

### **3. Check Backend Health:**
```bash
# Test health endpoint
curl http://localhost:2000/health
curl http://localhost:2000/api/health
```

## 🎯 **Most Likely Issues:**

### **Issue 1: Backend Not Started**
**Solution:** Start your backend server
```bash
# Navigate to your backend directory
cd /path/to/your/backend

# Start the server (common commands)
npm start
# or
node server.js
# or
npm run dev
```

### **Issue 2: Backend Running on Wrong Port**
**Check:** Is your backend actually running on port 2000?
- Look at your backend server logs
- Check your backend's port configuration

**If backend is on different port (e.g., 3001):**
```json
// Update package.json
{
  "proxy": "http://localhost:3001"
}
```

### **Issue 3: Environment Variable Override**
**Check:** Does your backend use environment variables for port?
```bash
# Common environment variables
echo $PORT
echo $BACKEND_PORT
echo $API_PORT
```

## 🚀 **Quick Fix Steps:**

### **Step 1: Verify Backend Status**
```bash
# Check what's running on your system
lsof -i -P | grep LISTEN | grep :2000
```

### **Step 2: Start Backend** (if not running)
```bash
# Go to your backend directory and start it
cd /path/to/your/backend
npm start
```

### **Step 3: Verify Connection**
```bash
# Test the exact endpoint
curl http://localhost:2000/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Step 4: Restart React App** (after backend is running)
```bash
# Stop React app (Ctrl+C)
# Start React app
npm start
```

## 🎯 **Expected Success:**

When backend is running correctly:
```bash
$ curl http://localhost:2000/api/settings -H "Authorization: Bearer ..."
{
  "success": true,
  "data": {
    "theme": "light",
    "currency": "EUR",
    ...
  }
}
```

## 📞 **Need Help?**

Run these commands and share the output:
```bash
# 1. Check if backend is running
lsof -i :2000

# 2. Test backend directly
curl http://localhost:2000/health

# 3. Check React app proxy
cat package.json | grep proxy
```

**The proxy configuration is correct - you just need to start your backend server on port 2000! 🚀**
