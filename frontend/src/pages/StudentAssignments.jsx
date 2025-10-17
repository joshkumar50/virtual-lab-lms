import React, { useEffect, useState } from 'react';
import API from '../api/index';
import Navbar from '../components/Navbar';
import { BookOpen, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      console.log('🔍 Fetching student assignments...');
      const response = await API.get('/api/courses/student/assignments');
      console.log('✅ Student assignments fetched:', response.data);
      setAssignments(response.data);
      setLoading(false);
      return;
    } catch (err) {
      console.error('❌ Error loading assignments:', err.message);
      setError('Failed to load assignments');
    }
    
    setLoading(false);
  };

  const submitAssignment = async (assignmentId, content, courseId) => {
    if (!content.trim()) return;
    
    setSubmitting({ ...submitting, [assignmentId]: true });
    
    try {
      console.log('🗊 Submitting assignment:', { assignmentId, courseId, contentLength: content.length });
      const response = await API.post(`/api/courses/${courseId}/submissions`, {
        assignmentId,
        content
      });
      console.log('✅ Assignment submitted successfully:', response.data);
      
      // Check if auto-graded
      if (response.data.autoGraded && response.data.gradeResult) {
        const grade = response.data.gradeResult;
        // Show detailed instant grade result
        const feedbackText = grade.feedback ? grade.feedback.join('\n') : '';
        alert(
          `🎉 Assignment Graded Instantly!\n\n` +
          `Score: ${grade.score}/${grade.maxScore} (${grade.percentage}%)\n\n` +
          `${grade.overallFeedback}\n\n` +
          `Detailed Feedback:\n${feedbackText.slice(0, 200)}...`
        );
      } else {
        alert('Assignment submitted successfully! Your teacher will grade it soon.');
      }
      
      fetchAssignments(); // Refresh assignments
      setSubmitting({ ...submitting, [assignmentId]: false });
      return;
    } catch (err) {
      console.error('❌ Error submitting assignment:', err.message);
      alert('Failed to submit assignment');
      setSubmitting({ ...submitting, [assignmentId]: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
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
            onClick={fetchAssignments}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Assignments</h1>
        
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600">Your teacher hasn't assigned any tasks yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{assignment.description}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {assignment.instructor?.name || 'Instructor'}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {assignment.courseTitle}
                      </div>
                      {assignment.dueDate && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {assignment.submissions && assignment.submissions.length > 0 ? (
                      assignment.submissions[0].grade ? (
                        <span className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Graded: {assignment.submissions[0].grade.marks}/100
                        </span>
                      ) : (
                        <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Submitted
                        </span>
                      )
                    ) : (
                      <span className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Virtual Lab Section */}
                {(!assignment.submissions || assignment.submissions.length === 0) && (
                  <div className="border-t pt-4 space-y-6">
                    {/* Step 1: Complete Virtual Lab */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Step 1: Complete Virtual Lab</h4>
                      <p className="text-blue-800 text-sm mb-4">
                        Complete the {assignment.labTitle || assignment.title} simulation to gather your results.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            // Navigate to the specific lab based on assignment type
                            const labRoutes = {
                              'electronics': '/ohms-law-lab',
                              'physics': '/ohms-law-lab',
                              'chemistry': '/chemistry-lab',
                              'circuit': '/circuit-analysis-lab',
                              'logic': '/logic-gate-lab'
                            };
                            const labType = assignment.labType || 'electronics';
                            const route = labRoutes[labType] || '/ohms-law-lab';
                            window.open(route, '_blank');
                          }}
                          className="btn btn-primary"
                        >
                          Start {assignment.labTitle || 'Virtual Lab'}
                        </button>
                        <span className="text-xs text-gray-500 flex items-center">
                          💡 Complete the lab, then return here to submit your report
                        </span>
                      </div>
                    </div>

                    {/* Step 2: Submit Lab Report */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Step 2: Submit Your Lab Report</h4>
                      <div className="space-y-4">
                        {/* Lab Results Summary */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lab Results Summary *
                          </label>
                          <textarea
                            placeholder="Describe your lab results (e.g., voltage: 12V, current: 3A, resistance: 4Ω, accuracy: 95%)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            id={`results-${assignment._id}`}
                          />
                        </div>
                        
                        {/* Observations */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observations
                          </label>
                          <textarea
                            placeholder="What did you observe during the lab simulation?"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            id={`observations-${assignment._id}`}
                          />
                        </div>
                        
                        {/* Analysis */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Analysis & Conclusions
                          </label>
                          <textarea
                            placeholder="What conclusions can you draw from your results? How do they relate to the theory?"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            id={`analysis-${assignment._id}`}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            const results = document.getElementById(`results-${assignment._id}`).value;
                            const observations = document.getElementById(`observations-${assignment._id}`).value;
                            const analysis = document.getElementById(`analysis-${assignment._id}`).value;
                            
                            if (!results.trim()) {
                              alert('Please enter your lab results summary before submitting.');
                              return;
                            }
                            
                            const fullContent = `Lab Results: ${results}\n\nObservations: ${observations}\n\nAnalysis: ${analysis}`;
                            submitAssignment(assignment._id, fullContent, assignment.courseId);
                          }}
                          disabled={submitting[assignment._id]}
                          className="btn btn-primary"
                        >
                          {submitting[assignment._id] ? 'Submitting...' : 'Submit Lab Report'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show submitted work */}
                {assignment.submissions && assignment.submissions.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Your Submission</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{assignment.submissions[0].content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Submitted on: {new Date(assignment.submissions[0].submittedAt).toLocaleString()}
                      </p>
                      {assignment.submissions[0].grade && (
                        <div className="mt-4 bg-white p-4 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-blue-600">
                              Grade: {assignment.submissions[0].grade.marks}/{assignment.maxScore || 100}
                            </span>
                            <div className="flex items-center space-x-2">
                              {assignment.submissions[0].grade.autoGraded && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  🤖 Auto-Graded
                                </span>
                              )}
                              {assignment.submissions[0].grade.wasAutoGraded && !assignment.submissions[0].grade.autoGraded && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                  👨‍🏫 Teacher Reviewed
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Show if teacher overrode auto-grade */}
                          {assignment.submissions[0].grade.wasAutoGraded && !assignment.submissions[0].grade.autoGraded && assignment.submissions[0].grade.previousAutoScore && (
                            <div className="mb-3 p-2 bg-purple-50 rounded text-xs">
                              <p className="text-purple-700">
                                📝 Your teacher reviewed your submission and updated your grade.
                                {assignment.submissions[0].grade.previousAutoScore && (
                                  <span className="ml-1">
                                    (Original auto-grade: {assignment.submissions[0].grade.previousAutoScore}/{assignment.maxScore || 100})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          
                          {/* Main Feedback */}
                          {assignment.submissions[0].grade.feedback && (
                            <p className="text-sm text-gray-700 mb-2">
                              {assignment.submissions[0].grade.feedback}
                            </p>
                          )}
                          
                          {/* Detailed Feedback Array */}
                          {assignment.submissions[0].grade.feedbackArray && assignment.submissions[0].grade.feedbackArray.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Detailed Breakdown:</p>
                              <ul className="text-xs space-y-1">
                                {assignment.submissions[0].grade.feedbackArray.map((item, idx) => (
                                  <li key={idx} className={item.startsWith('✓') ? 'text-green-600' : 'text-red-600'}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Score Breakdown */}
                          {assignment.submissions[0].grade.breakdown && (
                            <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                              <p>Rule-Based: {assignment.submissions[0].grade.breakdown.ruleBasedScore || 0}/{assignment.submissions[0].grade.breakdown.ruleMaxScore || 0}</p>
                              <p>Report Quality: {assignment.submissions[0].grade.breakdown.rubricScore || 0}/{assignment.submissions[0].grade.breakdown.rubricMaxScore || 0}</p>
                            </div>
                          )}
                        </div>
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

export default StudentAssignments;

