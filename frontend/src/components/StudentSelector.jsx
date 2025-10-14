import React, { useState, useEffect } from 'react';
import { User, Search, Check, X } from 'lucide-react';

const StudentSelector = ({ selectedStudents, onSelectionChange, courseId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentToggle = (student) => {
    const isSelected = selectedStudents.some(s => s._id === student._id);
    if (isSelected) {
      onSelectionChange(selectedStudents.filter(s => s._id !== student._id));
    } else {
      onSelectionChange([...selectedStudents, student]);
    }
  };

  const removeStudent = (studentId) => {
    onSelectionChange(selectedStudents.filter(s => s._id !== studentId));
  };

  return (
    <div>
      {/* Selected Students Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selected Students ({selectedStudents.length})
        </label>
        {selectedStudents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedStudents.map(student => (
              <div key={student._id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>{student.name}</span>
                <button
                  onClick={() => removeStudent(student._id)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No students selected</p>
        )}
      </div>

      {/* Add Students Button */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-secondary mb-4"
      >
        <User className="w-4 h-4 mr-2" />
        {selectedStudents.length > 0 ? 'Change Students' : 'Select Students'}
      </button>

      {/* Student Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Students</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Students List */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">Loading students...</div>
              ) : filteredStudents.length > 0 ? (
                <div className="space-y-2">
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudents.some(s => s._id === student._id);
                    return (
                      <div
                        key={student._id}
                        onClick={() => handleStudentToggle(student)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No students found
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSelector;

