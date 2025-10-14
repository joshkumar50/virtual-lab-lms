import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLab } from '../context/LabContext';
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
  const { fetchInstructorCourses, fetchLabs, fetchLabSubmissions, gradeLabSubmission } = useLab();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showGradeSubmission, setShowGradeSubmission] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseLabs, setCourseLabs] = useState([]);
  const [labIdForSubmissions, setLabIdForSubmissions] = useState('');
  const [labSubmissions, setLabSubmissions] = useState([]);

  // Real stats from API data with safe array operations
  const stats = [
    {
      title: 'Total Students',
      value: Array.isArray(myCourses) ? myCourses.reduce((total, course) => total + (Array.isArray(course?.students) ? course.students.length : 0), 0) : 0,
      icon: Users,
      color: 'bg-blue-500',
      change: 'Active students'
    },
    {
      title: 'My Courses',
      value: Array.isArray(myCourses) ? myCourses.length : 0,
      icon: BookOpen,
      color: 'bg-green-500',
      change: 'Published courses'
    },
    {
      title: 'Total Labs',
      value: Array.isArray(courseLabs) ? courseLabs.length : 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: 'Available labs'
    },
    {
      title: 'Pending Submissions',
      value: Array.isArray(labSubmissions) ? labSubmissions.filter(sub => sub?.status === 'submitted').length : 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: 'Need grading'
    }
  ];

  // Load instructor courses
  useEffect(() => {
    const load = async () => {
      const courses = await fetchInstructorCourses();
      setMyCourses(courses);
      if (courses.length > 0) setSelectedCourseId(courses[0]._id);
    };
    load();
  }, [fetchInstructorCourses]);

  // Load labs for selected course
  useEffect(() => {
    const loadLabsForCourse = async () => {
      if (!selectedCourseId) { setCourseLabs([]); return; }
      const labs = await fetchLabs(selectedCourseId);
      setCourseLabs(labs);
      if (labs.length > 0) setLabIdForSubmissions(labs[0]._id);
    };
    loadLabsForCourse();
  }, [selectedCourseId, fetchLabs]);

  // Load submissions for selected lab
  useEffect(() => {
    const loadSubs = async () => {
      if (!labIdForSubmissions) { setLabSubmissions([]); return; }
      const subs = await fetchLabSubmissions(labIdForSubmissions);
      setLabSubmissions(subs);
    };
    loadSubs();
  }, [labIdForSubmissions, fetchLabSubmissions]);

  // Use real submissions from API with safe array operations
  const recentSubmissions = Array.isArray(labSubmissions) ? labSubmissions.slice(0, 5) : [];

  // Use real student data from courses with safe array operations
  const studentHours = Array.isArray(myCourses) ? myCourses.flatMap(course => 
    Array.isArray(course?.students) ? course.students.map(student => ({
      id: student?._id || 'unknown',
      studentName: student?.name || 'Unknown Student',
      totalHours: '0h 0m', // This would come from progress tracking
      thisWeek: '0h 0m',
      courses: [{ name: course?.title || 'Unknown Course', hours: '0h 0m', labs: Array.isArray(courseLabs) ? courseLabs.length : 0 }],
      lastActive: 'Unknown',
      status: 'active'
    })) : []
  ) : [];

  // Use real assignments from courses with safe array operations
  const assignments = Array.isArray(myCourses) ? myCourses.flatMap(course => 
    Array.isArray(course?.assignments) ? course.assignments.map(assignment => ({
      id: assignment?._id || 'unknown',
      title: assignment?.title || 'Untitled Assignment',
      course: course?.title || 'Unknown Course',
      dueDate: assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date',
      assignedTo: 'All Students',
      status: assignment?.status || 'active',
      submissions: Array.isArray(assignment?.submissions) ? assignment.submissions.length : 0,
      totalStudents: Array.isArray(course?.students) ? course.students.length : 0,
      description: assignment?.description || 'No description'
    })) : []
  ) : [];

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
              {Array.isArray(myCourses) && myCourses.length > 0 ? myCourses.map((course) => (
                <div key={course._id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status || 'active')}`}>
                      {course.status || 'active'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.students?.length || 0}</p>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.labs?.length || 0}</p>
                      <p className="text-xs text-gray-600">Labs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.assignments?.length || 0}</p>
                      <p className="text-xs text-gray-600">Assignments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-xs text-gray-600">Created</p>
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
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No courses found. Create your first course to get started.</p>
                </div>
              )}
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
              {Array.isArray(recentSubmissions) && recentSubmissions.length > 0 ? recentSubmissions.map((submission) => (
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
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No submissions found.</p>
                </div>
              )}
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
              {Array.isArray(assignments) && assignments.length > 0 ? assignments.map((assignment) => (
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
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No assignments found. Create your first assignment to get started.</p>
                </div>
              )}
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
              {Array.isArray(studentHours) && studentHours.length > 0 ? studentHours.map((student) => (
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
                    {Array.isArray(student?.courses) ? student.courses.map((course, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 text-sm">{course.name}</h4>
                        <p className="text-lg font-bold text-primary-600">{course.hours}</p>
                        <p className="text-xs text-gray-600">{course.labs} labs completed</p>
                      </div>
                    )) : (
                      <div className="col-span-3 text-center py-4">
                        <p className="text-gray-500">No course data available</p>
                      </div>
                    )}
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
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No student data found.</p>
                </div>
              )}
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
        courseId={myCourses?.[0]?._id || ''}
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
