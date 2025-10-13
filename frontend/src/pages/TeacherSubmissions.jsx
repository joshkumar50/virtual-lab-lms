import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, User, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';

const TeacherSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grading, setGrading] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/courses/teacher/submissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const gradeSubmission = async (submissionId, courseId, assignmentId, marks, feedback) => {
    if (!marks || marks < 0 || marks > 100) {
      alert('Please enter a valid grade (0-100)');
      return;
    }

    setGrading({ ...grading, [submissionId]: true });

    try {
      const response = await fetch(`/api/courses/${courseId}/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          marks: parseInt(marks),
          feedback
        })
      });

      if (response.ok) {
        alert('Grade submitted successfully!');
        fetchSubmissions(); // Refresh submissions
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit grade');
      }
    } catch (err) {
      alert('Failed to submit grade');
    } finally {
      setGrading({ ...grading, [submissionId]: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubmissions}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Submissions</h1>
        
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600">Students haven't submitted any assignments yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {submission.assignmentTitle}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {submission.courseTitle}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Student ID: {submission.student}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {submission.grade ? (
                      <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                        <Star className="w-4 h-4 mr-1" />
                        Graded ({submission.grade.marks}/100)
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Pending Grade
                      </span>
                    )}
                  </div>
                </div>

                {/* Student's Submission */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Student's Work</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>

                {/* Grading Section */}
                {!submission.grade ? (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Grade This Submission</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grade (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter grade"
                          className="input w-full"
                          id={`grade-${submission._id}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback
                        </label>
                        <textarea
                          placeholder="Enter feedback..."
                          className="input w-full"
                          rows={3}
                          id={`feedback-${submission._id}`}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          const marks = document.getElementById(`grade-${submission._id}`).value;
                          const feedback = document.getElementById(`feedback-${submission._id}`).value;
                          gradeSubmission(submission._id, submission.courseId, submission.assignmentId, marks, feedback);
                        }}
                        disabled={grading[submission._id]}
                        className="btn btn-primary"
                      >
                        {grading[submission._id] ? 'Grading...' : 'Submit Grade'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Grade & Feedback</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800">
                          Grade: {submission.grade.marks}/100
                        </span>
                        <span className="text-sm text-green-600">
                          Graded on: {new Date(submission.grade.gradedAt).toLocaleString()}
                        </span>
                      </div>
                      {submission.grade.feedback && (
                        <p className="text-green-700">{submission.grade.feedback}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSubmissions;
