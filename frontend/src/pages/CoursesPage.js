import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Search,
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../api/index';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const { fetchCourses, courses, loading, error } = useLab();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseImage: '',
    zoomLink: '',
    announcement: '',
    category: 'Engineering',
    level: 'Beginner',
    duration: 4
  });

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Get categories from actual courses with safe array operations
  const categories = ['all', ...new Set(Array.isArray(courses) ? courses.map(course => course?.category).filter(Boolean) : [])];

  // Filter courses based on search and category with safe operations
  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    if (!course) return false;
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/courses', {
        ...formData,
        status: 'published',
        isPublished: true
      });
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        courseImage: '',
        zoomLink: '',
        announcement: '',
        category: 'Engineering',
        level: 'Beginner',
        duration: 4
      });
      fetchCourses(); // Refresh courses
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      await API.post(`/api/courses/${courseId}/enroll`);
      toast.success('Enrolled successfully!');
      fetchCourses(); // Refresh to show enrolled status
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This will permanently remove it from the database.`)) {
      return;
    }
    try {
      await API.delete(`/api/courses/${courseId}`);
      toast.success('Course deleted successfully!');
      fetchCourses(); // Refresh courses
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const isEnrolled = (course) => {
    if (!user) return false;
    return course.students?.some(s => s._id === user._id || s === user._id) ||
           course.enrolledStudents?.some(s => s._id === user._id || s === user._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Explore Courses
              </h1>
              <p className="text-gray-600">
                Discover interactive virtual laboratory courses designed for engineering and college students.
              </p>
            </div>
            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                {Array.isArray(categories) && categories.length > 1 ? categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                )) : null}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filteredCourses) && filteredCourses.length > 0 ? filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card-hover"
            >
              {/* Course Image */}
              <div className="relative mb-4">
                <img
                  src={course.image || course.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&auto=format&q=80'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&auto=format&q=80';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                </div>
                {user?.role === 'student' && isEnrolled(course) && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      Enrolled
                    </span>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Instructor */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{course.instructor?.name || 'Instructor'}</span>
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration} weeks</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolledStudents?.length || course.students?.length || 0} enrolled</span>
                  </div>
                </div>

                {/* Progress Bar (for enrolled courses) */}
                {course.enrolledStudents?.includes(course.currentUser) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {course.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {user?.role === 'teacher' ? (
                    <div className="space-y-2">
                      <Link
                        to={`/course/${course._id}`}
                        className="btn btn-primary w-full"
                      >
                        View Course
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id, course.title)}
                        className="btn btn-sm w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Course
                      </button>
                    </div>
                  ) : isEnrolled(course) ? (
                    <div className="space-y-2">
                      <Link
                        to={`/course/${course._id}`}
                        className="btn btn-primary w-full"
                      >
                        View Course Materials
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnrollCourse(course._id)}
                      className="btn btn-primary w-full"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {(courses || []).length === 0 ? 'No courses available' : 'No courses found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {(courses || []).length === 0 
                ? 'There are no courses available at the moment. Check back later!'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {(courses || []).length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Course</h2>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Introduction to Electronics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Describe your course..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Image URL</label>
                  <input
                    type="url"
                    value={formData.courseImage}
                    onChange={(e) => setFormData({...formData, courseImage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Link</label>
                  <input
                    type="url"
                    value={formData.zoomLink}
                    onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Announcement</label>
                  <textarea
                    value={formData.announcement}
                    onChange={(e) => setFormData({...formData, announcement: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows="2"
                    placeholder="e.g., Live class every Monday at 3 PM"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option>Engineering</option>
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Mathematics</option>
                      <option>Computer Science</option>
                      <option>Biology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
