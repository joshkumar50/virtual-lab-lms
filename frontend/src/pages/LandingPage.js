import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLiteMode } from '../context/LiteModeContext';
import { 
  BookOpen, 
  Users, 
  Zap, 
  Shield, 
  ArrowRight,
  Play,
  Star,
  WifiOff,
  School
} from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const { isLiteMode } = useLiteMode();

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


  // ==================== LITE MODE VERSION ====================
  if (isLiteMode) {
    return (
      <div className="min-h-screen" style={{ background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <Navbar />

        {/* Lite Mode Banner */}
        <div style={{ background: '#fbbf24', color: '#000', padding: '8px 16px', textAlign: 'center', fontWeight: 700, fontSize: '13px', borderBottom: '2px solid #000' }}>
          <WifiOff style={{ width: 14, height: 14, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          📡 LITE MODE — Optimized for Low Bandwidth | No Animations | Reduced Data Usage
        </div>

        {/* Minimal Hero */}
        <section style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', padding: '40px 16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: 8 }}>
            Virtual Lab LMS
          </h1>
          <p style={{ fontSize: '1rem', color: '#555', maxWidth: 600, margin: '0 auto 20px' }}>
            Interactive virtual laboratories for engineering and college students.
            Master complex concepts through hands-on simulations.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{ display: 'inline-block', padding: '10px 24px', background: '#2563eb', color: '#fff', fontWeight: 600, textDecoration: 'none', border: '2px solid #1d4ed8' }}
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              style={{ display: 'inline-block', padding: '10px 24px', background: '#fff', color: '#333', fontWeight: 600, textDecoration: 'none', border: '2px solid #333' }}
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features - Simple List */}
        <section style={{ padding: '32px 16px', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, borderBottom: '2px solid #000', paddingBottom: 8 }}>
            Why Choose Virtual Lab LMS?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} style={{ padding: '12px 16px', border: '1px solid #d1d5db', background: '#fff', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Icon style={{ width: 20, height: 20, color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: 2 }}>{feature.title}</strong>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>{feature.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Labs - Simple Table */}
        <section style={{ padding: '32px 16px', maxWidth: 800, margin: '0 auto', background: '#f9fafb' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, borderBottom: '2px solid #000', paddingBottom: 8 }}>
            Available Virtual Labs
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Lab</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Subject</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <strong>{lab.title}</strong>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{lab.description}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#444' }}>{lab.category}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Try Now</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Testimonials - Minimal */}
        <section style={{ padding: '32px 16px', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, borderBottom: '2px solid #000', paddingBottom: 8 }}>
            What Users Say
          </h2>
          {testimonials.map((t, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontStyle: 'italic', color: '#555', marginBottom: 4 }}>"{t.content}"</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.name} — <span style={{ fontWeight: 400, color: '#888' }}>{t.role}</span></p>
            </div>
          ))}
        </section>

        {/* CTA - Simple */}
        <section style={{ padding: '32px 16px', textAlign: 'center', background: '#1e3a5f', color: '#fff' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Ready to Start Learning?</h2>
          <p style={{ color: '#cbd5e1', marginBottom: 16 }}>Join thousands of students using Virtual Lab LMS.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{ display: 'inline-block', padding: '10px 24px', background: '#fff', color: '#1e3a5f', fontWeight: 700, textDecoration: 'none', border: '2px solid #fff' }}
            >
              Start Learning Today →
            </Link>
            <Link
              to="/register-school"
              style={{ display: 'inline-block', padding: '10px 24px', background: 'transparent', color: '#fff', fontWeight: 700, textDecoration: 'none', border: '2px solid #fff' }}
            >
              For Schools/Colleges →
            </Link>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer style={{ padding: '20px 16px', background: '#111', color: '#aaa', textAlign: 'center', fontSize: '0.875rem' }}>
          Virtual Lab LMS — A Government & Civic Tech Initiative
          <br />
          <a href="mailto:chittetijoshkumar@gmail.com" style={{ color: '#ddd' }}>Contact: chittetijoshkumar@gmail.com</a>
        </footer>
      </div>
    );
  }

  // ==================== FULL MODE VERSION (Original) ====================
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

      {/* Institutions Section */}
      <section className="py-20 bg-primary-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-800 border border-primary-700 text-sm font-medium text-primary-200 mb-6">
                <School className="w-4 h-4" />
                <span>For Schools & Colleges</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Onboard Your Institution to the <span className="text-primary-400">Civic Tech Network</span>
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join our state-verified network to provide students with localized, private virtual laboratories 
                and benchmark your institution's performance against regional impact data.
              </p>
              <ul className="space-y-4 mb-8 text-primary-200">
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                  <span>Secure Institutional Silos for all teachers/students</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                  <span>Real-time impact reporting to Education Officers</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                  <span>UDISE/AISHE verified registration with govt oversight</span>
                </li>
              </ul>
              <Link
                to="/register-school"
                className="btn bg-white text-primary-900 hover:bg-primary-50 btn-lg inline-flex"
              >
                Register Your Institution
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-800 to-primary-950 p-8 rounded-3xl border border-primary-700 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-primary-400 uppercase tracking-widest font-bold">Verification Engine</span>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-primary-800 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-primary-800 rounded-full w-1/2 animate-pulse delay-75"></div>
                  <div className="h-4 bg-primary-800 rounded-full w-5/6 animate-pulse delay-150"></div>
                  <div className="pt-4 mt-4 border-t border-primary-800 flex justify-between items-center text-sm font-medium">
                    <span className="text-primary-300">Status: Verified Academic Partner</span>
                    <span className="text-success-400 flex items-center">
                      <Shield className="w-4 h-4 mr-1" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
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
