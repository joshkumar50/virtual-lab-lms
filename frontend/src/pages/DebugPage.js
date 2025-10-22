import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DebugPage = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
          <p className="mb-2"><strong>Course ID from URL:</strong> {id}</p>
          <p className="mb-2"><strong>Current URL:</strong> {window.location.href}</p>
          <p className="mb-2"><strong>Pathname:</strong> {window.location.pathname}</p>
          
          <div className="mt-4">
            <button 
              onClick={() => console.log('Button clicked!')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Button
            </button>
          </div>
          
          <div className="mt-4">
            <button 
              onClick={() => alert('Alert works!')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
            >
              Test Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
