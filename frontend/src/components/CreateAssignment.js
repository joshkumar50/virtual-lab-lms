import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, Clock, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateAssignment = ({ isOpen, onClose, courseId }) => {
  const { fetchLabs } = useLab();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    labId: '',
    dueDate: '',
    maxScore: 100,
    instructions: '',
    isRequired: true
  });

  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && courseId) {
      loadLabs();
    }
  }, [isOpen, courseId]);

  const loadLabs = async () => {
    try {
      const response = await fetchLabs(courseId);
      setLabs(response || []);
    } catch (error) {
      console.error('Error loading labs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedLab = labs.find(lab => lab._id === formData.labId);
      const assignmentData = {
        _id: 'assign_' + Date.now(),
        ...formData,
        courseId,
        labTitle: selectedLab?.title || 'Unknown Lab',
        labType: selectedLab?.type || 'general',
        createdAt: new Date().toISOString(),
        status: 'active',
        submissions: []
      };

      // TODO: Implement real API call to create assignment
      const response = await fetch('/api/courses/' + courseId + '/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(assignmentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      const result = await response.json();
      console.log('Assignment created:', result);
      toast.success(`Assignment "${formData.title}" created successfully!`);
      
      // Refresh parent component
      window.dispatchEvent(new CustomEvent('assignmentCreated', { detail: result }));
      
      onClose();
      setFormData({
        title: '',
        description: '',
        labId: '',
        dueDate: '',
        maxScore: 100,
        instructions: '',
        isRequired: true
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
          <h2 className="text-xl font-semibold text-gray-900">Create New Assignment</h2>
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
