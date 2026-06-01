import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLiteMode } from '../context/LiteModeContext';
import Navbar from '../components/Navbar';
import {
  BookOpen, FileText, Video, Download, Filter,
  Search, GraduationCap, Beaker, Atom, Cpu,
  ChevronDown, Plus, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Engineering'];
const BOARDS = ['All', 'CBSE', 'ICSE', 'State Board'];
const RESOURCE_TYPES = ['Lab Guide', 'Lesson Plan', 'Worksheet', 'Assessment Template', 'Video Tutorial', 'Reference Material'];
const GRADES = [6, 7, 8, 9, 10, 11, 12];

const subjectIcons = {
  'Physics': Atom,
  'Chemistry': Beaker,
  'Biology': GraduationCap,
  'Mathematics': BookOpen,
  'Computer Science': Cpu,
  'Engineering': Cpu
};

const typeColors = {
  'Lab Guide': 'bg-blue-100 text-blue-700',
  'Lesson Plan': 'bg-green-100 text-green-700',
  'Worksheet': 'bg-yellow-100 text-yellow-700',
  'Assessment Template': 'bg-purple-100 text-purple-700',
  'Video Tutorial': 'bg-red-100 text-red-700',
  'Reference Material': 'bg-gray-100 text-gray-700'
};

const TeacherResourceCenter = () => {
  const { isLiteMode } = useLiteMode();
  const { user, isAuthenticated } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ subject: '', board: '', gradeLevel: '', resourceType: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '', description: '', resourceType: 'Lab Guide', subject: 'Physics',
    board: 'All', gradeLevel: 9, content: '', tags: ''
  });

  const fetchResources = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.subject) params.subject = filters.subject;
      if (filters.board && filters.board !== 'All') params.board = filters.board;
      if (filters.gradeLevel) params.gradeLevel = filters.gradeLevel;
      if (filters.resourceType) params.resourceType = filters.resourceType;

      const res = await axios.get('/api/resources', { params });
      setResources(res.data.resources || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      // Demo fallback data
      setResources([
        { _id: '1', title: 'Pendulum Lab Guide - CBSE Class 11', description: 'Step-by-step guide for conducting the pendulum experiment with expected observations and formulas.', resourceType: 'Lab Guide', subject: 'Physics', board: 'CBSE', gradeLevel: 11, downloads: 124, createdBy: { name: 'Prof. Smith' }, tags: ['pendulum', 'oscillation', 'SHM'] },
        { _id: '2', title: 'Ohms Law Worksheet', description: 'Practice worksheet with 20 problems on Ohms law, series and parallel circuits.', resourceType: 'Worksheet', subject: 'Physics', board: 'All', gradeLevel: 10, downloads: 89, createdBy: { name: 'Dr. Raman' }, tags: ['circuits', 'resistance'] },
        { _id: '3', title: 'Chemistry Titration Lesson Plan', description: 'Complete lesson plan for acid-base titration lab aligned with State Board syllabus.', resourceType: 'Lesson Plan', subject: 'Chemistry', board: 'State Board', gradeLevel: 12, downloads: 67, createdBy: { name: 'Prof. Smith' }, tags: ['titration', 'acid-base'] },
        { _id: '4', title: 'Logic Gates Assessment Template', description: 'MCQ and circuit-based assessment template covering AND, OR, NOT, XOR gates.', resourceType: 'Assessment Template', subject: 'Computer Science', board: 'CBSE', gradeLevel: 11, downloads: 45, createdBy: { name: 'Dr. Raman' }, tags: ['logic gates', 'digital electronics'] },
        { _id: '5', title: 'Double Slit Experiment - Video Tutorial Script', description: 'Teacher reference script for explaining wave interference and double slit experiment.', resourceType: 'Video Tutorial', subject: 'Physics', board: 'All', gradeLevel: 12, downloads: 156, createdBy: { name: 'Prof. Smith' }, tags: ['optics', 'interference', 'waves'] },
        { _id: '6', title: 'pH Scale Reference Material', description: 'Comprehensive reference material explaining pH scale, indicators, and real-world applications.', resourceType: 'Reference Material', subject: 'Chemistry', board: 'CBSE', gradeLevel: 9, downloads: 78, createdBy: { name: 'Dr. Raman' }, tags: ['pH', 'acids', 'bases'] },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newResource,
        tags: newResource.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await axios.post('/api/resources', payload);
      toast.success('Resource created successfully!');
      setShowCreateForm(false);
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resource');
    }
  };

  const handleDownload = async (id) => {
    try {
      await axios.put(`/api/resources/${id}/download`);
      toast.success('Download tracked!');
    } catch (err) { /* silent */ }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const Wrapper = isLiteMode ? 'div' : motion.div;

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-8 h-8 mr-3 text-green-600" />
                Teacher Resource Center
              </h1>
              <p className="text-gray-500 mt-1">Curriculum-aligned lab guides, lesson plans, and teaching materials</p>
            </div>
            {isAuthenticated && user?.role === 'teacher' && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showCreateForm ? 'Cancel' : 'Create Resource'}</span>
              </button>
            )}
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <Wrapper
              {...(isLiteMode ? {} : { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' } })}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
            >
              <h3 className="text-lg font-semibold mb-4">Create New Resource</h3>
              <form onSubmit={handleCreateResource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={newResource.description} onChange={e => setNewResource({ ...newResource, description: e.target.value })} required rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={newResource.resourceType} onChange={e => setNewResource({ ...newResource, resourceType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={newResource.subject} onChange={e => setNewResource({ ...newResource, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                  <select value={newResource.board} onChange={e => setNewResource({ ...newResource, board: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    {BOARDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select value={newResource.gradeLevel} onChange={e => setNewResource({ ...newResource, gradeLevel: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content / Instructions</label>
                  <textarea value={newResource.content} onChange={e => setNewResource({ ...newResource, content: e.target.value })} rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input type="text" value={newResource.tags} onChange={e => setNewResource({ ...newResource, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., pendulum, SHM, oscillation" />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Create Resource
                  </button>
                </div>
              </form>
            </Wrapper>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">All Subjects</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={filters.board} onChange={e => setFilters({ ...filters, board: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">All Boards</option>
                  {BOARDS.filter(b => b !== 'All').map(b => <option key={b}>{b}</option>)}
                </select>
                <select value={filters.gradeLevel} onChange={e => setFilters({ ...filters, gradeLevel: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">All Grades</option>
                  {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, i) => {
                const SubjectIcon = subjectIcons[resource.subject] || BookOpen;
                return (
                  <Wrapper
                    key={resource._id}
                    {...(isLiteMode ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } })}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <SubjectIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[resource.resourceType] || 'bg-gray-100 text-gray-700'}`}>
                          {resource.resourceType}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">Class {resource.gradeLevel}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{resource.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(resource.tags || []).slice(0, 3).map((tag, ti) => (
                        <span key={ti} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                      {resource.board && resource.board !== 'All' && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{resource.board}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        By {resource.createdBy?.name || 'Unknown'}
                      </span>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400 flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {resource.downloads}
                        </span>
                        <button
                          onClick={() => handleDownload(resource._id)}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          )}

          {!loading && filteredResources.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No resources found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherResourceCenter;
