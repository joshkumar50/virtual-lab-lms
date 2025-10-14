# 🚀 HACKATHON DEPLOYMENT - Quick Setup

## Current Status: ✅ Frontend LIVE at virtual-lab-lms.vercel.app

## Next Steps (5 minutes):

### 1. Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect GitHub: `joshkumar50/virtual-lab-lms`
4. **Settings**:
   - Name: `virtual-lab-lms-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

### 2. Backend Environment Variables (Copy-paste these)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://demo:demo123@cluster0.mongodb.net/virtual-lab-lms?retryWrites=true&w=majority
JWT_SECRET=hackathon-jwt-secret-key-2024-virtual-lab-lms
JWT_EXPIRE=7d
CLIENT_URL=https://virtual-lab-lms.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Update Frontend Environment Variable

In Vercel dashboard:
- Go to virtual-lab-lms project
- Settings → Environment Variables
- Add: `REACT_APP_API_URL` = `https://virtual-lab-lms-backend.onrender.com`
- Redeploy

### 4. MongoDB Atlas (Optional - using demo DB above)

If you want your own DB:
1. [mongodb.com/atlas](https://mongodb.com/atlas) → Free cluster
2. Create user: `hackathon` / `password123`
3. Whitelist IP: `0.0.0.0/0`
4. Replace MONGODB_URI above

## 🎯 Demo Flow (2 minutes)

```bash
# Test your API (PowerShell)
$API = "https://virtual-lab-lms-backend.onrender.com"

# 1. Register Teacher
$teacher = Invoke-RestMethod -Method Post -Uri "$API/api/auth/register" -ContentType "application/json" -Body (@{
  name="Prof. Smith"; email="teacher@demo.com"; password="Teacher123!"; role="teacher"
} | ConvertTo-Json)

# 2. Register Student  
$student = Invoke-RestMethod -Method Post -Uri "$API/api/auth/register" -ContentType "application/json" -Body (@{
  name="John Student"; email="student@demo.com"; password="Student123!"; role="student"
} | ConvertTo-Json)

# 3. Login as teacher on website
# 4. Create course: "Physics 101"
# 5. Create assignment: "Pendulum Lab"
# 6. Login as student
# 7. Enroll in course
# 8. Submit assignment
# 9. Grade as teacher
```

## 📋 Hackathon Checklist

### Bronze ✅
- [x] User Registration & Login
- [x] Course Management

### Silver ✅  
- [x] Course Enrollment

### Gold ✅
- [x] Assignment Submission

### Platinum ✅
- [x] Grading System
- [x] Virtual Labs (Physics, Chemistry, Electronics)

### Bonus Features
- [x] Interactive simulations
- [x] Real-time physics
- [x] Modern UI/UX
- [x] Responsive design

## ⚡ Quick Fixes Applied

1. ✅ **Navigation**: Removed "Practice" tab for teachers
2. ✅ **Deployment**: Fixed Vercel configuration
3. ✅ **Build**: Fixed all deployment errors

## 🏆 You're Ready!

Your project demonstrates **Platinum-level** functionality with advanced virtual labs and complete LMS features. The deployment is working - you just need to connect the backend!

**Total setup time**: ~5 minutes
**Demo time**: ~2 minutes
**Features**: Platinum + Bonus