# Virtual Lab LMS - Deployment Guide

## 🚀 Quick Deployment Checklist

### Prerequisites
- [ ] Node.js (v16 or higher) installed
- [ ] MongoDB (local or MongoDB Atlas) running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd virtual-lab-lms
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your configuration:
   # - MongoDB connection string
   # - JWT secret key
   # - Other settings as needed
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Backend Deployment (Node.js/Express)

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-lab-lms
   JWT_SECRET=your-super-secure-jwt-secret-key
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-frontend-domain.com
   ```

2. **Build and Start**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

#### Frontend Deployment (React)

1. **Build the application**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to hosting service**
   - Upload the `build` folder to your hosting service
   - Configure environment variables if needed
   - Set up proper routing for SPA

### Database Setup

1. **MongoDB Atlas (Recommended)**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get the connection string
   - Update `MONGODB_URI` in your environment file

2. **Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Use `mongodb://localhost:27017/virtual-lab-lms`

### Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS configuration
- [ ] Enable rate limiting
- [ ] Use environment variables for sensitive data
- [ ] Regular security updates

### Testing

1. **Backend Tests**
   ```bash
   cd backend
   npm test
   ```

2. **Frontend Tests**
   ```bash
   cd frontend
   npm test
   ```

### Monitoring & Maintenance

- [ ] Set up error logging
- [ ] Monitor database performance
- [ ] Regular backups
- [ ] Update dependencies regularly
- [ ] Monitor application performance

## 🧪 Available Labs

### Physics Labs
1. **Pendulum Lab** - Harmonic motion simulation with realistic physics
2. **Double Slit Experiment** - Wave interference and diffraction simulation

### Engineering Labs
1. **Logic Gate Simulator** - AND, OR, NOT gates with interactive controls
2. **Circuit Analysis Lab** - Electrical circuit simulation and analysis

### Chemistry Labs
1. **pH Color Change Lab** - Acid-base reactions and color changes

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB service is running
   - Verify connection string
   - Check network connectivity

2. **Port Already in Use**
   - Change PORT in environment file
   - Kill existing processes on the port

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Support

For issues and questions:
- Check the README.md file
- Review the troubleshooting section
- Open an issue in the repository

## 📝 Notes

- The application uses JWT for authentication
- All labs are interactive and responsive
- The system supports both student and teacher roles
- Progress tracking is built-in
- Real-time physics simulations are implemented

