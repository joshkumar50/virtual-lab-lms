import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Search, Play } from 'lucide-react';

const PracticePage = () => {
  const { setError } = useLab();
  const [labs, setLabs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/labs');
        const data = await res.json();
        setLabs(data?.labs || []);
      } catch (e) {
        setError('Failed to load labs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setError]);

  const filtered = labs.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    (l.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Labs</h1>
          <p className="text-gray-600">Explore and practice any lab freely. Your graded work still comes from enrolled courses.</p>
        </motion.div>

        <div className="card mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search labs..." className="input pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lab, idx) => (
              <motion.div key={lab._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="card-hover">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lab.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{lab.labType}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{lab.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{lab.estimatedDuration} min</span>
                    <span className={`px-2 py-1 rounded-full ${lab.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : lab.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{lab.difficulty}</span>
                  </div>
                  <Link to={`/${lab.labType.replace(/Lab|Simulator/g,'').toLowerCase()}${lab.labType.includes('LogicGate') ? '-lab' : lab.labType.includes('DoubleSlit') ? '-lab' : lab.labType.includes('Chemistry') ? '-lab' : lab.labType.includes('CircuitAnalysis') ? '-lab' : ''}`} className="btn btn-primary w-full">
                    <Play className="w-4 h-4 mr-2" /> Open Practice
                  </Link>
                </div>
              </motion.div)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePage;


