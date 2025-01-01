/*
====================
UserProjects.js
List out all the projects and have all actions like scan, modify,share and filter modal etc 
Author: Chandramani Kumar
Modified By: Shubham
===================
 
*/


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaShareAlt, FaSearch, FaEye, FaPencilAlt, FaHistory, FaTrash, FaSpinner, FaDownload } from 'react-icons/fa';
import Notification from './Notification';
import FilterModal from './FilterModal';
import { useBackgroundScan } from './BackgroundScanContext';

const apiUrl = process.env.REACT_APP_API_URL;

const UserProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pro_Id, setPro_Id] = useState('');
    const [error, setError] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [currentProjectType, setCurrentProjectType] = useState(null);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const navigate = useNavigate();

    const { 
        fetchActiveScans,
        isProjectScanning 
    } = useBackgroundScan();

    // Clear notification after timeout
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const tokens = JSON.parse(localStorage.getItem('tokens'));
                if (!tokens || !tokens.access) {
                    throw new Error('Access token not found');
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
                const response = await axios.get(`${apiUrl}api/user-projects/`);
                setProjects(response.data);
            } catch (err) {
                setNotification({ message: "An error occurred. Server is down", type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleScan = (projectId) => {
        setPro_Id(projectId);
        if (isProjectScanning(projectId)) {
            setNotification({
                message: "This project is already being scanned in the background.",
                type: 'warning'
            });
            return;
        }
        const project = projects.find(p => p.id === projectId);
        setCurrentProjectId(projectId);
        setProjectName(project.project_name);
        setCurrentProjectType(project.project_type);
        setFilterModalOpen(true);
    };

    const handleStartScan = async (projectId) => {
        if (!projectId) return;
        if (isProjectScanning(projectId)) {
            setNotification({
                message: "This project is already being scanned in the background.",
                type: 'warning'
            });
            return;
        }

        setIsScanning(true);
        setFilterModalOpen(false);
        setPro_Id(projectId);

        try {
            const response = await axios.post(`${apiUrl}api/scan-project/${projectId}/`);
            if (response.status === 201) {
                
                setScanResult({
                    success: true,
                    message: response.data.detail,
                    scanId: response.data.scan_id,
                });
                await fetchActiveScans();
                setTimeout(() => setScanResult(null), 3000);
            } else if(response.status === 200) {
                setScanResult({
                    success: true,
                    message: 'Scan aborted Successfully'
                });
                await fetchActiveScans();
                setTimeout(() => setScanResult(null), 3000);
            } else {
                setScanResult({
                    success: false,
                    message: 'Unexpected response from server.',
                });
                await fetchActiveScans();
            }
            
        } catch (err) {
            setScanResult({
                success: false,
                message: err.response?.data?.detail || 'Scan unsuccessful! Please try again later.',
            });
            
        } finally {
            setIsScanning(false);
            
        }
    };

    const handleViewResults = (projectId, projectName) => 
        navigate(`/scan-results/${projectId}`, { state: { projectName } });
    const handleModify = (projectId) => navigate(`/modify-project/${projectId}`);
    const handleModifyHistory = (projectId) => navigate(`/modify-history/${projectId}`);
    const handleScanHistory = (projectId,projectName) => {
        navigate(`/scan-history/${projectId}`, { state: { projectName } });
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await axios.delete(`${apiUrl}api/user-projects/${projectId}/delete/`);
                setProjects(projects.filter(p => p.id !== projectId));
                setNotification({ message: "Project deleted successfully", type: 'success' });
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 403) {
                        setNotification({ message: "You do not have permission to delete this project", type: 'error' });
                    } else if (err.response.status === 404) {
                        setNotification({ message: "Project not found", type: 'error' });
                    } else {
                        setNotification({ message: "Failed to delete project", type: 'error' });
                    }
                } else {
                    setNotification({ message: "An unexpected error occurred", type: 'error' });
                }
            }
        }
    };

    const handleAbortScan = async () => {
        if (!pro_Id) {
            alert('No scan to abort.');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}api/abort-scan/`, { project_id: pro_Id });
            if (response.data.status === 'success') {
                setNotification({ message: response.data.message, type: 'success' });
                await fetchActiveScans();
                setScanResult(null);
            } else {
                await fetchActiveScans();
                setNotification({ message: 'Failed to abort the scan.', type: 'error' });
            }
        } catch (err) {
            console.error('Error aborting scan:', err);
            setNotification({ 
                message: err.response?.data?.detail || 'An unexpected error occurred.', 
                type: 'error' 
            });
        } finally {
            setIsScanning(false);
        }
    };

    const handleBackgroundScan = async () => {
        setIsScanning(false);
        if (isProjectScanning(pro_Id)) {
            setNotification({
                message: "This project is already being scanned in the background.",
                type: 'warning'
            });
            return;
        }
        const project = projects.find(p => p.id === pro_Id);
        try {
            const response = await axios.post(`${apiUrl}api/start-background-scan/`, { project_id: pro_Id });

            if (response.status === 200 && response.data.status === 'success') {
                setNotification({
                    message: `Background scan started for ${project.project_name}`,
                    type: 'success',
                });
                await fetchActiveScans();
            } else {
                setNotification({
                    message: 'Failed to start background scan. Please try again.',
                    type: 'error',
                });
                await fetchActiveScans();
            }
        } catch (error) {
            console.error('Error starting background scan:', error);
            setError('Failed to start the scan. Please check your connection and try again.');
            setNotification({
                message: 'An error occurred while starting the scan.',
                type: 'error',
            });
        }
    };

    const handleDropdownAction = (projectId,projectName, action) => {
        switch (action) {
            case 'scan': handleScan(projectId); break;
            case 'reports': handleViewResults(projectId,projectName); break;
            case 'modify': handleModify(projectId); break;
            case 'history': handleModifyHistory(projectId); break;
            case 'scan history': handleScanHistory(projectId,projectName); break;
            case 'delete': handleDelete(projectId); break;
            default: break;
        }
    };

    const handleApplyFilters = async (filters) => {
        if (isProjectScanning(currentProjectId)) {
            setNotification({
                message: "This project is already being scanned in the background.",
                type: 'warning'
            });
            return;
        }
        try {
            const response = await axios.post(`${apiUrl}api/save-filters/`, {
                projectId: currentProjectId,
                filters: filters,
            });
            if (response.status === 201) {
                setNotification({ message: 'Filters saved successfully!', type: 'success' });
                await handleStartScan(currentProjectId);
            } else {
                setNotification({ message: 'Failed to save filters.', type: 'error' });
            }
        } catch (error) {
            setNotification({ 
                message: error.response?.data?.detail || 'Error saving filters.', 
                type: 'error' 
            });
        }
    };

    const downloadLog = async () => {
        try {
            const response = await axios.get(`${apiUrl}api/download-log/`);
            const logUrl = response.data.log_url;
            const link = document.createElement('a');
            link.href = logUrl;
            link.download = `${currentProjectId}_scan.log`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            setNotification({
                message: 'Failed to download log file.',
                type: 'error'
            });
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
    );
    
    if (error) return (
        <div className="text-red-500 text-center p-4">{error}</div>
    );

    return (
            
            <div className="p-4 relative">
            
            {scanResult && (
                <div className={`mb-4 p-4 rounded-lg ${scanResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex justify-between items-center`}>
                    <div>
                        <p>{scanResult.message}</p>
                        {scanResult.success && <p className="mt-2">Scan ID: {scanResult.scanId}</p>}
                    </div>
                    {!scanResult.success && (
                        <button
                            onClick={downloadLog}
                            className="bg-yellow-500 text-white py-1 px-3 rounded flex items-center"
                        >
                            <FaDownload className="mr-1" /> Download Logs
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {project.project_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.real_owner}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {/* Mobile dropdown */}
                                    <div className="md:hidden">
                                        <select
                                            onChange={(e) => handleDropdownAction(project.id,project.project_name, e.target.value)}
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            disabled={isScanning}
                                        >
                                            <option value="">Select Action</option>
                                            <option value="scan">Scan</option>
                                            <option value="view">Reports</option>
                                            <option value="modify">Modify</option>
                                            <option value="history">History</option>
                                            <option value="scan history">Scan History</option>
                                            <option value="delete">Delete</option>
                                        </select>
                                    </div>
                                    
                                    {/* Desktop buttons */}
                                    <div className="hidden md:flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleScan(project.id)}
                                            disabled={isScanning}
                                            className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 transition duration-300 flex items-center disabled:opacity-50"
                                            aria-label={`Scan project ${project.project_name}`}
                                        >
                                            <FaSearch className="mr-1" /> Scan
                                        </button>
                                        <button
                                            onClick={() => handleViewResults(project.id,project.project_name)}
                                            disabled={isScanning}
                                            className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition duration-300 flex items-center disabled:opacity-50"
                                        >
                                            <FaEye className="mr-1" /> Reports
                                        </button>
                                        <button
                                            onClick={() => handleModify(project.id)}
                                            disabled={isScanning}
                                            className="bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600 transition duration-300 flex items-center disabled:opacity-50"
                                        >
                                            <FaPencilAlt className="mr-1" /> Modify
                                        </button>
                                        <button
                                            onClick={() => handleModifyHistory(project.id)}
                                            disabled={isScanning}
                                            className="bg-purple-500 text-white py-1 px-2 rounded hover:bg-purple-600 transition duration-300 flex items-center disabled:opacity-50"
                                        >
                                            <FaHistory className="mr-1" /> History
                                        </button>
                                        <button
                                            onClick={() => handleScanHistory(project.id,project.project_name)} 
                                            disabled={isScanning}
                                            className="bg-indigo-500 text-white py-1 px-2 rounded hover:bg-indigo-600 transition duration-300 flex items-center disabled:opacity-50"
                                        >
                                            <FaHistory className="mr-1" /> Scan History
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            disabled={isScanning}
                                            className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition duration-300 flex items-center disabled:opacity-50"
                                        >
                                            <FaTrash className="mr-1" /> Delete
                                        </button>
                                    </div>
                                </td>
                                </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isScanning && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center z-50">
                    <div className="w-full relative overflow-hidden items-center justify-center flex flex-col">
                        <motion.div
                            className="w-40 h-40"
                            initial={{ x: -200 }}
                            animate={{ x: window.innerWidth + 100 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <g className="penguin">
                                    <ellipse cx="50" cy="65" rx="30" ry="35" fill="#111111" />
                                    <circle cx="80" cy="40" r="20" fill="#111111" />
                                    <circle cx="87" cy="35" r="3" fill="white" />
                                    <path d="M95 40 L105 37 L95 43 Z" fill="orange" />
                                    <ellipse cx="55" cy="70" rx="20" ry="25" fill="white" />
                                    <g className="feet">
                                        <path d="M30 95 L40 95 L35 100 Z" fill="orange" />
                                        <path d="M50 95 L60 95 L55 100 Z" fill="orange" />
                                    </g>
                                    <g className="flippers">
                                        <path d="M30 50 Q20 60 30 70" stroke="#111111" strokeWidth="5" fill="none" />
                                        <path d="M35 50 Q25 60 35 70" stroke="#111111" strokeWidth="5" fill="none" />
                                    </g>
                                </g>
                            </svg>
                        </motion.div>

                        <div className="text-white mt-2">Scanning in process...</div>
                        <div className="flex space-x-4 mt-4">
                            <button 
                                onClick={handleAbortScan} 
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
                            >
                                Abort Scan
                            </button>
                            <button 
                                onClick={handleBackgroundScan} 
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                            >
                                Run Background
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filterModalOpen && (
                <FilterModal
                    projectName={projectName}
                    tool={projects.find(p => p.id === currentProjectId)?.xml_data[0]?.tool_use}
                    onApplyFilters={handleApplyFilters}
                    onClose={() => setFilterModalOpen(false)}
                />
            )}

            {notification.message && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification({ message: '', type: '' })}
                />
            )}

            <style jsx>{`
                @keyframes run {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(10deg); }
                }
                @keyframes waddle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .penguin {
                    animation: waddle 0.5s infinite;
                }
                .feet {
                    animation: run 0.25s infinite;
                    transform-origin: center;
                }
                .flippers {
                    animation: run 0.5s infinite alternate;
                    transform-origin: top center;
                }
            `}</style>

                        {/* Display Notification */}
                        {notification.message && (
                <Notification message={notification.message} type={notification.type} />
            )}
        
        </div>
    );
};

export default UserProjects;



