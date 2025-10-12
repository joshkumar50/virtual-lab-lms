import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Play, 
  CheckCircle,
  Star,
  ArrowLeft,
  Target
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseDetail = () => {
  const { id } = useParams();
  const { fetchCourse, enrollInCourse, loading } = useLab();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      const courseData = await fetchCourse(id);
      if (courseData) {
        setCourse(courseData);
        setEnrolled(courseData.enrolled || false);
      }
    };
    loadCourse();
  }, [id, fetchCourse]);

  const handleEnroll = async () => {
    const result = await enrollInCourse(id);
    if (result.success) {
      setEnrolled(true);
    }
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
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
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

  const currentCourse = course || mockCourse;

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
                src={currentCourse.image}
                alt={currentCourse.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentCourse.title}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {currentCourse.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{currentCourse.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">{currentCourse.students} students</p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">{currentCourse.duration}</p>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">{currentCourse.labs.length}</p>
                  <p className="text-xs text-gray-600">Labs</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">{currentCourse.level}</p>
                  <p className="text-xs text-gray-600">Level</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Target className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">{currentCourse.category}</p>
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
                  <p className="text-gray-600">{currentCourse.instructor}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex space-x-4">
                {currentCourse.enrolled ? (
                  <Link
                    to={`/lab/${id}/1`}
                    className="btn btn-primary btn-lg"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="btn btn-primary btn-lg"
                  >
                    Enroll Now
                  </button>
                )}
                <button className="btn btn-secondary btn-lg">
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Labs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Course Labs
          </h2>
          
          <div className="space-y-4">
            {currentCourse.labs.map((lab, index) => (
              <div key={lab.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    lab.type === 'simulation' ? 'bg-blue-100' :
                    lab.type === 'exercise' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    <Play className={`w-6 h-6 ${
                      lab.type === 'simulation' ? 'text-blue-600' :
                      lab.type === 'exercise' ? 'text-green-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{lab.title}</h3>
                    <p className="text-sm text-gray-600">{lab.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">{lab.duration}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lab.type === 'simulation' ? 'bg-blue-100 text-blue-800' :
                        lab.type === 'exercise' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {lab.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {lab.completed ? (
                    <div className="flex items-center space-x-2 text-success-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  ) : (
                    <Link
                      to={`/lab/${id}/${lab.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Start Lab
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetail;
