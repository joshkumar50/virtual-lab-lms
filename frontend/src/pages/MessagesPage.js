import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const MessagesPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
                <p className="text-gray-600 mb-6">
                    Messaging feature for course {courseId ? `(ID: ${courseId})` : ''} is currently under development.
                    Check back soon!
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-primary w-full flex items-center justify-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default MessagesPage;
