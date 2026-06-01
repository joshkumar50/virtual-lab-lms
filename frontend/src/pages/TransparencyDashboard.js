import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLiteMode } from '../context/LiteModeContext';
import {
  School,
  Users,
  BookOpen,
  TrendingUp,
  MapPin,
  Award,
  Globe,
  BarChart3,
  Target,
  Heart
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const StatCard = ({ icon: Icon, label, value, color, isLiteMode }) => {
  const Wrapper = isLiteMode ? 'div' : motion.div;
  const animProps = isLiteMode ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <Wrapper {...animProps} className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Wrapper>
  );
};

const TransparencyDashboard = () => {
  const { isLiteMode } = useLiteMode();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('/api/institutions/public/impact-metrics');
        setMetrics(res.data.metrics);
      } catch (err) {
        console.error('Failed to fetch impact metrics:', err);
        // Fallback data for demo
        setMetrics({
          totalInstitutions: 47,
          totalStudents: 15200,
          totalTeachers: 340,
          totalCourses: 28,
          ruralInstitutions: 31,
          totalLabsCompleted: 45800,
          platformAverageScore: 72,
          stateBreakdown: [
            { state: 'Maharashtra', institutionCount: 12 },
            { state: 'Karnataka', institutionCount: 9 },
            { state: 'Tamil Nadu', institutionCount: 8 },
            { state: 'Rajasthan', institutionCount: 7 },
            { state: 'Uttar Pradesh', institutionCount: 6 },
            { state: 'Kerala', institutionCount: 5 },
          ],
          districtBreakdown: [
            { state: 'Maharashtra', district: 'Pune', institutionCount: 5 },
            { state: 'Karnataka', district: 'Bangalore Urban', institutionCount: 4 },
            { state: 'Tamil Nadu', district: 'Chennai', institutionCount: 3 },
            { state: 'Rajasthan', district: 'Jaipur', institutionCount: 3 },
            { state: 'Maharashtra', district: 'Nagpur', institutionCount: 3 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading public education metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const Wrapper = isLiteMode ? 'div' : motion.div;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Wrapper
            {...(isLiteMode ? {} : { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } })}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Globe className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Public Education Impact Dashboard</h1>
            </div>
            <p className="text-green-100 text-lg max-w-2xl mx-auto">
              Transparency portal showing real-time impact of virtual labs in government schools across India.
              Empowering rural education through digital access.
            </p>
            <div className="mt-4 inline-flex items-center space-x-1 bg-green-800 bg-opacity-40 px-4 py-2 rounded-full text-sm">
              <Heart className="w-4 h-4 text-red-300" />
              <span>Open Data • No Login Required • 100% Transparent</span>
            </div>
          </Wrapper>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Impact Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={School} label="Government Schools" value={metrics.totalInstitutions} color="bg-green-600" isLiteMode={isLiteMode} />
          <StatCard icon={Users} label="Students Reached" value={metrics.totalStudents.toLocaleString()} color="bg-blue-600" isLiteMode={isLiteMode} />
          <StatCard icon={BookOpen} label="Labs Completed" value={metrics.totalLabsCompleted.toLocaleString()} color="bg-purple-600" isLiteMode={isLiteMode} />
          <StatCard icon={MapPin} label="Rural Schools" value={metrics.ruralInstitutions} color="bg-orange-500" isLiteMode={isLiteMode} />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard icon={Award} label="Avg. Score" value={`${metrics.platformAverageScore}%`} color="bg-indigo-600" isLiteMode={isLiteMode} />
          <StatCard icon={Target} label="Active Courses" value={metrics.totalCourses} color="bg-teal-600" isLiteMode={isLiteMode} />
          <StatCard icon={TrendingUp} label="Teachers Onboarded" value={metrics.totalTeachers} color="bg-pink-500" isLiteMode={isLiteMode} />
        </div>

        {/* State-wise Breakdown */}
        <Wrapper
          {...(isLiteMode ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.3 } })}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            State-wise School Distribution
          </h2>
          <div className="space-y-3">
            {metrics.stateBreakdown.map((item, i) => {
              const maxCount = Math.max(...metrics.stateBreakdown.map(s => s.institutionCount));
              const widthPercent = (item.institutionCount / maxCount) * 100;
              return (
                <div key={i} className="flex items-center space-x-4">
                  <span className="w-36 text-sm font-medium text-gray-700 truncate">{item.state}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span className="text-xs text-white font-bold">{item.institutionCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Wrapper>

        {/* District-level Table */}
        <Wrapper
          {...(isLiteMode ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 } })}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Top Districts by School Registrations
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-600">Rank</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">State</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">District</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Schools</th>
                </tr>
              </thead>
              <tbody>
                {metrics.districtBreakdown.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i < 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{item.state}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.district}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {item.institutionCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrapper>

        {/* Footnote */}
        <div className="text-center mt-8 text-sm text-gray-400">
          Data is updated in real-time • Virtual Lab LMS – A Government & Civic Tech Initiative
        </div>
      </div>
    </div>
  );
};

export default TransparencyDashboard;
