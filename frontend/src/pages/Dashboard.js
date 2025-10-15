import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLab } from '../context/LabContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Award,
  Calendar,
  Target,
  AlertCircle // Added for the error state
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  // Now also getting 'error' state from the context
  const { fetchCourses, loading, error } = useLab();

  // This hook correctly fetches data in the background. It is perfect as is.
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // If a teacher lands on the student dashboard route, redirect them to the teacher dashboard
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  // Your mock data is preserved to ensure the output does not change.
  const stats = [
    {
      title: 'Courses Enrolled',
      value: '3',
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+1 this week'
    },
    {
      title: 'Labs Completed',
      value: '7',
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+2 this week'
    },
    {
      title: 'Study Hours',
      value: '24h',
      icon: Clock,
      color: 'bg-purple-500',
      change: '+5h this week'
    },
    {
      title: 'Progress Score',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5% this week'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'lab_completed',
      title: 'Completed Logic Gate Simulator',
      course: 'Digital Electronics',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'course_enrolled',
      title: 'Enrolled in Physics Lab Course',
      course: 'Physics Fundamentals',
      time: '1 day ago',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Earned "Lab Master" Badge',
      course: 'General',
      time: '3 days ago',
      icon: Award,
      color: 'text-yellow-600'
    }
  ];

  const upcomingLabs = [
    {
      id: 1,
      title: 'Ohm\'s Law Laboratory',
      course: 'Physics Fundamentals',
      dueDate: 'Tomorrow',
      progress: 0,
      color: 'bg-green-500'
    },
    {
      id: 2,
      title: 'Advanced Logic Gates',
      course: 'Digital Electronics',
      dueDate: 'In 3 days',
      progress: 60,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'Circuit Analysis Lab',
      course: 'Electrical Engineering',
      dueDate: 'Next week',
      progress: 30,
      color: 'bg-purple-500'
    }
  ];

  // This handles the loading state perfectly.
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // This new block handles any potential errors without affecting the success case.
  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Error Loading Data</h2>
            <p className="text-gray-600 text-center mb-6">There was a problem fetching the necessary data for the dashboard.</p>
            <button
                onClick={fetchCourses}
                className="btn btn-primary"
            >
                Try Again
            </button>
        </div>
    );
  }

  // Your JSX rendering is completely unchanged.
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            {user?.role === 'teacher' 
              ? 'Manage your courses and monitor student progress. Here\'s your teaching dashboard.'
              : 'Ready to continue your virtual lab journey? Here\'s what\'s happening today.'
            }
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <Link
                  to="/courses"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.course}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Labs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upcoming Labs
                </h2>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {upcomingLabs.map((lab) => (
                  <div key={lab.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {lab.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {lab.dueDate}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      {lab.course}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{lab.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 ${lab.color} rounded-full transition-all duration-300`}
                          style={{ width: `${lab.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <Link
                      to={`/lab/${lab.id}`}
                      className="btn btn-primary btn-sm w-full"
                    >
                      {lab.progress > 0 ? 'Continue Lab' : 'Start Lab'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/courses"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {user?.role === 'teacher' ? 'Manage Courses' : 'Browse Courses'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'teacher' ? 'Create and manage your courses' : 'Explore available courses'}
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link
                to={user?.role === 'teacher' ? '/teacher-dashboard' : '/lab/1'}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Play className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {user?.role === 'teacher' ? 'Teacher Dashboard' : 'Start Lab'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'teacher' ? 'Manage your teaching activities' : 'Jump into a virtual lab'}
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/profile"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View Progress</h3>
                    <p className="text-sm text-gray-600">Track your learning</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
