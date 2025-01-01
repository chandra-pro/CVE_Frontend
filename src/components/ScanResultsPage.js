/*
====================
ScanResultsPage.js
List out all the scan results
Author: Chandramani Kumar
Modified By: Shubham
===================

*/

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const ScanResultsPage = () => {
    const [scanHistory, setScanHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const { projectName } = location.state || {};
    const { projectId } = useParams();

    useEffect(() => {
        const fetchScanHistory = async () => {
            try {
                const tokens = JSON.parse(localStorage.getItem('tokens'));
                if (!tokens || !tokens.access) {
                    throw new Error('Access token not found');
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
                
                // Fetch scan history from the backend
                const response = await axios.get(`${apiUrl}api/scan-history/${projectId}/`);
                setScanHistory(response.data.report_history);
            } catch (err) {
                setError(err.response ? err.response.data.detail : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchScanHistory();
    }, [projectId]);

    const handleReportClick = async (scan_id) => {
        try {
            const response = await axios.get(`${apiUrl}api/report-download/${projectId}/${scan_id}/`);
            const reportUrl = response.data.report_url;
            window.open(reportUrl, '_blank'); // Opens the report in a new tab
        } catch (error) {
            console.error('Failed to fetch report URL:', error);
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Scan Results for Project {projectName}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool Used</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {scanHistory.map((scan) => (
                            <tr key={scan.scan_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scan.tool_use}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scan.user}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button 
                                        onClick={() => handleReportClick(scan.scan_id)} 
                                        className="text-blue-600 hover:underline"
                                    >
                                        {scan.report_name}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScanResultsPage;

