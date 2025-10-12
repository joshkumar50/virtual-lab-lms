import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Award,
  BookOpen,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Passionate about virtual learning and interactive education.',
    institution: 'University of Technology',
    department: 'Computer Science',
    year: '2024'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Save profile changes
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: 'Passionate about virtual learning and interactive education.',
      institution: 'University of Technology',
      department: 'Computer Science',
      year: '2024'
    });
    setIsEditing(false);
  };

  // Mock data for demonstration
  const stats = [
    {
      title: 'Courses Completed',
      value: '8',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Labs Completed',
      value: '24',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Certificates Earned',
      value: '5',
      icon: Award,
      color: 'bg-purple-500'
    },
    {
      title: 'Study Hours',
      value: '156h',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ];

  const recentAchievements = [
    {
      id: 1,
      title: 'Lab Master',
      description: 'Completed 20+ virtual labs',
      date: '2 days ago',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      id: 2,
      title: 'Digital Electronics Expert',
      description: 'Mastered all logic gate simulations',
      date: '1 week ago',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      id: 3,
      title: 'Physics Explorer',
      description: 'Completed Ohm\'s Law physics lab',
      date: '2 weeks ago',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

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
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and view your learning progress.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="btn btn-primary btn-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-secondary btn-sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formData.name}
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {user?.role} Account
                    </p>
                    <button className="text-sm text-primary-600 hover:text-primary-700 mt-1">
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                {/* Password Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Security
                  </h3>
                  <button className="btn btn-secondary">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats and Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Stats */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Learning Stats
              </h2>
              
              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {stat.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Recent Achievements
              </h2>
              
              <div className="space-y-4">
                {recentAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${achievement.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button className="w-full btn btn-secondary btn-sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Certificates
                </button>
                <button className="w-full btn btn-secondary btn-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Download Transcript
                </button>
                <button className="w-full btn btn-secondary btn-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
