/**
 * Auto-Grading System
 * Combines Rule-Based and Rubric-Based grading for Virtual Lab assignments
 */

/**
 * Extract numerical values from submission text
 * @param {string} text - Submission content
 * @param {string} field - Field name to extract (voltage, current, resistance, etc.)
 * @returns {number|null} - Extracted value or null
 */
function extractNumber(text, field) {
  // Create regex to find the field and its value
  const patterns = [
    new RegExp(`${field}[:\\s]+([0-9.]+)`, 'i'),
    new RegExp(`${field}[=\\s]+([0-9.]+)`, 'i'),
    new RegExp(`${field}\\s*:\\s*([0-9.]+)`, 'i')
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
  }
  return null;
}

/**
 * Check if a value is within tolerance of expected value
 * @param {number} actual - Actual value from submission
 * @param {number} expected - Expected value
 * @param {number} tolerance - Acceptable tolerance
 * @returns {boolean}
 */
function isWithinTolerance(actual, expected, tolerance) {
  if (actual === null || actual === undefined) return false;
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Check if a value is within a range
 * @param {number} value - Value to check
 * @param {object} range - Range object with min and max
 * @returns {boolean}
 */
function isInRange(value, range) {
  if (value === null || value === undefined) return false;
  if (!range || !range.min || !range.max) return false;
  return value >= range.min && value <= range.max;
}

/**
 * Count keywords in text
 * @param {string} text - Text to search
 * @param {array} keywords - Array of keywords to find
 * @returns {number} - Count of unique keywords found
 */
function countKeywords(text, keywords) {
  if (!text || !keywords) return 0;
  const lowerText = text.toLowerCase();
  let count = 0;
  
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      count++;
    }
  });
  
  return count;
}

/**
 * Check if submission has a specific section
 * @param {string} text - Submission text
 * @param {array} indicators - Keywords that indicate the section exists
 * @param {number} minLength - Minimum length for the section
 * @returns {boolean}
 */
function hasSection(text, indicators, minLength = 20) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  
  for (const indicator of indicators) {
    const index = lowerText.indexOf(indicator.toLowerCase());
    if (index !== -1) {
      // Check if there's enough content after the indicator
      const contentAfter = text.substring(index).length;
      if (contentAfter >= minLength) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Main auto-grading function
 * Combines rule-based and rubric-based grading
 * 
 * @param {string} submission - Student's submission text
 * @param {object} gradingCriteria - Grading criteria from assignment
 * @returns {object} - Grading result with score and feedback
 */
function autoGrade(submission, gradingCriteria) {
  if (!submission || !gradingCriteria) {
    return {
      score: 0,
      maxScore: 100,
      breakdown: {},
      feedback: ['Unable to grade: Missing submission or grading criteria'],
      autoGraded: true
    };
  }

  let totalScore = 0;
  const breakdown = {};
  const feedback = [];
  const detailedFeedback = [];

  // ===========================================
  // PART 1: RULE-BASED GRADING (Scientific/Mathematical Rules)
  // ===========================================
  
  if (gradingCriteria.rules && gradingCriteria.rules.expectedValues) {
    const rules = gradingCriteria.rules.expectedValues;
    let ruleScore = 0;
    const ruleMaxScore = gradingCriteria.rules.totalPoints || 50;

    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const extractedValue = extractNumber(submission, field);
      
      if (extractedValue !== null) {
        const isCorrect = isWithinTolerance(
          extractedValue, 
          rule.value, 
          rule.tolerance || 0
        );
        
        if (isCorrect) {
          ruleScore += rule.points || 0;
          feedback.push(`✓ ${field}: Correct (${rule.points}/${rule.points})`);
          detailedFeedback.push(`Your ${field} value of ${extractedValue} is correct!`);
        } else {
          feedback.push(`✗ ${field}: Incorrect (0/${rule.points})`);
          detailedFeedback.push(`Your ${field} value of ${extractedValue} is outside the expected range.`);
        }
      } else {
        feedback.push(`✗ ${field}: Not found (0/${rule.points})`);
        detailedFeedback.push(`Could not find ${field} value in your submission.`);
      }
    });

    breakdown.ruleBasedScore = ruleScore;
    breakdown.ruleMaxScore = ruleMaxScore;
    totalScore += ruleScore;
  }

  // ===========================================
  // PART 2: RUBRIC-BASED GRADING (Report Quality/Completeness)
  // ===========================================
  
  if (gradingCriteria.rubric) {
    const rubric = gradingCriteria.rubric;
    let rubricScore = 0;
    const rubricMaxScore = gradingCriteria.rubric.totalPoints || 50;

    // Check for required sections
    if (rubric.sections) {
      Object.keys(rubric.sections).forEach(sectionName => {
        const section = rubric.sections[sectionName];
        const hasIt = hasSection(submission, section.indicators || [sectionName], section.minLength || 20);
        
        if (hasIt) {
          rubricScore += section.points || 0;
          feedback.push(`✓ ${sectionName}: Present (${section.points}/${section.points})`);
        } else {
          feedback.push(`✗ ${sectionName}: Missing (0/${section.points})`);
          detailedFeedback.push(`Please include a ${sectionName} section in your report.`);
        }
      });
    }

    // Check for required keywords
    if (rubric.keywords) {
      const keywordCount = countKeywords(submission, rubric.keywords.list || []);
      const keywordPoints = Math.min(
        keywordCount * (rubric.keywords.pointsPerKeyword || 2),
        rubric.keywords.maxPoints || 10
      );
      
      rubricScore += keywordPoints;
      feedback.push(`✓ Keywords found: ${keywordCount} (+${keywordPoints} points)`);
      
      if (keywordCount < (rubric.keywords.list || []).length) {
        const missingKeywords = (rubric.keywords.list || []).filter(kw => 
          !submission.toLowerCase().includes(kw.toLowerCase())
        );
        if (missingKeywords.length > 0) {
          detailedFeedback.push(`Consider including these terms: ${missingKeywords.slice(0, 3).join(', ')}`);
        }
      }
    }

    // Check minimum length requirement
    if (rubric.minLength) {
      if (submission.length >= rubric.minLength) {
        const lengthPoints = rubric.minLengthPoints || 5;
        rubricScore += lengthPoints;
        feedback.push(`✓ Sufficient detail (+${lengthPoints} points)`);
      } else {
        feedback.push(`✗ Report too short (0/${rubric.minLengthPoints || 5})`);
        detailedFeedback.push(`Your report should be at least ${rubric.minLength} characters. Current: ${submission.length}`);
      }
    }

    breakdown.rubricScore = rubricScore;
    breakdown.rubricMaxScore = rubricMaxScore;
    totalScore += rubricScore;
  }

  // ===========================================
  // CALCULATE FINAL RESULTS
  // ===========================================
  
  const maxScore = (gradingCriteria.rules?.totalPoints || 50) + 
                   (gradingCriteria.rubric?.totalPoints || 50);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  // Generate overall feedback
  let overallFeedback = '';
  if (percentage >= 90) {
    overallFeedback = '🌟 Excellent work! Your calculations are accurate and your report is comprehensive.';
  } else if (percentage >= 80) {
    overallFeedback = '👍 Good job! Your work shows solid understanding.';
  } else if (percentage >= 70) {
    overallFeedback = '✅ Satisfactory work. Review the feedback for areas to improve.';
  } else if (percentage >= 60) {
    overallFeedback = '⚠️ Needs improvement. Please review your calculations and report structure.';
  } else {
    overallFeedback = '❌ Please review the assignment requirements and try again.';
  }

  return {
    score: totalScore,
    maxScore: maxScore,
    percentage: percentage,
    breakdown: breakdown,
    feedback: feedback,
    detailedFeedback: detailedFeedback,
    overallFeedback: overallFeedback,
    autoGraded: true,
    gradedAt: new Date()
  };
}

