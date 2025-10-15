# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Virtual Lab LMS is a full-stack Learning Management System for virtual laboratory experiments. It uses a **monorepo structure** with separate frontend and backend applications designed for independent deployment.

### Tech Stack
- **Frontend**: React 18, React Router v6, Tailwind CSS, Framer Motion, Axios
- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication, Mongoose ODM
- **Deployment**: Frontend on Vercel, Backend on Render, Database on MongoDB Cloud

### Architecture
- **Frontend**: SPA with context-based state management (AuthContext, LabContext)
- **Backend**: RESTful API with JWT authentication, role-based access control
- **Database**: MongoDB with Mongoose schemas for Users, Courses, Labs, Assignments
- **Authentication**: JWT tokens with role-based permissions (student/teacher)

## Common Development Commands

### Local Development
```bash
# Install all dependencies (root, backend, frontend)
npm run install-all

# Start both frontend and backend concurrently
npm run dev

# Start backend only
npm run server

# Start frontend only  
npm run client

# Seed database with sample data
npm run seed
```

### Backend-Specific Commands
```bash
cd backend

# Development with nodemon
npm run dev

# Production start
npm start

# Run tests
npm test

# Seed database
npm run seed
```

### Frontend-Specific Commands
```bash
cd frontend

# Development server
npm start

# Build for production
npm run build

# Test components
npm test
```

## Deployment Configuration

### Current Issue Fix: Frontend API Configuration
The primary deployment issue is that the frontend's `REACT_APP_API_URL` environment variable is not set in production, causing API calls to default to `localhost:5000`.

**Fix Steps:**
1. Set `REACT_APP_API_URL` environment variable in Vercel dashboard
2. Value should be your Render backend URL (e.g., `https://your-backend-name.onrender.com`)
3. Redeploy frontend after setting the environment variable

### Environment Variables

#### Backend (.env)
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

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_APP_NAME=Virtual Lab LMS
```

## Code Architecture

### Frontend Structure
- **Context Management**: `AuthContext` handles user authentication, `LabContext` manages courses/labs state
- **API Layer**: Centralized in `src/api/index.js` with axios interceptors for authentication
- **Components**: Reusable UI components with error boundaries
- **Pages**: Route-specific pages with protected routes for authenticated users
- **Labs**: Interactive virtual laboratory components (Physics, Chemistry, Electronics)

### Backend Structure
- **Routes**: RESTful API endpoints organized by feature (`auth.js`, `courses.js`, `labs.js`, `users.js`)
- **Models**: Mongoose schemas for data modeling
- **Middleware**: Authentication, error handling, rate limiting
- **Security**: Helmet, CORS, JWT authentication, input validation

### Key API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/courses` - List courses (requires auth)
- `POST /api/courses/:id/enroll` - Course enrollment
- `GET /api/labs/:id` - Lab details
- `POST /api/labs/:id/submit` - Submit lab results

## Authentication Flow
1. User logs in via `POST /api/auth/login`
2. JWT token stored in localStorage
3. Axios interceptor adds token to all requests
4. Backend middleware validates token and populates `req.user`
5. Role-based access control checks user permissions

## Assignment & Submission Flow

### Data Structure
- **Course**: Contains array of `assignments`
- **Assignment**: Contains `assignedStudents` array and `submissions` array
- **Submission**: Nested within assignment, contains student work and optional `grade`

### Student Workflow
1. `GET /api/courses/student/assignments` - Fetch assigned assignments
2. Complete virtual lab simulation
3. `POST /api/courses/{courseId}/submissions` - Submit assignment with `assignmentId` and `content`

### Teacher Workflow
1. `GET /api/courses/teacher/submissions` - Fetch all submissions from teacher's courses
2. `POST /api/courses/{courseId}/submissions/{submissionId}/grade` - Grade submission with `marks` and `feedback`

