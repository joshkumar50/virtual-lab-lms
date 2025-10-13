import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const GradeSubmission = ({ isOpen, onClose, submission, onGrade }) => {
  const [grade, setGrade] = useState(submission?.score || 0);
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (submission) {
      setGrade(submission.score || 0);
      setFeedback(submission.feedback || '');
    }
  }, [submission]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onGrade(submission.id, {
        score: grade,
        feedback: feedback
      });
      
      toast.success('Grade submitted successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit grade');
      console.error('Grading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Grade Submission</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Student Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Student:</span>
                <span className="ml-2 font-medium">{submission.studentName}</span>
              </div>
              <div>
                <span className="text-gray-600">Submitted:</span>
                <span className="ml-2 font-medium">{submission.submittedAt}</span>
              </div>
              <div>
                <span className="text-gray-600">Time Spent:</span>
                <span className="ml-2 font-medium">{submission.timeSpent} minutes</span>
              </div>
            </div>
          </div>

          {/* Lab Details */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Lab Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Lab:</span>
                <span className="ml-2 font-medium">{submission.labTitle}</span>
              </div>
              <div>
                <span className="text-gray-600">Max Score:</span>
                <span className="ml-2 font-medium">{submission.maxScore} points</span>
              </div>
            </div>
          </div>

          {/* Submission Data */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Submission Data</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(submission.submissionData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (0-{submission.maxScore})
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max={submission.maxScore}
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>
                    {grade}
                  </span>
                  <span className="text-gray-600">/ {submission.maxScore}</span>
                  <span className={`text-lg font-semibold ${getGradeColor(grade)}`}>
                    ({getGradeLetter(grade)})
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="input"
                rows={4}
                placeholder="Provide feedback to the student..."
              />
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
                {loading ? 'Grading...' : 'Submit Grade'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GradeSubmission;
