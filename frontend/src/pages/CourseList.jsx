import React, { useEffect, useState } from 'react';
import { fetchCourses } from '../api';
import Navbar from '../components/Navbar';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('fetchCourses error', e);
        setErr(e?.response?.data?.message || e.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading courses…</div>;
  if (err) return <div className="text-red-600 p-4">Error: {err}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No courses available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div key={c._id || c.id} className="bg-white p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                By: {(c.createdBy && (c.createdBy.name || c.createdBy.email)) || 
                     (c.instructor && (c.instructor.name || c.instructor.email)) || 
                     'Unknown'}
              </p>
              <p className="text-gray-700 mb-4">{c.description}</p>
              
              {c.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                  {c.category}
                </span>
              )}
              
              {c.level && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {c.level}
                </span>
              )}
              
              {c.assignments && c.assignments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {c.assignments.length} assignment{c.assignments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {c.students && c.students.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {c.students.length} student{c.students.length !== 1 ? 's' : ''} enrolled
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