### Key Points
- Submissions are stored in `course.assignments[x].submissions`, not directly on course
- Student must be in `assignment.assignedStudents` to submit
- Teacher must be course owner to view/grade submissions

## API Configuration

### Centralized API Instance
The project uses a centralized API instance in `frontend/src/api/index.js` that:
- Configures the base URL from `REACT_APP_API_URL` environment variable
- Adds JWT authentication headers automatically
- Handles request/response interceptors

**Important**: All API calls should use the configured `API` instance, not raw `axios`.

```javascript
// ✅ Correct - uses configured API instance
import API from '../api/index';
const response = await API.get('/api/courses');

// ❌ Incorrect - bypasses environment configuration
import axios from 'axios';
const response = await axios.get('/api/courses'); // Will call localhost!
```

## Common Debugging Issues

### 1. "Failed to load resource: 404" on `/api/courses`
**Cause**: Frontend trying to call localhost instead of deployed backend
**Root Cause**: LabContext.js was using raw `axios` instead of the configured `API` instance
**Fix**: 
1. Set `REACT_APP_API_URL` environment variable in Vercel
2. Update LabContext.js to use `import API from '../api/index'` instead of raw axios
3. Replace all `axios.get/post/put/patch` calls with `API.get/post/put/patch`

### 2. CORS errors in production
**Cause**: Backend CORS configuration doesn't include frontend domain
**Fix**: Add frontend URL to `CLIENT_URL` environment variable in backend

### 3. Authentication failures
**Cause**: JWT token expired or missing
**Debug**: Check localStorage for token, verify JWT_SECRET matches between environments

### 4. Database connection issues
**Cause**: Invalid MONGODB_URI or network restrictions
**Debug**: Check backend logs for connection errors, verify MongoDB Atlas whitelist

### 5. Build failures
**Cause**: Missing dependencies or Node.js version mismatch
**Fix**: Ensure Node.js >=16.0.0, run `npm run install-all`

### 6. Student submissions not showing in teacher dashboard
**Cause**: Multiple potential issues in submission flow
**Debug Steps**:
1. Check browser console for API errors in both student and teacher views
2. Verify assignment has `courseId` field populated
3. Ensure student is in `assignedStudents` array for the assignment
4. Check that submission endpoint uses correct courseId: `/api/courses/{courseId}/submissions`
**Common Fix**: Update components to use configured `API` instance instead of raw `fetch()` calls

## Testing

### Frontend Tests
- Uses Jest and React Testing Library
- Run with `cd frontend && npm test`
- Focus on component rendering and user interactions

### Backend Tests  
- Uses Jest and Supertest for API testing
- Run with `cd backend && npm test`
- Tests API endpoints, middleware, and database operations

## Development Workflow

### Adding New Features
1. Backend: Create/update models, routes, and middleware
2. Frontend: Update API functions, context, and components
3. Test both frontend and backend integration
4. Update environment variables if needed

### Virtual Lab Development
- Labs are React components in `frontend/src/labs/`
- Each lab should be self-contained with its own state management
- Use consistent UI patterns and error handling
- Implement progress tracking and result submission

## Production Deployment Checklist

### Backend (Render)
- [ ] Set all required environment variables
- [ ] Configure MongoDB connection string
- [ ] Set NODE_ENV=production
- [ ] Verify CORS configuration includes frontend domain

### Frontend (Vercel)
- [ ] Set REACT_APP_API_URL to backend URL
- [ ] Verify build completes successfully
- [ ] Test API connectivity after deployment
- [ ] Check browser console for errors

### Database (MongoDB Atlas)
- [ ] Configure IP whitelist for backend hosting
- [ ] Set up database indexes for performance
- [ ] Verify connection string format

## Security Considerations

- JWT tokens have 7-day expiration
- Rate limiting: 100 requests per 15-minute window
- Input validation on all API endpoints
- Role-based access control for courses and labs
- CORS configured for production domains only
- Helmet middleware for security headers