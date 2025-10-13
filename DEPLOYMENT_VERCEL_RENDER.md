# Virtual Lab LMS - Vercel + Render + MongoDB Atlas Deployment

## 🚀 Complete Deployment Guide

### **Frontend Deployment (Vercel)**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix enrollment errors and image loading"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build settings:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Environment Variables in Vercel:**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_APP_NAME=Virtual Lab LMS
   REACT_APP_VERSION=1.0.0
   ```

### **Backend Deployment (Render)**

1. **Create Render Service:**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set configuration:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

2. **Environment Variables in Render:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-lab-lms
   JWT_SECRET=your-super-secure-production-jwt-secret-key
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-frontend-url.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### **Database Setup (MongoDB Atlas)**

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account
   - Create new cluster (M0 Sandbox is free)

2. **Configure Database:**
   - Create database user with read/write permissions
   - Whitelist IP addresses (0.0.0.0/0 for all IPs)
   - Get connection string

3. **Connection String Format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/virtual-lab-lms?retryWrites=true&w=majority
   ```

### **CORS Configuration**

Update your backend CORS settings in `backend/server.js:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

### **Testing Your Deployment**

1. **Frontend**: https://your-app.vercel.app
2. **Backend API**: https://your-backend.onrender.com/api/health
3. **Database**: Check MongoDB Atlas dashboard

### **Common Issues & Solutions**

#### **Issue 1: CORS Errors**
- **Solution**: Update CORS origin in backend to include your Vercel URL

#### **Issue 2: Images Not Loading**
- **Solution**: Use reliable CDN URLs or host images on Vercel

#### **Issue 3: API Connection Failed**
- **Solution**: Check environment variables and network connectivity

#### **Issue 4: Database Connection**
- **Solution**: Verify MongoDB Atlas connection string and IP whitelist

### **Production Checklist**

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] CORS configured
- [ ] SSL certificates active
- [ ] Domain configured (optional)

### **Monitoring**

1. **Vercel Analytics**: Monitor frontend performance
2. **Render Logs**: Check backend logs for errors
3. **MongoDB Atlas**: Monitor database performance
4. **Uptime Monitoring**: Set up alerts for downtime

## 🎉 **Your Virtual Lab LMS is Live!**

Once deployed, your application will be accessible at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Database**: MongoDB Atlas (managed)

All enrollment errors and image loading issues have been fixed!
