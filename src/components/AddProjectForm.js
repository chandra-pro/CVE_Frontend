/*
====================
AddProjectForm.js
Form to add project based on selected tool
Author: Chandramani Kumar, Shubham
===================
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

const apiUrl = process.env.REACT_APP_API_URL;

const Notification = ({ message, type }) => {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded shadow-md transition-opacity duration-300 ${type === 'success' ? 'bg-white text-green-600' : 'bg-white text-red-600'}`}>
      {message}
    </div>
  );
};

const AddProjectForm = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [releaseId, setReleaseId] = useState('');
  const [selectedTool, setSelectedTool] = useState('CVEHMI');
  const [manifestFile, setManifestFile] = useState(null);
  const [blacklistFile, setBlacklistFile] = useState(null); // State for Blacklisting File
  const [kernelVersion, setKernelVersion] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [githubBranch, setGithubBranch] = useState('');
  const [stableBranch, setStableBranch] = useState('');
  const [buildFile, setBuildFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useKernelVersion, setUseKernelVersion] = useState(false);
  const [notification, setNotification] = useState(null); // State for notification

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('project_name', projectName);
    formData.append('project_version', releaseId);
    formData.append('tool_select', selectedTool);

    if (selectedTool === 'PKCT') {
      if (useKernelVersion) {
        formData.append('kernel_version', kernelVersion);
      } else {
        formData.append('prj_xml_path', manifestFile);
      }
    } else {
      formData.append('prj_xml_path', manifestFile);
    }

    // Include Blacklisting File if uploaded
    if (blacklistFile) {
      formData.append('blacklist_file', blacklistFile);
    }

    if (selectedTool === 'PKCT' || selectedTool === 'Integrated') {
      formData.append('github_link', githubLink);
      formData.append('github_branch', githubBranch);
      formData.append('stable_branch', stableBranch);
      formData.append('build_file_paths', buildFile);
    }

    try {
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      if (!tokens || !tokens.access) {
        throw new Error('Access token not found');
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
      const response = await axios.post(`${apiUrl}api/add-project/`, formData, {
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Set notification message and type
      setNotification({ message: 'Project submitted successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error.response?.data.detail || 'Error creating project. Please try again.';
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false); // Stop loading
      // Automatically clear notification after 2 seconds
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex justify-center items-center bg-gray-100 bg-opacity-75">
          <ClipLoader loading={loading} size={50} />
        </div>
      )}
      {notification && <Notification message={notification.message} type={notification.type} />}
      
      <form onSubmit={handleSubmit} className={`bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ${loading ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Release ID</label>
          <input
            type="text"
            value={releaseId}
            onChange={(e) => setReleaseId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Select Tool</label>
          <select
            value={selectedTool}
            onChange={(e) => {
              setSelectedTool(e.target.value);
              setUseKernelVersion(false);
              setManifestFile(null);
              setBlacklistFile(null); // Reset blacklist file when changing tool
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="CVEHMI">CVEHMI</option>
            <option value="PKCT">PKCT</option>
            <option value="Integrated">Integrated</option>
          </select>
        </div>

        {selectedTool === 'PKCT' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Choose Input Type</label>
            <div>
              <label>
                <input
                  type="radio"
                  checked={!useKernelVersion}
                  onChange={() => setUseKernelVersion(false)}
                />
                Manifest File
              </label>
              <label className="ml-4">
                <input
                  type="radio"
                  checked={useKernelVersion}
                  onChange={() => setUseKernelVersion(true)}
                />
                Kernel Version
              </label>
            </div>
          </div>
        )}

        {!useKernelVersion ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Manifest File</label>
            <input
              type="file"
              onChange={(e) => setManifestFile(e.target.files[0])}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required={!useKernelVersion}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Kernel Version</label>
            <input
              type="text"
              placeholder="5.15.74"
              value={kernelVersion}
              onChange={(e) => setKernelVersion(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        )}

        {/* Blacklisting File Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Blacklisting File (Optional)</label>
          <input
            type="file"
            onChange={(e) => setBlacklistFile(e.target.files[0])}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {(selectedTool === 'PKCT' || selectedTool === 'Integrated') && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Project Kernel git link</label>
              <input
                type="text"
                value={githubLink}
                placeholder="ssh://git@stash.alm.mentorg.com:7999/socsamexv9/automotive_ahh3_v9_kernel.git"
                onChange={(e) => setGithubLink(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Project kernel branch Name</label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Stable Branch Name</label>
              <input
                type="text"
                value={stableBranch}
                placeholder="v5.15.165"
                onChange={(e) => setStableBranch(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Build File Paths</label>
              <input
                type="file"
                onChange={(e) => setBuildFile(e.target.files[0])}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            Submit Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectForm;


