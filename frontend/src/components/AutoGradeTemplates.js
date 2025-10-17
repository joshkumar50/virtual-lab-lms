/**
 * Auto-Grading Templates
 * Pre-defined grading criteria for common lab types
 */

export const autoGradeTemplates = {
  ohmsLaw: {
    name: "Ohm's Law Lab",
    description: "Auto-grades voltage, current, and resistance calculations",
    criteria: {
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
          'Results': { 
            indicators: ['result', 'voltage', 'current', 'resistance'], 
            points: 10, 
            minLength: 30 
          },
          'Observations': { 
            indicators: ['observe', 'noticed', 'found', 'saw'], 
            points: 15, 
            minLength: 50 
          },
          'Analysis': { 
            indicators: ['analysis', 'because', 'therefore', 'conclude', 'conclusion'], 
            points: 15, 
            minLength: 50 
          }
        },
        keywords: {
          list: ['proportional', 'linear', 'ohm', 'resistance', 'circuit', 'voltage', 'current'],
          pointsPerKeyword: 2,
          maxPoints: 10
        },
        minLength: 200,
        minLengthPoints: 5
      }
    }
  },

  chemistry: {
    name: "Chemistry Lab",
    description: "Auto-grades pH, molarity, and chemical observations",
    criteria: {
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
          'Results': { 
            indicators: ['result', 'pH', 'molarity', 'concentration'], 
            points: 10, 
            minLength: 30 
          },
          'Observations': { 
            indicators: ['observe', 'color', 'change', 'reaction'], 
            points: 15, 
            minLength: 50 
          },
          'Analysis': { 
            indicators: ['analysis', 'reaction', 'conclude', 'chemical'], 
            points: 15, 
            minLength: 50 
          }
        },
        keywords: {
          list: ['acid', 'base', 'neutralization', 'titration', 'indicator', 'solution', 'chemical'],
          pointsPerKeyword: 2,
          maxPoints: 10
        },
        minLength: 200,
        minLengthPoints: 5
      }
    }
  },

  circuitAnalysis: {
    name: "Circuit Analysis Lab",
    description: "Auto-grades circuit calculations and analysis",
    criteria: {
      rules: {
        totalPoints: 50,
        expectedValues: {
          totalResistance: { value: 10, tolerance: 0.5, points: 15 },
          totalCurrent: { value: 1.2, tolerance: 0.1, points: 15 },
          powerDissipated: { value: 14.4, tolerance: 1, points: 20 }
        }
      },
      rubric: {
        totalPoints: 50,
        sections: {
          'Results': { 
            indicators: ['result', 'resistance', 'current', 'power'], 
            points: 10, 
            minLength: 30 
          },
          'Observations': { 
            indicators: ['observe', 'series', 'parallel', 'circuit'], 
            points: 15, 
            minLength: 50 
          },
          'Analysis': { 
            indicators: ['analysis', 'kirchhoff', 'conclude', 'law'], 
            points: 15, 
            minLength: 50 
          }
        },
        keywords: {
          list: ['series', 'parallel', 'circuit', 'resistance', 'voltage', 'current', 'power'],
          pointsPerKeyword: 2,
          maxPoints: 10
        },
        minLength: 200,
        minLengthPoints: 5
      }
    }
  },

  generic: {
    name: "Generic Lab Report",
    description: "Basic auto-grading for any lab report structure",
    criteria: {
      rules: {
        totalPoints: 30,
        expectedValues: {}
      },
      rubric: {
        totalPoints: 70,
        sections: {
          'Introduction': { 
            indicators: ['introduction', 'objective', 'purpose', 'goal'], 
            points: 15, 
            minLength: 50 
          },
          'Results': { 
            indicators: ['result', 'data', 'measurement', 'value'], 
            points: 20, 
            minLength: 50 
          },
          'Discussion': { 
            indicators: ['discussion', 'observe', 'found', 'noticed'], 
            points: 15, 
            minLength: 50 
          },
          'Conclusion': { 
            indicators: ['conclusion', 'conclude', 'summary', 'therefore'], 
            points: 15, 
            minLength: 40 
          }
        },
        keywords: {
          list: ['experiment', 'procedure', 'method', 'result', 'conclusion', 'analysis'],
          pointsPerKeyword: 1,
          maxPoints: 5
        },
        minLength: 300,
        minLengthPoints: 5
      }
    }
  },

  custom: {
    name: "Custom Criteria",
    description: "Define your own grading criteria",
    criteria: {
      rules: {
        totalPoints: 50,
        expectedValues: {}
      },
      rubric: {
        totalPoints: 50,
        sections: {},
        keywords: {
          list: [],
          pointsPerKeyword: 2,
          maxPoints: 10
        },
        minLength: 150,
        minLengthPoints: 5
      }
    }
  }
};

export default autoGradeTemplates;
