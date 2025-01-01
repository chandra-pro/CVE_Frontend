// src/components/ShareProjectForm.js


/*
====================
ShareProjectForm.js
Form to share project to other user and give permission
Author: Chandramani Kumar
===================
 
*/


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import  ClipLoader  from 'react-spinners/ClipLoader';
import Notification from './Notification'; 


const apiUrl = process.env.REACT_APP_API_URL;

const ShareProjectsForm = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('');
    const [receiverUsernameOrEmail, setReceiverUsernameOrEmail] = useState('');
    const [permissionType, setPermissionType] = useState('Read'); // Default permission is 'Read'
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const tokens = JSON.parse(localStorage.getItem('tokens'));
                if (!tokens || !tokens.access) {
                    throw new Error('Access token not found');
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
                const response = await axios.get(`${apiUrl}api/share-projects/`);
                setProjects(response.data);
            } catch (err) {
                setNotification({ message: err.response ? err.response.data.detail : 'An error occurred', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Start loading

        const data = {
            project_id: selectedProject,
            receiver_username_or_email: receiverUsernameOrEmail,
            permission_type: permissionType
        };

        try {
            const tokens = JSON.parse(localStorage.getItem('tokens'));
            if (!tokens || !tokens.access) {
                throw new Error('Access token not found');
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
            const response = await axios.post(`${apiUrl}api/share-project/`, data, {
                headers: { 'Authorization': `Bearer ${tokens.access}` }
            });

            setNotification({ message: response.data.message, type: 'success' });
            
        } catch (err) {
            if (err.response) {
                if (err.response.data.error.includes('User not found in LDAP')) {
                    setNotification({ message: 'The specified username or email does not exist.', type: 'error' });
                } else {
                    setNotification({ message: err.response.data.error, type: 'error' });
                }
            } else {
                setNotification({ message: 'Error sharing the project. Please try again.', type: 'error' });
            }
        } finally {
            setIsSubmitting(false); // Stop loading
        }
    };

    // Timeout for notification
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' }); 
            }, 3000);

            return () => clearTimeout(timer); // Cleanup timeout on component unmount
        }
    }, [notification]);

    return (
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
            <h2 className="text-2xl font-bold mb-5 text-gray-700">Share a Project</h2>

            {loading ? (
                <div className="flex justify-center">
                    <ClipLoader size={50} color="#3b82f6" />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Select Project:</label>
                        <select 
                            value={selectedProject} 
                            onChange={(e) => setSelectedProject(e.target.value)} 
                            className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">--Select a Project--</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.project_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Receiver's Username or Email:</label>
                        <input 
                            type="text" 
                            value={receiverUsernameOrEmail} 
                            onChange={(e) => setReceiverUsernameOrEmail(e.target.value)} 
                            className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Permission Type:</label>
                        <select 
                            value={permissionType} 
                            onChange={(e) => setPermissionType(e.target.value)} 
                            className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="Read">Read</option>
                            <option value="Write">Write</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting} // Disable button while submitting
                    >
                        {isSubmitting ? 'Sharing...' : 'Share Project'}
                    </button>
                </form>
            )}

            {/* Display Notification */}
            {notification.message && (
                <Notification message={notification.message} type={notification.type} />
            )}
        </div>
    );
};

export default ShareProjectsForm;