/**
 * Default grading criteria for common lab types
 */
const defaultCriteria = {
  ohmsLaw: {
    rules: {
      totalPoints: 50,
      expectedValues: {
        voltage: { value: 12, tolerance: 0.5, points: 15 },
        current: { value: 3, tolerance: 0.1, points: 15 },
        resistance: { value: 4, tolerance: 0.2, points: 20 }
      }
    },
    rubric: {
      totalPoints: 50,
      sections: {
        'Results': { indicators: ['result', 'voltage', 'current'], points: 10, minLength: 30 },
        'Observations': { indicators: ['observe', 'noticed', 'found'], points: 15, minLength: 50 },
        'Analysis': { indicators: ['analysis', 'because', 'therefore', 'conclude'], points: 15, minLength: 50 }
      },
      keywords: {
        list: ['proportional', 'linear', 'ohm', 'resistance', 'circuit'],
        pointsPerKeyword: 2,
        maxPoints: 10
      },
      minLength: 200,
      minLengthPoints: 5
    }
  },
  
  chemistry: {
    rules: {
      totalPoints: 50,
      expectedValues: {
        pH: { value: 7.0, tolerance: 0.5, points: 20 },
        molarity: { value: 0.1, tolerance: 0.01, points: 15 },
        temperature: { value: 25, tolerance: 2, points: 15 }
      }
    },
    rubric: {
      totalPoints: 50,
      sections: {
        'Results': { indicators: ['result', 'pH', 'molarity'], points: 10, minLength: 30 },
        'Observations': { indicators: ['observe', 'color', 'change'], points: 15, minLength: 50 },
        'Analysis': { indicators: ['analysis', 'reaction', 'conclude'], points: 15, minLength: 50 }
      },
      keywords: {
        list: ['acid', 'base', 'neutralization', 'titration', 'indicator'],
        pointsPerKeyword: 2,
        maxPoints: 10
      },
      minLength: 200,
      minLengthPoints: 5
    }
  }
};

module.exports = {
  autoGrade,
  extractNumber,
  isWithinTolerance,
  isInRange,
  countKeywords,
  hasSection,
  defaultCriteria
};
