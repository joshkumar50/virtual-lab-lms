import React, { useEffect, useState, useMemo } from 'react';
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
  AlertCircle, // Added for the error state
  Bell,
  MessageSquare,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../api/index';

const Dashboard = () => {
  const { user } = useAuth();
  // Now also getting 'error' state from the context
  const { fetchCourses, loading, error } = useLab();
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [statsReady, setStatsReady] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // This hook correctly fetches data in the background. It is perfect as is.
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Load student assignments and courses for real-time stats
  useEffect(() => {
    const load = async () => {
      try {
        const [assignmentsRes, coursesRes, notificationsRes] = await Promise.all([
          API.get('/api/courses/student/assignments'),
          API.get('/api/courses'),
          API.get('/api/courses/student/notifications')
        ]);
        setStudentAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
        // Filter only enrolled courses
        const allCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const enrolled = allCourses.filter(course => 
          course.students && course.students.some(s => String(s) === String(user?._id))
        );
        setEnrolledCourses(enrolled);
        setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : []);
      } catch (e) {
        setStudentAssignments([]);
        setEnrolledCourses([]);
        setNotifications([]);
      } finally {
        setStatsReady(true);
      }
    };
    if (user) {
      load();
    }
  }, [user]);

  // Handle clicking outside notifications to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Compute real stats from assignments
  const computedStats = useMemo(() => {
    const totalAssignments = studentAssignments.length;
    const submitted = studentAssignments.filter(a => Array.isArray(a.submissions) && a.submissions.length > 0).length;
    const graded = studentAssignments.filter(a => Array.isArray(a.submissions) && a.submissions[0]?.grade).length;
    const distinctCourses = new Set(studentAssignments.map(a => a.courseTitle)).size;
    const progressPct = totalAssignments > 0 ? Math.round((submitted / totalAssignments) * 100) : 0;
    return {
      distinctCourses,
      submitted,
      graded,
      progressPct,
      totalAssignments
    };
  }, [studentAssignments]);

  const stats = [
    {
      title: 'Courses',
      value: String(computedStats.distinctCourses || 0),
      icon: BookOpen,
      color: 'bg-blue-500',
      change: `${computedStats.totalAssignments} assignments`
    },
    {
      title: 'Labs Completed',
      value: String(computedStats.submitted || 0),
      icon: CheckCircle,
      color: 'bg-green-500',
      change: `${computedStats.graded} graded`
    },
    {
      title: 'Progress',
      value: `${computedStats.progressPct}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: 'Based on submitted assignments'
    },
    {
      title: 'Pending',
      value: String(Math.max((computedStats.totalAssignments || 0) - (computedStats.submitted || 0), 0)),
      icon: Clock,
      color: 'bg-purple-500',
      change: 'Assignments to submit'
    }
  ];

  // Helper function to calculate time ago (must be defined before use)
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  // Generate real recent activity from assignments and courses
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Add submitted assignments as activities
    studentAssignments
      .filter(a => a.submissions && a.submissions.length > 0)
      .sort((a, b) => {
        const dateA = new Date(a.submissions[0].submittedAt);
        const dateB = new Date(b.submissions[0].submittedAt);
        return dateB - dateA;
      })
      .slice(0, 2)
      .forEach(assignment => {
        const submittedDate = new Date(assignment.submissions[0].submittedAt);
        const timeAgo = getTimeAgo(submittedDate);
        activities.push({
          id: `sub-${assignment._id}`,
          type: 'lab_completed',
          title: `Completed ${assignment.title}`,
          course: assignment.courseTitle,
          time: timeAgo,
          icon: CheckCircle,
          color: 'text-green-600'
        });
      });
    
    // Add recently enrolled courses
    enrolledCourses
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 2)
      .forEach(course => {
        activities.push({
          id: `course-${course._id}`,
          type: 'course_enrolled',
          title: `Enrolled in ${course.title}`,
          course: course.title,
          time: course.createdAt ? getTimeAgo(new Date(course.createdAt)) : 'Recently',
          icon: BookOpen,
          color: 'text-blue-600'
        });
      });
    
    // Sort by most recent and limit to 3
    return activities.slice(0, 3);
  }, [studentAssignments, enrolledCourses]);

  // Generate upcoming labs from pending assignments
  const upcomingLabs = useMemo(() => {
    return studentAssignments
      .filter(a => !a.submissions || a.submissions.length === 0)
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      })
      .slice(0, 3)
      .map(assignment => {
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
        const today = new Date();
        let dueDateText = 'No due date';
        
        if (dueDate) {
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          if (daysUntilDue < 0) dueDateText = 'Overdue';
          else if (daysUntilDue === 0) dueDateText = 'Today';
          else if (daysUntilDue === 1) dueDateText = 'Tomorrow';
          else if (daysUntilDue <= 7) dueDateText = `In ${daysUntilDue} days`;
          else dueDateText = dueDate.toLocaleDateString();
        }
        
        return {
          id: assignment._id,
          title: assignment.title,
          course: assignment.courseTitle,
          dueDate: dueDateText,
          progress: 0,
          color: 'bg-blue-500',
          labType: assignment.labType,
          courseId: assignment.courseId
        };
      });
  }, [studentAssignments]);

  // Handle marking notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await API.post(`/api/courses/student/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, read: true, readAt: new Date() } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // If a teacher lands on the student dashboard route, redirect them to the teacher dashboard
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  // Loading state: wait for both courses and stats
  if (loading || !statsReady) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                {user?.role === 'teacher' 
                  ? 'Manage your courses and monitor student progress. Here\'s your teaching dashboard.'
                  : 'Ready to continue your virtual lab journey? Here\'s what\'s happening today.'
                }
              </p>
            </div>
            
            {/* Notifications Bell */}
            <div className="relative notifications-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {unreadCount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">{unreadCount} unread</p>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            if (!notification.read) {
                              markNotificationAsRead(notification._id);
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(new Date(notification.sentAt))}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.courseTitle}
                              </p>
                              {notification.type === 'reminder' && (
                                <div className="flex items-center mt-2">
                                  <MessageSquare className="w-3 h-3 text-orange-500 mr-1" />
                                  <span className="text-xs text-orange-600">Assignment Reminder</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
                  to="/assignments"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
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
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No recent activity yet</p>
                    <Link to="/courses" className="text-primary-600 text-sm hover:underline mt-2 inline-block">
                      Browse courses to get started
                    </Link>
                  </div>
                )}
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
                {upcomingLabs.length > 0 ? (
                  upcomingLabs.map((lab) => {
                    // Map lab types to practice lab routes
                    const labRouteMap = {
                      'electronics': '/ohms-law-lab',
                      'physics': '/ohms-law-lab',
                      'chemistry': '/chemistry-lab',
                      'circuit': '/circuit-analysis-lab',
                      'logic': '/logic-gate-lab',
                      'optics': '/double-slit-lab'
                    };
                    const labRoute = labRouteMap[lab.labType?.toLowerCase()] || '/practice';
                    
                    return (
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
                        
                        <div className="flex gap-2">
                          <Link
                            to={labRoute}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm flex-1"
                          >
                            Start Lab
                          </Link>
                          <Link
                            to="/assignments"
                            className="btn btn-sm flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Submit
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No pending labs</p>
                    <Link to="/assignments" className="text-primary-600 text-sm hover:underline mt-2 inline-block">
                      View all assignments
                    </Link>
                  </div>
                )}
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
                to={user?.role === 'teacher' ? '/teacher-dashboard' : '/practice'}
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
