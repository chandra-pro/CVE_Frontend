import React, { useState, useEffect } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

const CVEToolDetails = () => {
  const [lastSynced, setLastSynced] = useState('');

  useEffect(() => {
    // Fetch data from the cve-sync-log API
    const fetchSyncLog = async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const response = await fetch(`${apiUrl}api/cve-sync-log/`, {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sync log data');
        }

        const data = await response.json();
        const createdAt = new Date(data.created_at);
        const now = new Date();
        const diffInMs = now - createdAt;

        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;

        let timeAgo;
        if (hours > 0) {
          timeAgo = `${hours} hours and ${minutes} minutes ago`;
        } else {
          timeAgo = `${minutes} minutes ago`;
        }

        setLastSynced(timeAgo);
      } catch (error) {
        console.error('Error fetching sync log data:', error);
        setLastSynced('Error fetching data');
      }
    };

    fetchSyncLog();
  }, []);

  return (
    <div className="flex justify-center items-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md w-full">
        <div className="text-center py-4 bg-customCyan text-white">
          <h1 className="text-xl font-bold underline">CVETOOL DETAILS</h1>
        </div>
        <table className="table-auto w-full text-left">
          <tbody>
            <tr>
              <td className="px-4 py-2 font-semibold border-b">CLI Version</td>
              <td className="px-4 py-2 text-gray-700 border-b">4.0.0</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-semibold border-b">HMI Version</td>
              <td className="px-4 py-2 text-gray-700 border-b">4.0.0</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-semibold">Database Last Updated</td>
              <td className="px-4 py-2 text-gray-700">{lastSynced}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CVEToolDetails;
