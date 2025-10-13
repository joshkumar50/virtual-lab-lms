import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Award,
  Eye,
  MessageSquare,
  Calendar,
  BarChart3,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CreateAssignment from '../components/CreateAssignment';
import GradeSubmission from '../components/GradeSubmission';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showGradeSubmission, setShowGradeSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Students',
      value: '156',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12 this month'
    },
    {
      title: 'Active Courses',
      value: '4',
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+1 this month'
    },
    {
      title: 'Labs Completed',
      value: '89',
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: '+15 this week'
    },
    {
      title: 'Average Score',
      value: '87%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+3% this month'
    }
  ];

  const courses = [
    {
      id: 1,
      title: 'Digital Electronics Fundamentals',
      students: 45,
      completionRate: 78,
      averageScore: 85,
      labs: 5,
      status: 'active'
    },
    {
      id: 2,
      title: 'Physics Laboratory Simulations',
      students: 38,
      completionRate: 82,
      averageScore: 88,
      labs: 7,
      status: 'active'
    },
    {
      id: 3,
      title: 'Advanced Circuit Analysis',
      students: 28,
      completionRate: 65,
      averageScore: 79,
      labs: 8,
      status: 'active'
    },
    {
      id: 4,
      title: 'Chemistry Virtual Lab',
      students: 35,
      completionRate: 71,
      averageScore: 83,
      labs: 4,
      status: 'draft'
    }
  ];

  const recentSubmissions = [
    {
      id: 1,
      studentName: 'Alice Johnson',
      course: 'Digital Electronics',
      lab: 'Logic Gate Simulator',
      submittedAt: '2 hours ago',
      status: 'pending',
      score: null,
      timeSpent: '1h 25m',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      studentName: 'Bob Smith',
      course: 'Physics Lab',
      lab: 'Ohm\'s Law Experiment',
      submittedAt: '4 hours ago',
      status: 'graded',
      score: 92,
      timeSpent: '2h 15m',
      lastActive: '4 hours ago'
    },
    {
      id: 3,
      studentName: 'Carol Davis',
      course: 'Digital Electronics',
      lab: 'Boolean Algebra',
      submittedAt: '1 day ago',
      status: 'graded',
      score: 88,
      timeSpent: '1h 45m',
      lastActive: '1 day ago'
    },
    {
      id: 4,
      studentName: 'David Wilson',
      course: 'Physics Lab',
      lab: 'Wave Analysis',
      submittedAt: '2 days ago',
      status: 'pending',
      score: null,
      timeSpent: '3h 10m',
      lastActive: '2 days ago'
    }
  ];

  const studentHours = [
    {
      id: 1,
      studentName: 'Alice Johnson',
      totalHours: '24h 35m',
      thisWeek: '8h 20m',
      courses: [
        { name: 'Digital Electronics', hours: '12h 15m', labs: 3 },
        { name: 'Physics Lab', hours: '8h 20m', labs: 2 },
        { name: 'Chemistry', hours: '4h 0m', labs: 1 }
      ],
      lastActive: '2 hours ago',
      status: 'active'
    },
    {
      id: 2,
      studentName: 'Bob Smith',
      totalHours: '31h 45m',
      thisWeek: '12h 30m',
      courses: [
        { name: 'Physics Lab', hours: '18h 30m', labs: 4 },
        { name: 'Digital Electronics', hours: '10h 15m', labs: 2 },
        { name: 'Circuit Analysis', hours: '3h 0m', labs: 1 }
      ],
      lastActive: '4 hours ago',
      status: 'active'
    },
    {
      id: 3,
      studentName: 'Carol Davis',
      totalHours: '19h 20m',
      thisWeek: '6h 45m',
      courses: [
        { name: 'Digital Electronics', hours: '12h 0m', labs: 3 },
        { name: 'Chemistry', hours: '7h 20m', labs: 2 }
      ],
      lastActive: '1 day ago',
      status: 'active'
    },
    {
      id: 4,
      studentName: 'David Wilson',
      totalHours: '15h 10m',
      thisWeek: '3h 20m',
      courses: [
        { name: 'Physics Lab', hours: '10h 30m', labs: 2 },
        { name: 'Digital Electronics', hours: '4h 40m', labs: 1 }
      ],
      lastActive: '2 days ago',
      status: 'inactive'
    }
  ];

  const assignments = [
    {
      id: 1,
      title: 'Logic Gate Analysis Lab',
      course: 'Digital Electronics',
      dueDate: '2024-01-15',
      assignedTo: 'All Students',
      status: 'active',
      submissions: 12,
      totalStudents: 15,
      description: 'Complete the logic gate simulator and analyze the truth tables'
    },
    {
      id: 2,
      title: 'Ohm\'s Law Physics Experiment',
      course: 'Physics Lab',
      dueDate: '2024-01-18',
      assignedTo: 'Physics Students',
      status: 'active',
      submissions: 8,
      totalStudents: 10,
      description: 'Conduct Ohm\'s Law experiments with different voltage, current, and resistance values'
    },
    {
      id: 3,
      title: 'Circuit Analysis Assignment',
      course: 'Circuit Analysis',
      dueDate: '2024-01-20',
      assignedTo: 'Advanced Students',
      status: 'draft',
      submissions: 0,
      totalStudents: 8,
      description: 'Analyze complex circuits using virtual laboratory tools'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Monitor your students' progress and manage your courses.
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
                    <p className="text-xs text-success-600 mt-1">
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'courses', label: 'Courses' },
                { id: 'submissions', label: 'Submissions' },
                { id: 'assignments', label: 'Assignments' },
                { id: 'student-hours', label: 'Student Hours' },
                { id: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {recentSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.studentName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {submission.course} • {submission.lab}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {submission.submittedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Create New Course</h3>
                      <p className="text-sm text-gray-600">Start a new virtual lab course</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Grade Submissions</h3>
                      <p className="text-sm text-gray-600">Review and grade student work</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">View Analytics</h3>
                      <p className="text-sm text-gray-600">Analyze student performance</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowCreateAssignment(true)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Create Assignment</h3>
                      <p className="text-sm text-gray-600">Assign labs to students</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Your Courses
            </h2>
            
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.students}</p>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.completionRate}%</p>
                      <p className="text-xs text-gray-600">Completion</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.averageScore}</p>
                      <p className="text-xs text-gray-600">Avg Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.labs}</p>
                      <p className="text-xs text-gray-600">Labs</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="btn btn-primary btn-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Messages
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'submissions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Student Submissions
            </h2>
            
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {submission.studentName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {submission.course} • {submission.lab}
                      </p>
                      <p className="text-xs text-gray-500">
                        Time spent: {submission.timeSpent} • Last active: {submission.lastActive}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {submission.submittedAt}
                      </p>
                    </div>
                  </div>
                  
                  {submission.score && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Score</span>
                        <span className="font-medium text-gray-900">{submission.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${submission.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowGradeSubmission(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {submission.status === 'graded' ? 'Review' : 'Grade'}
                    </button>
                    {submission.status === 'pending' && (
                      <button className="btn btn-success btn-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Grade
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'assignments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Assignments & Tasks
              </h2>
              <button className="btn btn-primary">
                <BookOpen className="w-4 h-4 mr-2" />
                Create Assignment
              </button>
            </div>
            
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assignment.course} • Due: {assignment.dueDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {assignment.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{assignment.submissions}</p>
                      <p className="text-xs text-gray-600">Submissions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{assignment.totalStudents}</p>
                      <p className="text-xs text-gray-600">Total Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round((assignment.submissions / assignment.totalStudents) * 100)}%
                      </p>
                      <p className="text-xs text-gray-600">Completion</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="btn btn-primary btn-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Send Reminder
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'student-hours' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Student Hours Tracking
              </h2>
              <div className="flex space-x-2">
                <button className="btn btn-secondary btn-sm">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Export Report
                </button>
                <button className="btn btn-primary btn-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  View Analytics
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {studentHours.map((student) => (
                <div key={student.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.studentName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Last active: {student.lastActive}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status}
                      </span>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        Total: {student.totalHours}
                      </p>
                      <p className="text-xs text-gray-600">
                        This week: {student.thisWeek}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {student.courses.map((course, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 text-sm">{course.name}</h4>
                        <p className="text-lg font-bold text-primary-600">{course.hours}</p>
                        <p className="text-xs text-gray-600">{course.labs} labs completed</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="btn btn-primary btn-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message Student
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Progress Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Analytics Dashboard
            </h2>
            
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analytics Coming Soon
              </h3>
              <p className="text-gray-600">
                Detailed analytics and reporting features will be available soon.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateAssignment
        isOpen={showCreateAssignment}
        onClose={() => setShowCreateAssignment(false)}
        courseId="course-id-here" // This should be dynamic based on selected course
      />

      <GradeSubmission
        isOpen={showGradeSubmission}
        onClose={() => {
          setShowGradeSubmission(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onGrade={async (submissionId, gradeData) => {
          // TODO: Implement API call to grade submission
          console.log('Grading submission:', submissionId, gradeData);
        }}
      />
    </div>
  );
};

export default TeacherDashboard;
