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
                  <div className="flex flex-col items-end space-y-2">
                    {assignment.submissions && assignment.submissions.length > 0 ? (
                      <>
                        {assignment.submissions[assignment.submissions.length - 1].grade && assignment.submissions[assignment.submissions.length - 1].grade.marks !== undefined ? (
                          <span className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Grade: {assignment.submissions[assignment.submissions.length - 1].grade.marks}/{assignment.maxScore || 100}
                          </span>
                        ) : (
                          <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Submitted
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Attempt {assignment.submissions.length}/{assignment.maxAttempts || 3}
                        </span>
                      </>
                    ) : assignment.dueDate && new Date() > new Date(assignment.dueDate) ? (
                      <span className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        Past Due
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        To Do
                      </span>
                    )}
                  </div>
                </div>

                {/* Virtual Lab Section - Show if no submissions OR if resubmission allowed */}
                {(!assignment.submissions || assignment.submissions.length === 0 ||
                  ((assignment.submissions.length < (assignment.maxAttempts || 3)) && (!assignment.dueDate || new Date() <= new Date(assignment.dueDate)))
                ) && (
                    assignment.dueDate && new Date() > new Date(assignment.dueDate) ? (
                      <div className="border-t pt-4">
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <div className="flex items-center text-red-800 font-medium mb-1">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Submission Period Closed
                          </div>
                          <p className="text-red-700 text-sm">
                            The deadline for this assignment has passed ({new Date(assignment.dueDate).toLocaleString()}).
                            Submissions are no longer accepted. Please contact your instructor if you have questions.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4 space-y-6">
                        {assignment.submissions && assignment.submissions.length > 0 && (
                          <div className="flex items-center text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <span className="font-medium">Resubmitting Assignment (Attempt {assignment.submissions.length + 1} of {assignment.maxAttempts || 3})</span>
                          </div>
                        )}
                        {/* Step 1: Complete Virtual Lab */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-3">Step 1: Complete Virtual Lab</h4>
                          <p className="text-blue-800 text-sm mb-4">
                            Complete the {assignment.labTitle || assignment.title} simulation to gather your results.
                          </p>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                // Navigate to the specific lab based on assignment labType
                                const labRoutes = {
                                  'electronics': '/ohms-law-lab',
                                  'physics': '/pendulum-lab',
                                  'chemistry': '/chemistry-lab',
                                  'circuit': '/circuit-analysis-lab',
                                  'logic': '/logic-gate-lab',
                                  'optics': '/double-slit-lab',
                                  'arduino': '/arduino-lab'
                                };
                                // Primary: use stored labType (for new assignments)
                                let labType = assignment.labType;
                                let route = labType && labRoutes[labType];

                                // Fallback for old assignments without labType: guess from title
                                if (!route) {
                                  const titleLower = (assignment.title + ' ' + (assignment.labTitle || '')).toLowerCase();
                                  if (titleLower.includes('arduino')) route = '/arduino-lab';
                                  else if (titleLower.includes('pendulum')) route = '/pendulum-lab';
                                  else if (titleLower.includes('chemistry') || titleLower.includes('chemical')) route = '/chemistry-lab';
                                  else if (titleLower.includes('circuit')) route = '/circuit-analysis-lab';
                                  else if (titleLower.includes('logic') || titleLower.includes('gate')) route = '/logic-gate-lab';
                                  else if (titleLower.includes('slit') || titleLower.includes('optic') || titleLower.includes('light')) route = '/double-slit-lab';
                                  else if (titleLower.includes('ohm') || titleLower.includes('electr') || titleLower.includes('iot') || titleLower.includes('resistor') || titleLower.includes('voltage')) route = '/ohms-law-lab';
                                }

                                if (!route) {
                                  alert(`Could not determine which lab to open for this assignment. Please ask your teacher to recreate it.`);
                                  return;
                                }
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

                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Step 2: Submit Your Lab Report</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const demoData = {
                                  'electronics': {
                                    'best': {
                                      results: "Voltage: 12.0V, Current: 3.0A, Resistance: 4.0Ω. The relationship follows V=IR.",
                                      observations: "I observed that as the voltage increased while keeping resistance constant, the current increased proportionally. The plot was linear and showed no deviations.",
                                      analysis: "Therefore, the circuit behaves according to Ohm's Law. The experimental resistance calculated from the slope matches the nominal value of 4 ohms perfectly. This proves the proportionality between voltage and current. Linear regression was used."
                                    },
                                    'average': {
                                      results: "V=12, I=3, R=4. Values look okay.",
                                      observations: "I saw some numbers on the screen. The current went up when I changed things.",
                                      analysis: "The results show that Ohm's law works. I think it is proportional."
                                    }
                                  },
                                  'arduino': {
                                    'best': {
                                      results: "LED blinked every 500ms using digitalWrite(13, HIGH/LOW). PWM duty cycle set to 128/255 (50%). GPIO pin 9 measured 2.49V output. Loop ran 1000 iterations successfully.",
                                      observations: "I observed the LED blinking at the programmed interval. When I adjusted the delay() value, the blink speed changed proportionally. The PWM output produced a smooth analog-like dimming effect on the LED.",
                                      analysis: "The Arduino Uno successfully executed the embedded C++ program. GPIO control via digitalWrite() confirmed digital output at 5V logic high. PWM via analogWrite() modulates pin duty cycle, validating embedded systems principles. The microcontroller loop() function iterated correctly without overflow errors."
                                    },
                                    'average': {
                                      results: "LED blinked. Delay was 1000ms. PWM was set to some value.",
                                      observations: "The LED turned on and off. Changing the delay changed the timing.",
                                      analysis: "The Arduino program worked. GPIO pins can be set HIGH or LOW to control output."
                                    }
                                  },
                                  'circuit': {
                                    'best': {
                                      results: "Node voltage V1=5V, V2=3.3V. Branch current I1=0.5A, I2=0.33A. Total power dissipated: 2.75W. Thevenin equivalent: Vth=4V, Rth=2Ω.",
                                      observations: "I applied KVL and KCL at each node. The current distribution matched theoretical predictions. Parallel resistors reduced equivalent resistance as expected by 1/Req = 1/R1 + 1/R2.",
                                      analysis: "Kirchhoff's Voltage and Current Laws were successfully verified in the simulation. The Thevenin equivalent circuit accurately models the behavior of the original network. Power dissipation calculated via P=IV matched the sum of individual resistor dissipations."
                                    },
                                    'average': {
                                      results: "Voltage was 5V. Current was around 0.5A. Resistance was 10 ohms.",
                                      observations: "The circuit worked. Adding resistors in parallel lowered the resistance.",
                                      analysis: "KVL says voltages in a loop sum to zero. My results were roughly correct."
                                    }
                                  },
                                  'logic': {
                                    'best': {
                                      results: "AND gate: output HIGH only when both inputs HIGH. OR gate: output HIGH when at least one input HIGH. XOR: output HIGH when inputs differ. NAND: inverse of AND. Truth tables verified for all 4 input combinations.",
                                      observations: "I tested all 16 possible 2-input gate combinations. Boolean algebra identities such as De Morgan's theorem (NOT(A AND B) = NOT A OR NOT B) were verified experimentally using NAND and NOR gates.",
                                      analysis: "All logic gates operated according to their Boolean expressions. The NAND gate is functionally complete — AND, OR, and NOT gates were each constructed using only NAND gates. This validates the universality of NAND in digital circuit design."
                                    },
                                    'average': {
                                      results: "AND gate: both HIGH = HIGH. OR gate: one HIGH = HIGH. XOR different inputs = HIGH.",
                                      observations: "I tested a few inputs and the outputs matched the truth table.",
                                      analysis: "Logic gates work based on Boolean algebra. AND needs both inputs HIGH to output HIGH."
                                    }
                                  },
                                  'physics': {
                                    'best': {
                                      results: "Measured Period (T): 2.01s for a length of 1.0m. Gravity calculated: 9.8 m/s².",
                                      observations: "The pendulum oscillation was smooth and consistent. I noticed that changing the mass did not significantly affect the period of the swing, nor did the amplitude for small angles.",
                                      analysis: "The relationship T = 2π√(L/g) was verified. The harmonic motion analysis shows that length is the primary factor for the period, and the calculated gravity aligns with the standard 9.8 m/s²."
                                    },
                                    'average': {
                                      results: "Period was 2 seconds around. G is 9.",
                                      observations: "It swung back and forth. It looked like harmonic motion.",
                                      analysis: "Gravity is 9.8 usually. My result was close."
                                    }
                                  },
                                  'chemistry': {
                                    'best': {
                                      results: 'pH level measured: 7.0, Molarity of solution: 0.1M, Temperature: 25°C.',
                                      observations: 'The solution appeared clear and neutral. No distinct color change was observed when using a neutral indicator, confirming the balanced chemical state.',
                                      analysis: 'Based on the pH of 7.0, the solution is considered chemically neutral. The molarity of 0.1M is within the expected range for this simulation, proving the solution was prepared correctly. Indicators worked well.'
                                    },
                                    'average': {
                                      results: 'pH 7, 0.1M.',
                                      observations: 'Clear solution. No color change.',
                                      analysis: 'Neutral pH means its not acid or base.'
                                    }
                                  },
                                  'optics': {
                                    'best': {
                                      results: 'Wavelength: 650nm, Slit Separation: 0.25mm, Fringe Spacing: 2.6mm. The pattern confirms wave interference.',
                                      observations: 'I observed a series of bright and dark fringes on the screen. The spacing increased when I decreased the slit width, which is consistent with diffraction theory.',
                                      analysis: 'The experiment successfully demonstrates the wave nature of light. The calculated fringe spacing using the interference formula matches our measurements with high precision. Huygens principle is verified.'
                                    },
                                    'average': {
                                      results: 'Red light used. Fringes were seen.',
                                      observations: 'Lots of dots on the screen. It looked like waves.',
                                      analysis: 'Light is a wave because it interferes.'
                                    }
                                  }
                                };
                                const labType = assignment.labType || 'electronics';
                                const typeData = demoData[labType] || demoData['electronics'];
                                const data = typeData['best'];
                                document.getElementById(`results-${assignment._id}`).value = data.results;
                                document.getElementById(`observations-${assignment._id}`).value = data.observations;
                                document.getElementById(`analysis-${assignment._id}`).value = data.analysis;
                              }}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors flex items-center"
                            >
                              🌟 Best Report (100%)
                            </button>
                            <button
                              onClick={() => {
                                const demoData = {
                                  'electronics': {
                                    'best': {
                                      results: "Voltage: 12.0V, Current: 3.0A, Resistance: 4.0Ω. The relationship follows V=IR.",
                                      observations: "I observed that as the voltage increased while keeping resistance constant, the current increased proportionally. The plot was linear and showed no deviations.",
                                      analysis: "Therefore, the circuit behaves according to Ohm's Law. The experimental resistance calculated from the slope matches the nominal value of 4 ohms perfectly. This proves the proportionality between voltage and current. Linear regression was used."
                                    },
                                    'average': {
                                      results: "V=12, I=3, R=4. Values look okay.",
                                      observations: "I saw some numbers on the screen. The current went up when I changed things.",
                                      analysis: "The results show that Ohm's law works. I think it is proportional."
                                    }
                                  },
                                  'arduino': {
                                    'best': {
                                      results: "LED blinked every 500ms using digitalWrite(13, HIGH/LOW). PWM duty cycle set to 128/255 (50%). GPIO pin 9 measured 2.49V output. Loop ran 1000 iterations successfully.",
                                      observations: "I observed the LED blinking at the programmed interval. When I adjusted the delay() value, the blink speed changed proportionally. The PWM output produced a smooth analog-like dimming effect on the LED.",
                                      analysis: "The Arduino Uno successfully executed the embedded C++ program. GPIO control via digitalWrite() confirmed digital output at 5V logic high. PWM via analogWrite() modulates pin duty cycle, validating embedded systems principles. The microcontroller loop() function iterated correctly without overflow errors."
                                    },
                                    'average': {
                                      results: "LED blinked. Delay was 1000ms. PWM was set to some value.",
                                      observations: "The LED turned on and off. Changing the delay changed the timing.",
                                      analysis: "The Arduino program worked. GPIO pins can be set HIGH or LOW to control output."
                                    }
                                  },
                                  'circuit': {
                                    'best': {
                                      results: "Node voltage V1=5V, V2=3.3V. Branch current I1=0.5A, I2=0.33A. Total power dissipated: 2.75W. Thevenin equivalent: Vth=4V, Rth=2Ω.",
                                      observations: "I applied KVL and KCL at each node. The current distribution matched theoretical predictions. Parallel resistors reduced equivalent resistance as expected by 1/Req = 1/R1 + 1/R2.",
                                      analysis: "Kirchhoff's Voltage and Current Laws were successfully verified in the simulation. The Thevenin equivalent circuit accurately models the behavior of the original network. Power dissipation calculated via P=IV matched the sum of individual resistor dissipations."
                                    },
                                    'average': {
                                      results: "Voltage was 5V. Current was around 0.5A. Resistance was 10 ohms.",
                                      observations: "The circuit worked. Adding resistors in parallel lowered the resistance.",
                                      analysis: "KVL says voltages in a loop sum to zero. My results were roughly correct."
                                    }
                                  },
                                  'logic': {
                                    'best': {
                                      results: "AND gate: output HIGH only when both inputs HIGH. OR gate: output HIGH when at least one input HIGH. XOR: output HIGH when inputs differ. NAND: inverse of AND. Truth tables verified for all 4 input combinations.",
                                      observations: "I tested all 16 possible 2-input gate combinations. Boolean algebra identities such as De Morgan's theorem (NOT(A AND B) = NOT A OR NOT B) were verified experimentally using NAND and NOR gates.",
                                      analysis: "All logic gates operated according to their Boolean expressions. The NAND gate is functionally complete — AND, OR, and NOT gates were each constructed using only NAND gates. This validates the universality of NAND in digital circuit design."
                                    },
                                    'average': {
                                      results: "AND gate: both HIGH = HIGH. OR gate: one HIGH = HIGH. XOR different inputs = HIGH.",
                                      observations: "I tested a few inputs and the outputs matched the truth table.",
                                      analysis: "Logic gates work based on Boolean algebra. AND needs both inputs HIGH to output HIGH."
                                    }
                                  },
                                  'physics': {
                                    'best': {
                                      results: "Measured Period (T): 2.01s for a length of 1.0m. Gravity calculated: 9.8 m/s².",
                                      observations: "The pendulum oscillation was smooth and consistent. I noticed that changing the mass did not significantly affect the period of the swing, nor did the amplitude for small angles.",
                                      analysis: "The relationship T = 2π√(L/g) was verified. The harmonic motion analysis shows that length is the primary factor for the period, and the calculated gravity aligns with the standard 9.8 m/s²."
                                    },
                                    'average': {
                                      results: "Period was 2 seconds around. G is 9.",
                                      observations: "It swung back and forth. It looked like harmonic motion.",
                                      analysis: "Gravity is 9.8 usually. My result was close."
                                    }
                                  },
                                  'chemistry': {
                                    'best': {
                                      results: "pH level measured: 7.0, Molarity of solution: 0.1M, Temperature: 25°C.",
                                      observations: "The solution appeared clear and neutral. No distinct color change was observed when using a neutral indicator, confirming the balanced chemical state.",
                                      analysis: "Based on the pH of 7.0, the solution is considered chemically neutral. The molarity of 0.1M is within the expected range for this simulation, proving the solution was prepared correctly. Indicators worked well."
                                    },
                                    'average': {
                                      results: "pH 7, 0.1M.",
                                      observations: "Clear solution. No color change.",
                                      analysis: "Neutral pH means its not acid or base."
                                    }
                                  },
                                  'optics': {
                                    'best': {
                                      results: 'Wavelength: 650nm, Slit Separation: 0.25mm, Fringe Spacing: 2.6mm. The pattern confirms wave interference.',
                                      observations: 'I observed a series of bright and dark fringes on the screen. The spacing increased when I decreased the slit width, which is consistent with diffraction theory.',
                                      analysis: 'The experiment successfully demonstrates the wave nature of light. The calculated fringe spacing using the interference formula matches our measurements with high precision. Huygens principle is verified.'
                                    },
                                    'average': {
                                      results: 'Red light used. Fringes were seen.',
                                      observations: 'Lots of dots on the screen. It looked like waves.',
                                      analysis: 'Light is a wave because it interferes.'
                                    }
                                  }
                                };
                                const labType = assignment.labType || 'electronics';
                                const typeData = demoData[labType] || demoData['electronics'];
                                const data = typeData['average'];
                                document.getElementById(`results-${assignment._id}`).value = data.results;
                                document.getElementById(`observations-${assignment._id}`).value = data.observations;
                                document.getElementById(`analysis-${assignment._id}`).value = data.analysis;
                              }}
                              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors flex items-center"
                            >
                              ⚖️ Average Report (~70%)
                            </button>
                          </div>
                        </div>
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
                          {/* Submit Button */}
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
                              {submitting[assignment._id] ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  AI Analyzing... 🤖
                                </span>
                              ) : 'Submit Lab Report'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                {/* Show submitted work */}
                {assignment.submissions && assignment.submissions.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Your Submission</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{assignment.submissions[assignment.submissions.length - 1].content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Submitted on: {new Date(assignment.submissions[assignment.submissions.length - 1].submittedAt).toLocaleString()}
                      </p>
                      {assignment.submissions[assignment.submissions.length - 1].grade && assignment.submissions[assignment.submissions.length - 1].grade.marks !== undefined && (
                        <div className="mt-4 bg-white p-4 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-blue-600">
                              Grade: {assignment.submissions[assignment.submissions.length - 1].grade.marks}/{assignment.maxScore || 100}
                            </span>
                            <div className="flex items-center space-x-2">
                              {assignment.submissions[assignment.submissions.length - 1].grade.autoGraded && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  🤖 Auto-Graded
                                </span>
                              )}
                              {assignment.submissions[assignment.submissions.length - 1].grade.wasAutoGraded && !assignment.submissions[assignment.submissions.length - 1].grade.autoGraded && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                  👨‍🏫 Teacher Reviewed
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Show if teacher overrode auto-grade */}
                          {assignment.submissions[assignment.submissions.length - 1].grade.wasAutoGraded && !assignment.submissions[assignment.submissions.length - 1].grade.autoGraded && assignment.submissions[assignment.submissions.length - 1].grade.previousAutoScore && (
                            <div className="mb-3 p-2 bg-purple-50 rounded text-xs">
                              <p className="text-purple-700">
                                📝 Your teacher reviewed your submission and updated your grade.
                                {assignment.submissions[0].grade.previousAutoScore && (
                                  <span className="ml-1">
                                    (Original auto-grade: {assignment.submissions[assignment.submissions.length - 1].grade.previousAutoScore}/{assignment.maxScore || 100})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}

                          {/* Main Feedback */}
                          {assignment.submissions[assignment.submissions.length - 1].grade.feedback && (
                            <p className="text-sm text-gray-700 mb-2">
                              {assignment.submissions[assignment.submissions.length - 1].grade.feedback}
                            </p>
                          )}

                          {/* Detailed Feedback Array */}
                          {assignment.submissions[assignment.submissions.length - 1].grade.feedbackArray && assignment.submissions[assignment.submissions.length - 1].grade.feedbackArray.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Detailed Breakdown:</p>
                              <ul className="text-xs space-y-1">
                                {assignment.submissions[assignment.submissions.length - 1].grade.feedbackArray.map((item, idx) => (
                                  <li key={idx} className={item.startsWith('✓') ? 'text-green-600' : item.startsWith('X') || item.startsWith('x') ? 'text-red-600' : 'text-gray-700'}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Score Breakdown */}
                          {(() => {
                            const latestSubmission = assignment.submissions[assignment.submissions.length - 1];
                            return latestSubmission.grade.breakdown && (
                              <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs text-gray-700">
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-semibold block">Scientific Accuracy:</span>
                                  {latestSubmission.grade.breakdown.scientific_accuracy || latestSubmission.grade.breakdown.ruleBasedScore || 0}/40
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-semibold block">Exp. Method:</span>
                                  {latestSubmission.grade.breakdown.experimental_method || 0}/20

                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-semibold block">Analysis:</span>
                                  {latestSubmission.grade.breakdown.analysis_quality || 0}/25
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-semibold block">Report Quality:</span>
                                  {latestSubmission.grade.breakdown.report_quality || 0}/15
                                </div>
                              </div>
                            )
                          })()}

                          {/* Improvement Suggestion - NEW */}
                          {assignment.submissions[assignment.submissions.length - 1].grade.improvementSuggestion && (
                            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                              <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1 flex items-center">
                                <span className="mr-1">💡</span> Improvement Suggestion
                              </h5>
                              <p className="text-sm text-indigo-900">
                                {assignment.submissions[assignment.submissions.length - 1].grade.improvementSuggestion}
                              </p>
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
    </div >
  );
};

export default StudentAssignments;
