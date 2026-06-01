import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Search, School, MapPin, Building, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLiteMode } from '../context/LiteModeContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const ManageSchools = () => {
    const { user } = useAuth();
    const { isLiteMode } = useLiteMode();
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const res = await axios.get('/api/institutions');
            setInstitutions(res.data.institutions);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load institutions');
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await axios.put(`/api/institutions/${id}/verify`);
            toast.success('Institution verified successfully');
            fetchInstitutions(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        }
    };

    const filteredInstitutions = institutions.filter(inst => 
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inst.institutionalCode.includes(searchTerm) ||
        inst.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const Wrapper = isLiteMode ? 'div' : motion.div;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <ShieldCheck className="w-8 h-8 mr-3 text-blue-600" />
                            Manage Institutions
                        </h1>
                        <p className="text-gray-500 mt-1">Review and verify institution registrations in your district.</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name, code, district..." 
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInstitutions.map((inst, index) => (
                            <Wrapper 
                                key={inst._id}
                                {...(isLiteMode ? {} : {
                                    initial: { opacity: 0, y: 20 },
                                    animate: { opacity: 1, y: 0 },
                                    transition: { delay: index * 0.05 }
                                })}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <div className={`p-1 text-xs text-center font-bold text-white uppercase tracking-wider ${inst.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                    {inst.status === 'Active' ? 'Verified / Active' : 'Pending Verification'}
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{inst.name}</h3>
                                    
                                    <div className="space-y-2 mt-4 text-sm text-gray-600">
                                        <div className="flex items-start">
                                            <Building className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                                            <span><span className="font-semibold">Code:</span> {inst.institutionalCode}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <School className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                                            <span>{inst.type} • {inst.category}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                                            <span>{inst.district}, {inst.state} {inst.isRural ? '(Rural)' : ''}</span>
                                        </div>
                                    </div>
                                    
                                    {inst.status === 'Pending Verification' && user?.role === 'education_officer' && (
                                        <div className="mt-6">
                                            <button 
                                                onClick={() => handleVerify(inst._id)}
                                                className="w-full py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center"
                                            >
                                                <CheckCircle className="w-5 h-5 mr-2" /> Verify Institution
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Wrapper>
                        ))}
                    </div>
                )}
                
                {!loading && filteredInstitutions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No institutions found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageSchools;
