import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiteMode } from '../context/LiteModeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  School, MapPin, Phone, Mail, User, CheckCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATES_OF_INDIA = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

const InstitutionRegistration = () => {
  const { isLiteMode } = useLiteMode();
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    institutionalCode: '',
    state: '',
    district: '',
    block: '',
    type: 'Government',
    category: 'Secondary',
    board: 'State Board',
    principalName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    pincode: '',
    isRural: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate UDISE or AISHE
    if (!/^(?:\d{11}|[CUS]-\d{4,5})$/.test(form.institutionalCode)) {
      toast.error('Code must be an 11-digit UDISE code or a valid AISHE code (e.g., C-12345)');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/institutions/register', form);
      setSubmitted(true);
      toast.success('Institution registered successfully!');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && errorData.errors.length > 0) {
        toast.error(errorData.errors[0].message || 'Validation failed');
      } else {
        toast.error(errorData?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const Wrapper = isLiteMode ? 'div' : motion.div;

  if (submitted) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Wrapper
            {...(isLiteMode ? {} : { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } })}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your institution has been registered successfully! It is now active and ready for teachers and students to select when creating their accounts.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', institutionalCode: '', state: '', district: '', block: '', type: 'Government', category: 'Secondary', board: 'State Board', principalName: '', contactEmail: '', contactPhone: '', address: '', pincode: '', isRural: false }); }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Register Another Institution
            </button>
          </Wrapper>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Wrapper
            {...(isLiteMode ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } })}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <School className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Register Your Institution</h1>
              <p className="text-gray-600 mt-2">
                Bring virtual labs to your school or college. Register with your official UDISE or AISHE code.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
              {/* School Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <School className="w-4 h-4 mr-2 text-green-600" />
                  Institution Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Government Engineering College" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institutional Code (UDISE/AISHE) *</label>
                    <input type="text" name="institutionalCode" value={form.institutionalCode} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 27252001404 or C-12345" />
                    <p className="text-xs text-gray-400 mt-1">11-digit UDISE or AISHE code</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type</label>
                    <select name="type" value={form.type} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <optgroup label="Schools">
                        <option>Government</option>
                        <option>Govt-Aided</option>
                        <option>Local Body</option>
                        <option>Kendriya Vidyalaya</option>
                        <option>Navodaya Vidyalaya</option>
                      </optgroup>
                      <optgroup label="Higher Education">
                        <option>State University</option>
                        <option>Central University</option>
                        <option>Deemed University</option>
                        <option>Private University</option>
                        <option>Govt Degree College</option>
                        <option>Private Engineering College</option>
                        <option>NIT/IIT/IIIT</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={form.category} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <optgroup label="School Levels">
                        <option>Primary</option>
                        <option>Upper Primary</option>
                        <option>Secondary</option>
                        <option>Higher Secondary</option>
                        <option>Composite</option>
                      </optgroup>
                      <optgroup label="Higher Ed Levels">
                        <option>Undergraduate</option>
                        <option>Postgraduate</option>
                        <option>Technical/Engineering</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Board / Affiliation</label>
                    <select name="board" value={form.board} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>CBSE</option>
                      <option>ICSE</option>
                      <option>State Board</option>
                      <option>University Affiliated</option>
                      <option>Autonomous</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <select name="state" value={form.state} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="">Select State</option>
                      {STATES_OF_INDIA.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <input type="text" name="district" value={form.district} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Pune" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Block / Taluka</label>
                    <input type="text" name="block" value={form.block} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input type="text" name="pincode" value={form.pincode} onChange={handleChange} maxLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="6-digit code" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" name="isRural" checked={form.isRural} onChange={handleChange}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <span className="text-sm text-gray-700">This is a rural area school</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-purple-600" />
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Principal / HM Name</label>
                    <input type="text" name="principalName" value={form.principalName} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">How it works</p>
                  <p>After registration, an Education Officer will verify your UDISE code. Once verified, teachers from your school can create courses and students can access virtual labs.</p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <School className="w-5 h-5" />
                    <span>Register School</span>
                  </>
                )}
              </button>
            </form>
          </Wrapper>
        </div>
      </div>
    </div>
  );
};

export default InstitutionRegistration;
