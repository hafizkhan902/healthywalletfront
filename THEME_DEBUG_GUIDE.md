# 🐛 Theme State Debug Guide

## 🔍 **Debug Steps:**

### **1. Open Browser Console**
- Open Chrome DevTools (F12)
- Go to Console tab

### **2. Test Theme Toggle**
1. Go to Settings page
2. Toggle Dark/Light mode
3. Watch console output

### **3. Expected Console Output:**

#### **When Changing Theme:**
```
🔧 Changing setting theme from "light" to "dark"
📝 Updated formData: {theme: "dark", currency: "USD", ...}
🎨 Applying theme: dark formData.theme: dark
⚠️ Backend unavailable, saving to localStorage
✅ Settings updated in localStorage
✅ Setting theme updated to: dark Backend result: {theme: "dark", ...}
```

#### **If Theme Reverts:**
```
🔄 Updating form data from settings: {theme: "light", ...}
🎨 Applying theme: light formData.theme: light
```

## 🎯 **What to Look For:**

### **✅ Good Behavior:**
- `formData.theme` changes to "dark"
- Theme applies correctly
- No "Updating form data from settings" after the change

### **❌ Bad Behavior:**
- `formData.theme` changes to "dark" then back to "light"
- "Updating form data from settings" appears after theme change
- Theme reverts automatically

## 🔧 **Possible Issues & Solutions:**

### **Issue 1: Backend Returns Wrong Data**
**Symptoms:** Theme saves but backend returns different value
**Solution:** Check your backend `/api/settings` response

### **Issue 2: Settings State Override**
**Symptoms:** `formData` gets overridden after successful update
**Solution:** The `saving` flag should prevent this (already fixed)

### **Issue 3: localStorage Mapping Issue**
**Symptoms:** localStorage saves wrong value
**Solution:** Check localStorage mapping in `useSettings.js`

## 🧪 **Test Commands:**

### **Check localStorage:**
```javascript
// In browser console
localStorage.getItem('healthywallet-theme')
```

### **Check Current Settings State:**
```javascript
// In React DevTools Components tab
// Find Settings component and check:
// - formData.theme
// - settings.theme
```

## 📊 **Next Steps:**

1. **Test with console open** and share the exact console output
2. **Check if theme persists** after page refresh
3. **Verify localStorage value** matches your selection

The debug logs will show exactly where the state is getting reset! 🕵️‍♂️
