// BackgroundScanContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BackgroundScanContext = createContext();
const apiUrl = process.env.REACT_APP_API_URL;

export const BackgroundScanProvider = ({ children }) => {
    const [backgroundScans, setBackgroundScans] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });


    const fetchActiveScans = async () => {
        console.log("called through user projects")
        try {
            const response = await axios.get(`${apiUrl}sse/active-scans/`);
            if (response.status === 200) {
                setBackgroundScans(response.data); 
            }
        } catch (err) {
            console.error('Error fetching active scans:', err);
            setNotification({
                message: 'Failed to load active scans from server.',
                type: 'error'
            });
        }
    };

    useEffect(() => {
        fetchActiveScans();
    }, []);

    const isProjectScanning = (projectId) => {
        return backgroundScans.some(scan => scan.projectid == projectId);
    };


    const handleAbortBackgroundScan = async (projectId, projectName) => {
        try {
            const response = await axios.post(`${apiUrl}api/abort-scan/`, { project_id: projectId });
            
            if (response.data.status === 'success') {
                await fetchActiveScans();
                setNotification({
                    message: `Background scan aborted for ${projectName}`,
                    type: 'success'
                });
            } else {
                await fetchActiveScans();
                setNotification({
                    message: 'Failed to abort the scan',
                    type: 'error'
                });
            }
        } catch (err) {
            await fetchActiveScans();
            console.error('Error aborting scan:', err);
            setNotification({
                message: err.response?.data?.detail || 'An unexpected error occurred while aborting scan',
                type: 'error'
            });
        }
    };

    return (
        <BackgroundScanContext.Provider value={{
            backgroundScans,
            fetchActiveScans,
            isProjectScanning,
            handleAbortBackgroundScan,
            notification,
            setNotification
        }}>
            {children}
        </BackgroundScanContext.Provider>
    );
};

export const useBackgroundScan = () => {
    const context = useContext(BackgroundScanContext);
    if (!context) {
        throw new Error('useBackgroundScan must be used within a BackgroundScanProvider');
    }
    return context;
};
