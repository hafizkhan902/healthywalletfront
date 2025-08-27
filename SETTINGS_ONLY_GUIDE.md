# 🔧 Settings Backend Guide

## 📊 Current Settings Data (from your frontend)

### App Settings (Settings.js)
```javascript
healthywallet-theme: "dark" | "light"
healthywallet-currency: "USD" | "EUR" | "GBP"
healthywallet-notifications: "true" | "false" 
healthywallet-budget-alerts: "true" | "false"
healthywallet-goal-reminders: "true" | "false"
```

### Personalization Data (Profile.js)
```javascript
healthywallet-financial-goals: "text"
healthywallet-risk-tolerance: "conservative" | "moderate" | "aggressive" | "very-aggressive"
healthywallet-investment-experience: "beginner" | "intermediate" | "advanced" | "expert"
healthywallet-savings-rate: "number"
healthywallet-debt-amount: "number"
healthywallet-emergency-fund: "number"
healthywallet-retirement-age: "number"
healthywallet-dependents: "number"
healthywallet-housing-status: "rent" | "own-mortgage" | "own-outright" | "living-with-family"
healthywallet-employment-status: "employed" | "part-time" | "self-employed" | "freelancer" | "student" | "retired" | "unemployed"
healthywallet-office-days: "0-7"
healthywallet-transport-office: "number"
healthywallet-wfh-frequency: "never" | "rarely" | "sometimes" | "often" | "always"
healthywallet-education-level: "high-school" | "undergraduate" | "graduate" | "postgraduate" | "vocational"
healthywallet-transport-school: "number"
healthywallet-student-type: "full-time" | "part-time" | "online" | "evening"
healthywallet-food-preference: "home-cooked" | "mixed" | "dining-out" | "fast-food" | "organic-healthy" | "budget-conscious"
healthywallet-dining-frequency: "daily" | "few-times-week" | "weekly" | "bi-weekly" | "monthly" | "rarely"
healthywallet-impulsive-buying: "very-low" | "low" | "moderate" | "high" | "very-high"
healthywallet-impulsive-spend: "number"
healthywallet-shopping-frequency: "daily" | "few-times-week" | "weekly" | "bi-weekly" | "monthly" | "quarterly" | "rarely"
healthywallet-entertainment-budget: "number"
healthywallet-fitness-spend: "number"
healthywallet-subscriptions: "number"
healthywallet-travel-frequency: "monthly" | "quarterly" | "bi-annually" | "annually" | "rarely" | "never"
healthywallet-social-spending: "very-low" | "low" | "moderate" | "high" | "very-high"
```

## 🗄️ MongoDB Schema

```javascript
// Collection: userSettings
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  
  theme: "light",
  currency: "USD",
  notifications: true,
  budgetAlerts: true,
  goalReminders: true,
  
  financialGoals: "Emergency fund, House down payment",
  riskTolerance: "moderate",
  investmentExperience: "intermediate", 
  savingsRate: 25.5,
  debtAmount: 15000.00,
  emergencyFund: 10000.00,
  retirementAge: 65,
  dependents: 2,
  housingStatus: "rent",
  employmentStatus: "employed",
  
  officeDays: 5,
  transportOffice: 25.50,
  wfhFrequency: "often",
  educationLevel: "undergraduate",
  transportSchool: 15.00,
  studentType: "full-time",
  
  foodPreference: "mixed",
  diningFrequency: "weekly",
  impulsiveBuying: "low",
  impulsiveSpend: 200.00,
  shoppingFrequency: "monthly",
  entertainmentBudget: 300.00,
  fitnessSpend: 150.00,
  subscriptions: 45.00,
  travelFrequency: "quarterly",
  socialSpending: "moderate",
  
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## 🔌 API Endpoints

### GET /api/settings
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "currency": "USD",
    "notifications": true,
    "budgetAlerts": true,
    "goalReminders": true,
    "financialGoals": "Emergency fund",
    "riskTolerance": "moderate",
    "investmentExperience": "intermediate",
    "savingsRate": 25.5,
    "debtAmount": 15000.00,
    "emergencyFund": 10000.00,
    "retirementAge": 65,
    "dependents": 2,
    "housingStatus": "rent",
    "employmentStatus": "employed",
    "officeDays": 5,
    "transportOffice": 25.50,
    "wfhFrequency": "often",
    "educationLevel": "undergraduate",
    "transportSchool": 15.00,
    "studentType": "full-time",
    "foodPreference": "mixed",
    "diningFrequency": "weekly",
    "impulsiveBuying": "low",
    "impulsiveSpend": 200.00,
    "shoppingFrequency": "monthly",
    "entertainmentBudget": 300.00,
    "fitnessSpend": 150.00,
    "subscriptions": 45.00,
    "travelFrequency": "quarterly",
    "socialSpending": "moderate"
  }
}
```

### PUT /api/settings
```json
{
  "theme": "dark",
  "currency": "EUR",
  "notifications": false,
  "riskTolerance": "aggressive"
}
```

### POST /api/settings/migrate
```json
{
  "localStorageData": {
    "healthywallet-theme": "dark",
    "healthywallet-currency": "USD",
    "healthywallet-risk-tolerance": "moderate",
    "healthywallet-office-days": "5",
    "healthywallet-food-preference": "mixed"
  }
}
```

## 🔄 localStorage to MongoDB Mapping

```javascript
const mapping = {
  'healthywallet-theme': 'theme',
  'healthywallet-currency': 'currency',
  'healthywallet-notifications': 'notifications',
  'healthywallet-budget-alerts': 'budgetAlerts',
  'healthywallet-goal-reminders': 'goalReminders',
  'healthywallet-financial-goals': 'financialGoals',
  'healthywallet-risk-tolerance': 'riskTolerance',
  'healthywallet-investment-experience': 'investmentExperience',
  'healthywallet-savings-rate': 'savingsRate',
  'healthywallet-debt-amount': 'debtAmount',
  'healthywallet-emergency-fund': 'emergencyFund',
  'healthywallet-retirement-age': 'retirementAge',
  'healthywallet-dependents': 'dependents',
  'healthywallet-housing-status': 'housingStatus',
  'healthywallet-employment-status': 'employmentStatus',
  'healthywallet-office-days': 'officeDays',
  'healthywallet-transport-office': 'transportOffice',
  'healthywallet-wfh-frequency': 'wfhFrequency',
  'healthywallet-education-level': 'educationLevel',
  'healthywallet-transport-school': 'transportSchool',
  'healthywallet-student-type': 'studentType',
  'healthywallet-food-preference': 'foodPreference',
  'healthywallet-dining-frequency': 'diningFrequency',
  'healthywallet-impulsive-buying': 'impulsiveBuying',
  'healthywallet-impulsive-spend': 'impulsiveSpend',
  'healthywallet-shopping-frequency': 'shoppingFrequency',
  'healthywallet-entertainment-budget': 'entertainmentBudget',
  'healthywallet-fitness-spend': 'fitnessSpend',
  'healthywallet-subscriptions': 'subscriptions',
  'healthywallet-travel-frequency': 'travelFrequency',
  'healthywallet-social-spending': 'socialSpending'
};
```
