# Virtual Lab LMS

A comprehensive Learning Management System with interactive virtual laboratory experiences for engineering and college students.

## 🎯 Features

- **Interactive Virtual Labs**: 
  - Physics: Pendulum Lab, Double Slit Experiment
  - Engineering: Logic Gate Simulator, Circuit Analysis Lab
  - Chemistry: pH Color Change Lab
- **Role-Based Access**: Student and Teacher accounts
- **Course Management**: Enroll in courses, access lab modules
- **Progress Tracking**: Submit results, monitor completion
- **Modern UI**: Clean, responsive design with TailwindCSS
- **Accessibility**: Keyboard navigation, clear instructions
- **Real-time Physics**: Advanced simulations with realistic physics

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd virtual-lab-lms
npm run install-all
```

2. **Set up environment variables:**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection string
```

3. **Start the application:**
```bash
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🧪 Virtual Labs

### Physics Labs
- **Pendulum Lab**: Harmonic motion simulation with realistic physics, material effects, and environment settings
- **Double Slit Experiment**: Wave interference and diffraction with interactive controls

### Engineering Labs
- **Logic Gate Simulator**: Interactive AND, OR, NOT gates with real-time visualization
- **Circuit Analysis Lab**: Electrical circuit simulation with components and calculations

### Chemistry Labs
- **pH Color Change Lab**: Acid-base reactions and color change experiments

## 🛠 Tech Stack

- **Frontend**: React, TailwindCSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **State Management**: Context API
- **Authentication**: JWT tokens

## 📁 Project Structure

```
virtual-lab-lms/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── labs/          # Virtual lab simulations
│   │   ├── context/       # React Context for state
│   │   └── utils/         # Utility functions
├── backend/           # Node.js API
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── utils/         # Backend utilities
└── docs/              # Documentation
```

## 🎓 Usage

### For Students
1. Register/Login with student account
2. Browse available courses
3. Enroll in courses
4. Access virtual labs
5. Complete experiments and submit results

### For Teachers
1. Register/Login with teacher account
2. Create and manage courses
3. Monitor student progress
4. Review submissions
5. Track completion status

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

### Building for Production
```bash
npm run build
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.
