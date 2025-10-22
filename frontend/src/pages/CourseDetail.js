import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Play, 
  CheckCircle,
  Star,
  ArrowLeft,
  Target,
  ExternalLink,
  Video,
  FileText,
  Calendar
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../api/index';
import toast from 'react-hot-toast';
import { getYouTubeEmbedUrl, isValidYouTubeUrl } from '../utils/youtube';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [updatingVideo, setUpdatingVideo] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id]);

  const isEnrolled = () => {
    if (!user || !course) return false;
    return course.students?.some(s => (s._id || s) === user._id) ||
           course.enrolledStudents?.some(s => (s._id || s) === user._id);
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await API.post(`/api/courses/${id}/enroll`);
      toast.success('Enrolled successfully!');
      // Reload course data
      const response = await API.get(`/api/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim() && !course.videoUrl) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (videoUrl.trim() && !isValidYouTubeUrl(videoUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setUpdatingVideo(true);
    try {
      await API.put(`/api/courses/${id}/video`, { 
        videoUrl: videoUrl.trim() || null 
      });
      toast.success(videoUrl.trim() ? 'Video added successfully!' : 'Video removed successfully!');
      
      // Update course data
      setCourse(prev => ({ ...prev, videoUrl: videoUrl.trim() || null }));
      setShowVideoForm(false);
      setVideoUrl('');
    } catch (error) {
      console.error('Video update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update video');
    } finally {
      setUpdatingVideo(false);
    }
  };

  const handleEditVideo = () => {
    setVideoUrl(course.videoUrl || '');
    setShowVideoForm(true);
  };

  // Mock data for demonstration
  const mockCourse = {
    id: id,
    title: 'Digital Electronics Fundamentals',
    description: 'Master the basics of digital circuits, logic gates, and Boolean algebra through interactive simulations. This comprehensive course covers everything from basic logic gates to complex digital systems.',
    instructor: 'Dr. Sarah Chen',
    duration: '8 weeks',
    students: 245,
    rating: 4.8,
    category: 'Engineering',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80',
    labs: [
      {
        id: 1,
        title: 'Logic Gate Simulator',
        description: 'Learn the fundamentals of AND, OR, and NOT gates through interactive simulations.',
        duration: '2 hours',
        completed: true,
        type: 'simulation'
      },
      {
        id: 2,
        title: 'Boolean Algebra Practice',
        description: 'Practice simplifying Boolean expressions and understanding logic operations.',
        duration: '1.5 hours',
        completed: true,
        type: 'exercise'
      },
      {
        id: 3,
        title: 'Advanced Logic Gates',
        description: 'Explore NAND, NOR, XOR, and XNOR gates with real-time feedback.',
        duration: '2.5 hours',
        completed: false,
        type: 'simulation'
      },
      {
        id: 4,
        title: 'Digital Circuit Design',
        description: 'Design and test complete digital circuits using virtual components.',
        duration: '3 hours',
        completed: false,
        type: 'project'
      }
    ],
    enrolled: enrolled,
    progress: enrolled ? 50 : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <Link to="/courses" className="btn btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const enrolled = isEnrolled();
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/courses"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Courses
          </Link>
        </div>

        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Image */}
            <div className="lg:col-span-1">
              <img
                src={course.courseImage || course.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80'}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&auto=format&q=80';
                }}
              />
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">{course.duration} weeks</p>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">{course.level}</p>
                  <p className="text-xs text-gray-600">Level</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">{course.category}</p>
                  <p className="text-xs text-gray-600">Category</p>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Instructor</p>
                  <p className="text-gray-600">{course.createdBy?.name || course.instructor?.name || 'Instructor'}</p>
                </div>
              </div>

              {/* Enrollment Status */}
              {!isTeacher && (
                <div className="mb-6">
                  {enrolled ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">You are enrolled in this course</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Course Materials (Only for Enrolled Students or Teachers) */}
        {(enrolled || isTeacher) && (
          <>
            {/* Announcement */}
            {course.announcement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card mb-6 bg-blue-50 border-blue-200"
              >
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Announcement</h3>
                    <p className="text-blue-800">{course.announcement}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Course Video */}
            {(course.videoUrl && isValidYouTubeUrl(course.videoUrl)) || (isTeacher && course.createdBy?._id === user?._id) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Course Video
                  </h2>
                  {isTeacher && course.createdBy?._id === user?._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditVideo}
                        className="btn btn-secondary btn-sm"
                      >
                        {course.videoUrl ? 'Edit Video' : 'Add Video'}
                      </button>
                      {course.videoUrl && (
                        <button
                          onClick={() => {
                            setVideoUrl('');
                            handleUpdateVideo({ preventDefault: () => {} });
                          }}
                          className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {course.videoUrl && isValidYouTubeUrl(course.videoUrl) ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(course.videoUrl)}
                      title="Course Video"
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No video added yet</p>
                    {isTeacher && course.createdBy?._id === user?._id && (
                      <p className="text-sm text-gray-400 mt-2">Click "Add Video" to embed a YouTube video</p>
                    )}
                  </div>
                )}

                {/* Video Form Modal */}
                {showVideoForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        {course.videoUrl ? 'Edit Course Video' : 'Add Course Video'}
                      </h3>
                      <form onSubmit={handleUpdateVideo}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            YouTube URL
                          </label>
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Paste any YouTube URL (watch, share, or embed format)
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={updatingVideo}
                            className="btn btn-primary flex-1 disabled:opacity-50"
                          >
                            {updatingVideo ? 'Updating...' : 'Update Video'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowVideoForm(false);
                              setVideoUrl('');
                            }}
                            className="btn btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}

            {/* Zoom Link */}
            {course.zoomLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card mb-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2" />
                  Live Class Link
                </h2>
                <a
                  href={course.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Join Zoom Meeting</p>
                      <p className="text-sm text-gray-600">{course.zoomLink}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-primary-600" />
                </a>
              </motion.div>
            )}

            {/* Material Links */}
            {course.materialLinks && course.materialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Course Materials
                </h2>
                <div className="space-y-3">
                  {course.materialLinks.map((material, index) => (
                    <a
                      key={index}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          material.type === 'video' ? 'bg-red-100' :
                          material.type === 'document' ? 'bg-blue-100' :
                          material.type === 'zoom' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          {material.type === 'video' ? (
                            <Video className="w-5 h-5 text-red-600" />
                          ) : material.type === 'zoom' ? (
                            <Video className="w-5 h-5 text-purple-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{material.title || 'Material'}</p>
                          <p className="text-sm text-gray-500">{material.type}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Not Enrolled Message */}
        {!enrolled && !isTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Enroll to Access Course Materials
            </h3>
            <p className="text-gray-600 mb-6">
              Get access to live classes, study materials, and more by enrolling in this course.
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
