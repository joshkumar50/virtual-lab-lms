import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import API from '../api/index';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, Clock, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import StudentSelector from './StudentSelector';
import autoGradeTemplates from './AutoGradeTemplates';

// Predefined virtual labs - always available
const PREDEFINED_LABS = [
  {
    _id: '507f1f77bcf86cd799439021',
    title: "Ohm's Law Virtual Lab",
    labType: 'electronics',
    description: 'Interactive electronics simulation for Ohm\'s Law experiments'
  },
  {
    _id: '507f1f77bcf86cd799439022',
    title: 'Circuit Analysis Lab',
    labType: 'circuit',
    description: 'Analyze electrical circuits and measure voltage, current, and resistance'
  },
  {
    _id: '507f1f77bcf86cd799439023',
    title: 'Logic Gates Simulator',
    labType: 'logic',
    description: 'Digital logic gates simulation and Boolean algebra'
  },
  {
    _id: '507f1f77bcf86cd799439024',
    title: 'Virtual Chemistry Lab',
    labType: 'chemistry',
    description: 'Chemical reactions and molecular interactions simulation'
  },
  {
    _id: '507f1f77bcf86cd799439025',
    title: 'Double Slit Experiment',
    labType: 'optics',
    description: 'Explore wave interference and the nature of light with the double slit experiment'
  },
  {
    _id: '507f1f77bcf86cd799439026',
    title: 'Pendulum Simulation',
    labType: 'physics',
    description: 'Study simple harmonic motion and gravity with a virtual pendulum'
  },
  {
    _id: '507f1f77bcf86cd799439027',
    title: 'Arduino Uno Robotics Lab',
    labType: 'arduino',
    description: 'Learn embedded systems and robotics by programming an Arduino Uno in a virtual Wokwi simulator'
  }
];

const CreateAssignment = ({ isOpen, onClose, courseId }) => {
  const { fetchLabs } = useLab();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    labId: '',
    dueDate: '',
    maxScore: 100,
    instructions: '',
    isRequired: true,
    autoGrade: false,
    gradingTemplate: 'generic'
  });

  const [labs, setLabs] = useState(PREDEFINED_LABS);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load labs when modal opens or courseId changes
  React.useEffect(() => {
    const loadLabs = async () => {
      if (!isOpen) return;

      // Always start with predefined labs
      let combined = [...PREDEFINED_LABS];

      if (courseId) {
        try {
          const backendLabs = await fetchLabs(courseId);
          if (backendLabs && backendLabs.length > 0) {
            const ids = new Set(backendLabs.map(l => l._id));
            combined = [
              ...PREDEFINED_LABS.filter(pl => !ids.has(pl._id)),
              ...backendLabs
            ];
          }
        } catch (error) {
          console.log('⚠️ Using predefined labs only:', error.message);
        }
      }
      setLabs(combined);
    };

    loadLabs();
  }, [isOpen, courseId, fetchLabs]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId) {
      toast.error('No course selected. Please select a course from the dashboard first.');
      return;
    }

    setLoading(true);

    try {
      const selectedLab = labs.find(lab => lab._id === formData.labId);
      const assignmentData = {
        ...formData,
        courseId,
        labTitle: selectedLab?.title || 'Unknown Lab',
        labType: selectedLab?.labType || 'general',
        createdAt: new Date().toISOString(),
        status: 'active',
        submissions: [],
        assignedStudents: selectedStudents.map(s => s._id),
        autoGrade: formData.autoGrade,
        gradingCriteria: formData.autoGrade ? autoGradeTemplates[formData.gradingTemplate].criteria : null,
        maxScore: formData.maxScore
      };

      const response = await API.post(`/api/courses/${courseId}/assignments`, assignmentData);
      const result = response.data;

      toast.success(`Assignment "${formData.title}" created successfully!`);
      window.dispatchEvent(new CustomEvent('assignmentCreated', { detail: result.assignment || result }));

      onClose();
      setFormData({
        title: '',
        description: '',
        labId: '',
        dueDate: '',
        maxScore: 100,
        instructions: '',
        isRequired: true,
        autoGrade: false,
        gradingTemplate: 'generic'
      });
    } catch (error) {
      toast.error('Failed to create assignment');
      console.error('Assignment creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create Lab Assignment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Enter assignment description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lab *
            </label>
            <select
              value={formData.labId}
              onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
              className="input"
              required
            >
              <option value="">Choose a lab</option>
              {labs.map((lab) => (
                <option key={lab._id} value={lab._id}>
                  {lab.title} ({lab.labType})
                </option>
              ))}
            </select>
            {labs.length > 0 ? (
              <p className="text-xs text-green-600 mt-1">
                ✅ {labs.length} labs available (Predefined + Custom)
              </p>
            ) : (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ No labs found.
              </p>
            )}
          </div>

          {/* Student Assignment (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Students (leave empty to assign to all)
            </label>
            <StudentSelector
              selectedStudents={selectedStudents}
              onSelectionChange={setSelectedStudents}
              courseId={courseId}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Score
              </label>
              <input
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                className="input"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="input"
              rows={4}
              placeholder="Enter detailed instructions for students"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700">
                This is a required assignment
              </label>
            </div>

            {/* Auto-Grading Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="autoGrade"
                  checked={formData.autoGrade}
                  onChange={(e) => setFormData({ ...formData, autoGrade: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoGrade" className="ml-2 flex items-center text-sm font-medium text-gray-900">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  Enable AI Auto-Grading (Powered by Local AI - qwen3:8b)
                </label>
              </div>

              {formData.autoGrade && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select AI Prompt Template
                    </label>
                    <select
                      value={formData.gradingTemplate}
                      onChange={(e) => setFormData({ ...formData, gradingTemplate: e.target.value })}
                      className="input"
                    >
                      {Object.keys(autoGradeTemplates).map((key) => (
                        <option key={key} value={key}>
                          {autoGradeTemplates[key].name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      {autoGradeTemplates[formData.gradingTemplate].description}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">How it works:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• 🤖 Analyzes student reports using local AI (Ollama)</li>
                      <li>• ✓ Checks for scientific accuracy and experimental depth</li>
                      <li>• ✓ Provides instant, detailed feedback and score breakdown</li>
                      <li>• 💡 Suggests specific improvements for next time</li>
                      <li>• ⚡ Fast & Free - Runs locally on the server!</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAssignment;
