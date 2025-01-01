// PersistentScanStatus.js
import React from 'react';
import { useEffect } from 'react';
import { FaSpinner, FaStop } from 'react-icons/fa';
import { useBackgroundScan } from './BackgroundScanContext';
import Notification from './Notification';

export const PersistentScanStatus = () => {
    const { 
        backgroundScans, 
        handleAbortBackgroundScan,
        notification,
        setNotification 
    } = useBackgroundScan();

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    useEffect(() => {
        console.log('BackgroundScans:', backgroundScans);
    }, [backgroundScans]);

    if (!backgroundScans.length) return null;

    return (
        <>
            {backgroundScans.length > 0 && (
                <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
                    {backgroundScans.map(scan => (
                        <div 
                            key={scan.projectid} 
                            className="bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg flex items-center space-x-2"
                        >
                            <FaSpinner className="animate-spin" />
                            <p>Scanning {scan.project_name}</p>
                            <span className="text-xs text-gray-400">
                                {new Date(scan.created_at).toLocaleTimeString()}
                            </span>
                            <button
                                onClick={() => handleAbortBackgroundScan(scan.projectid, scan.project_name)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors duration-200 flex items-center space-x-1"
                                title="Abort background scan"
                            >
                                <FaStop size={12} />
                                <span className="text-xs">Abort</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Show Notification */}
            {notification.message && (
                <Notification message={notification.message} type={notification.type} />
            )}
        </>
    );
};