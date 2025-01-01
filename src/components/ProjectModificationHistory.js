/*
====================
ProjectModificationHistory.js
List out all the changes made
Author: Chandramani Kumar
===================
 
*/



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai';


const apiUrl = process.env.REACT_APP_API_URL;

const ProjectModificationHistory = () => {
  const { projectId } = useParams();
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        const response = await axios.get(`${apiUrl}api/project/${projectId}/history/`);
        setHistory(response.data.modification_history);
      } catch (error) {
        setErrorMessage('Error fetching project history.');
      }
    };

    fetchHistory();
  }, [projectId]);

  const toggleDiff = (index) => {
    setHistory((prevHistory) =>
      prevHistory.map((item, i) => 
        i === index ? { ...item, showDiff: !item.showDiff } : item
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Project Modification History</h2>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <ul>
        {history.map((item, index) => (
          <li key={index} className="border-b border-gray-300 py-4">
            <p className="font-semibold">User: {item.user}</p>
            <p>Time: {new Date(item.modification_time).toLocaleString()}</p>
            <p>Detail: {item.modification_detail}</p>
            <button onClick={() => toggleDiff(index)} className="flex items-center text-blue-600">
              {item.showDiff ? <AiFillCaretUp /> : <AiFillCaretDown />}
              <span className="ml-2">{item.showDiff ? 'Hide Diff' : 'Show Diff'}</span>
            </button>
            {item.showDiff && (
              <div className="mt-2 bg-gray-100 p-2 rounded">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Added Rows:</p>
                    {item.added_rows && item.added_rows.length > 0 ? (
                      <ul className="list-disc pl-6">
                        {item.added_rows.map((row, rowIndex) => (
                          <li key={rowIndex}>{row}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No added rows.</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Deleted Rows:</p>
                    {item.deleted_rows && item.deleted_rows.length > 0 ? (
                      <ul className="list-disc pl-6">
                        {item.deleted_rows.map((row, rowIndex) => (
                          <li key={rowIndex}>{row}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No deleted rows.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectModificationHistory;
