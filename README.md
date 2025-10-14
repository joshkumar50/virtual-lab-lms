# Virtual Lab LMS

A comprehensive Learning Management System for virtual laboratory experiments, designed for engineering and college students.

## 🚀 Features

- **Interactive Virtual Labs**: Physics, Chemistry, Electronics, and more
- **Course Management**: Create and manage courses with assignments
- **Student Progress Tracking**: Monitor learning progress and performance
- **Teacher Dashboard**: Comprehensive tools for educators
- **Real-time Collaboration**: Interactive lab sessions
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Framer Motion
- Tailwind CSS
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose ODM

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd virtual-lab-lms
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if local)
   mongod
   
   # Seed the database
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:3000

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   - Import your repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables**
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CLIENT_URL=https://your-frontend-domain.vercel.app
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically detect the configuration from `vercel.json`
   - Both frontend and backend will be deployed

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Backend Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/virtual-lab-lms
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (teacher only)
- `POST /api/courses/:id/enroll` - Enroll in course

### Labs
- `GET /api/labs` - Get all labs
- `GET /api/labs/:id` - Get single lab
- `POST /api/labs/:id/start` - Start lab session
- `POST /api/labs/:id/submit` - Submit lab results

## 🧪 Virtual Labs

### Available Labs
1. **Ohm's Law Lab** - Electrical circuit analysis
2. **Logic Gate Simulator** - Digital logic circuits
3. **Double Slit Experiment** - Wave interference
4. **Chemistry Lab** - Chemical reactions
5. **Circuit Analysis** - Advanced circuit theory

### Lab Features
- Interactive simulations
- Real-time parameter adjustment
- Progress tracking
- Automatic grading
- Detailed feedback

## 👥 User Roles

### Student
- Enroll in courses
- Access virtual labs
- Submit assignments
- Track progress
- View grades

### Teacher
- Create courses and labs
- Manage students
- Grade submissions
- Monitor progress
- Generate reports

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in environment variables

2. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

3. **CORS Errors**
   - Update CLIENT_URL in backend environment
   - Ensure frontend URL is whitelisted

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Development Tips

- Use `npm run dev` for concurrent development
- Check browser console for frontend errors
- Monitor backend logs for API issues
- Use React DevTools for debugging

## 📝 Scripts

```bash
# Development
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only

# Production
npm run build        # Build frontend
npm start           # Start production server

# Database
npm run seed         # Seed database with sample data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Updates

### Recent Fixes
- Fixed `.map()` error in courses page
- Added comprehensive error boundaries
- Improved API response handling
- Enhanced Vercel deployment compatibility
- Added missing API endpoints
- Fixed authentication flow
- Improved error handling throughout the application

---

**Built with ❤️ for education**