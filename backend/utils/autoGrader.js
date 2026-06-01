/**
 * Auto-Grading System
 * AI-Powered Grading for Virtual Lab assignments
 */

const ollamaService = require('../services/ollama-service');

/**
 * Subject-specific grading prompts
 */
const labPrompts = {
  'Ohms Law': `You are a physics professor grading an Ohm's Law lab report. 
    Analyze the following student submission.
    
    Grading Rubric (Total 100):
    1. Scientific Accuracy (40): Valid V=IR? Correct trend?
    2. Exp. Method (20): Realistic values?
    3. Analysis (25): Explains relationships?
    4. Report (15): Clarity?

    Return valid JSON only (no markdown):
    {
        "score": number,
        "breakdown": { "scientific_accuracy": number, "experimental_method": number, "analysis_quality": number, "report_quality": number },
        "feedback": ["Brief point 1", "Brief point 2"],
        "detailed_feedback": "Short summary (max 2 sentences).",
        "improvement_suggestion": "One concise tip."
    }
    
    Student Submission:
    
    Student Submission:
    `,
  'Chemistry': `You are a chemistry professor grading a pH Lab report. 
    Analyze the following student submission regarding acids, bases, and pH scale.
    
    Grading Rubric (Total 100):
    1. Scientific Accuracy (40): Correct pH? H+/OH- logic?
    2. Exp. Method (20): Variety tested?
    3. Analysis (25): Log scale explained?
    4. Report (15): Clear?

    Return valid JSON only (no markdown):
    {
        "score": number,
        "breakdown": { "scientific_accuracy": number, "experimental_method": number, "analysis_quality": number, "report_quality": number },
        "feedback": ["Brief point 1", "Brief point 2"],
        "detailed_feedback": "Short summary (max 2 sentences).",
        "improvement_suggestion": "One concise tip."
    }
    
    Student Submission:
    
    Student Submission:
    `,
  'Pendulum': `You are a physics professor grading a Simple Pendulum lab report. 
    Analyze the following student submission regarding period, length, mass, and amplitude.
    
    Grading Rubric (Total 100):
    1. Scientific Accuracy (40): T=2π√(L/g)? Mass/Amp don't affect T?
    2. Exp. Method (20): Controlled?
    3. Analysis (25): Error analysis?
    4. Report (15): Structured?

    Return valid JSON only (no markdown):
    {
        "score": number,
        "breakdown": { "scientific_accuracy": number, "experimental_method": number, "analysis_quality": number, "report_quality": number },
        "feedback": ["Brief point 1", "Brief point 2"],
        "detailed_feedback": "Short summary (max 2 sentences).",
        "improvement_suggestion": "One concise tip."
    }
    
    Student Submission:
    
    Student Submission:
    `,
  'Double Slit': `You are a physics professor grading a Double Slit Experiment report. 
    Analyze the following student submission regarding wave interference.
    
    Grading Rubric (Total 100):
    1. Scientific Accuracy (40): Δy = λD/d used? Interference explained?
    2. Exp. Method (20): Pattern changes observed?
    3. Analysis (25): Wave nature explained?
    4. Report (15): Clear?

    Return valid JSON only (no markdown):
    {
        "score": number,
        "breakdown": { "scientific_accuracy": number, "experimental_method": number, "analysis_quality": number, "report_quality": number },
        "feedback": ["Brief point 1", "Brief point 2"],
        "detailed_feedback": "Short summary (max 2 sentences).",
        "improvement_suggestion": "One concise tip."
    }
    
    Student Submission:
    
    Student Submission:
    `,
  'Arduino': `You are an embedded systems instructor grading an Arduino Uno lab report. 
    Analyze the student's code logic, pin configurations, and circuit behavior observations.
    
    Grading Rubric (Total 100):
    1. Code Logic (40): Correct logic? Proper loop/setup usage?
    2. Pins & Hardware (20): Correct pin assignments? 
    3. Analysis (25): Explains circuit behavior correctly?
    4. Code Quality (15): Comments and readability?

    Return valid JSON only (no markdown):
    {
        "score": number,
        "breakdown": { "code_logic": number, "hardware_config": number, "analysis_quality": number, "code_quality": number },
        "feedback": ["Brief point 1", "Brief point 2"],
        "detailed_feedback": "Short summary (max 2 sentences).",
        "improvement_suggestion": "One concise tip."
    }
    
    Student Submission:
    `
};

/**
 * Clean JSON string from Markdown code blocks
 * @param {string} text - The raw text from LLM
 * @returns {string} - Cleaned JSON string
 */
function cleanJsonString(text) {
  if (!text) return '{}';
  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  // Find the first '{' and last '}' to extract just the JSON object
  const firstOpen = clean.indexOf('{');
  const lastClose = clean.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }

  return clean.trim();
}

/**
 * Analyze submission using Ollama
 * @param {string} submission - The student's text report
 * @param {string} subject - The subject/topic of the lab
 * @returns {Promise<object>} - The grading result
 */
async function autoGradeWithAI(submission, subject) {
  // 1. Determine Prompt
  // Match subject to key in labPrompts (partial match)
  let promptKey = Object.keys(labPrompts).find(key =>
    subject.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(subject.toLowerCase())
  );

  if (!promptKey) {
    // Fallback or generic logic could go here
    // If subject is undefined or not found, defaults to Ohms Law or we could have a 'General' prompt
    promptKey = 'Ohms Law';
  }

  const basePrompt = labPrompts[promptKey];
  const completePrompt = `${basePrompt}\n\n${submission}\n\nResponse (JSON only):`;

  try {
    // 3. Call AI
    const responseText = await ollamaService.gradeSubmission(completePrompt, 'qwen3:8b');

    // 4. Parse JSON
    const cleanedJson = cleanJsonString(responseText);
    let result;
    try {
      result = JSON.parse(cleanedJson);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      console.log('Raw output:', responseText);
      return {
        score: 0,
        breakdown: { error: "AI Parsing Failed" },
        feedback: ["AI Output was not valid JSON", "Manual Review Required"],
        detailedFeedback: "The AI grader produced an invalid format. Please review manually.",
        improvement_suggestion: "N/A",
        autoGraded: false,
        status: 'pending_manual_review',
        error: true
      };
    }

    // 5. Structure Return Object
    return {
      score: result.score,
      maxScore: 100,
      breakdown: result.breakdown,
      feedback: result.feedback || [],
      detailedFeedback: result.detailed_feedback || "",
      improvementSuggestion: result.improvement_suggestion || "",
      overallFeedback: result.detailed_feedback ? result.detailed_feedback.substring(0, 100) + "..." : "AI Graded",
      autoGraded: true,
      status: 'graded',
      gradedAt: new Date(),
      aiModel: 'qwen3:8b'
    };

  } catch (error) {
    console.error('AI Grading Error:', error);
    return {
      score: 0,
      feedback: ["AI Service Unavailable", "Marked for Manual Review"],
      autoGraded: false,
      status: 'pending_manual_review',
      error: true
    };
  }
}

// Deprecated: Placeholder for backward compatibility until all callers are updated
// The old rule-based logic is removed as per requirements.
function autoGrade(submission, criterion) {
  console.warn("autoGrade (legacy) called. Returning manual review status.");
  return {
    score: 0,
    maxScore: 100,
    feedback: ["Legacy grading disabled", "Pending Manual Review"],
    autoGraded: false,
    status: 'pending_manual_review'
  };
}


module.exports = {
  autoGradeWithAI,
  autoGrade
};
