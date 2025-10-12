import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Zap, 
  Shield, 
  ArrowRight,
  Play,
  Star
} from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Labs',
      description: 'Hands-on virtual experiments with real-time feedback and visual simulations.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get immediate feedback on your experiments with detailed analysis and insights.'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Work with peers and get guidance from instructors in real-time.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data and progress are protected with enterprise-grade security.'
    }
  ];

  const labs = [
    {
      title: 'Logic Gate Simulator',
      description: 'Master digital electronics with interactive AND, OR, and NOT gate simulations.',
      category: 'Engineering',
      color: 'bg-blue-500'
    },
    {
      title: 'Ohm\'s Law Laboratory',
      description: 'Explore electrical circuits and understand the relationship between voltage, current, and resistance.',
      category: 'Physics',
      color: 'bg-green-500'
    },
    {
      title: 'Double Slit Experiment',
      description: 'Discover wave interference and diffraction patterns with interactive light simulations.',
      category: 'Physics',
      color: 'bg-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Engineering Student',
      content: 'The Logic Gate Simulator helped me understand digital circuits better than any textbook.',
      rating: 5
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Physics Professor',
      content: 'My students love the interactive Ohm\'s Law lab. It makes electrical circuit concepts accessible and engaging.',
      rating: 5
    },
    {
      name: 'Alex Thompson',
      role: 'Electrical Engineering Student',
      content: 'The real-time feedback and visualizations are incredible. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Virtual Lab{' '}
                <span className="text-gradient">LMS</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience interactive virtual laboratories designed for engineering and college students. 
                Master complex concepts through hands-on simulations and real-time feedback.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/register"
                className="btn btn-primary btn-lg group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary btn-lg"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Virtual Lab LMS?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with proven educational methods 
              to deliver an unparalleled learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Labs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interactive Virtual Labs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our collection of hands-on virtual experiments designed to 
              enhance your understanding of complex concepts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {labs.map((lab, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${lab.color} rounded-xl flex items-center justify-center`}>
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {lab.category}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-success-600 font-medium">
                        Available
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {lab.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {lab.description}
                    </p>
                    <Link
                      to="/register"
                      className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                    >
                      <span>Try it now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Students & Teachers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and teachers who are already using Virtual Lab LMS 
              to enhance their educational experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg group"
              >
                Start Learning Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Virtual Lab LMS</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering students and teachers with interactive virtual laboratory experiences 
                that make learning engaging and effective.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
                <li><Link to="/labs" className="hover:text-white transition-colors">Virtual Labs</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors text-left">Help Center</button></li>
                <li><a href="mailto:chittetijoshkumar@gmail.com" className="hover:text-white transition-colors">Contact Us: chittetijoshkumar@gmail.com</a></li>
                <li><button className="hover:text-white transition-colors text-left">Documentation</button></li>
              </ul>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
