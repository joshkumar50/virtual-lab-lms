import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Play, BookOpen, Zap, Atom, CircuitBoard, Beaker } from 'lucide-react';

const PracticePage = () => {
  // Static practice labs - no data storage needed
  const practiceLabs = [
    {
      id: 'ohms-law',
      title: "Ohm's Law Experiment",
      description: "Explore the relationship between voltage, current, and resistance in electrical circuits.",
      labType: "Circuit Analysis",
      difficulty: "Easy",
      duration: "30 min",
      icon: CircuitBoard,
      path: "/ohms-law-lab"
    },
    {
      id: 'logic-gates',
      title: "Logic Gate Simulator",
      description: "Practice with basic digital logic gates including AND, OR, NOT, and XOR gates.",
      labType: "Digital Logic",
      difficulty: "Medium",
      duration: "45 min",
      icon: Zap,
      path: "/logic-gate-lab"
    },
    {
      id: 'pendulum',
      title: "Pendulum Physics Lab",
      description: "Investigate the relationship between pendulum length and period of oscillation.",
      labType: "Physics",
      difficulty: "Easy",
      duration: "25 min",
      icon: Atom,
      path: "/pendulum-lab"
    },
    {
      id: 'double-slit',
      title: "Double Slit Experiment",
      description: "Observe wave interference patterns in the famous double-slit experiment.",
      labType: "Optics",
      difficulty: "Hard",
      duration: "40 min",
      icon: BookOpen,
      path: "/double-slit-lab"
    },
    {
      id: 'chemistry',
      title: "Chemistry Reaction Simulator",
      description: "Explore chemical reactions and balance equations in a virtual chemistry lab.",
      labType: "Chemistry",
      difficulty: "Medium",
      duration: "35 min",
      icon: Beaker,
      path: "/chemistry-lab"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Labs</h1>
          <p className="text-gray-600">Explore and practice any lab freely. No data is stored - just pure learning!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceLabs.map((lab, idx) => {
            const IconComponent = lab.icon;
            return (
              <motion.div 
                key={lab.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: idx * 0.1 }} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {lab.labType}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {lab.title}
                </h3>
                <p className="text-gray-600 mb-4">{lab.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{lab.duration}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    lab.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                    lab.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {lab.difficulty}
                  </span>
                </div>
                
                <Link to={lab.path} className="btn btn-primary w-full">
                  <Play className="w-4 h-4 mr-2" /> 
                  Start Practice
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;