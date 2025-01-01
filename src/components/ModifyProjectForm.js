/*
====================
ModifyProjectForm.js
Form to modify project based on selected tool
Author: Chandramani Kumar
Modified by: Shubham
===================
 
*/




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';

const apiUrl = process.env.REACT_APP_API_URL;

const ModifyProjectForm = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [releaseId, setReleaseId] = useState('');
  const [selectedTool, setSelectedTool] = useState('CVEHMI');
  const [manifestFile, setManifestFile] = useState(null);
  const [blacklistFile, setBlacklistFile] = useState(null); // Added state for Blacklisting File
  const [kernelVersion, setKernelVersion] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [githubBranch, setGithubBranch] = useState('');
  const [stableBranch, setStableBranch] = useState('');
  const [manifestPath, setManifestPath] = useState('')
  const [buildPath, setBuildPath] = useState('')
  const [buildFile, setBuildFile] = useState(null);
  const [useKernelVersion, setUseKernelVersion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    // Fetch existing project data when the component mounts
    const fetchProjectData = async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        const response = await axios.get(`${apiUrl}api/project/${projectId}/`, {
          headers: {
            'Authorization': `Bearer ${tokens.access}`,
          },
        });
        const data = response.data;
        console.log("modified data", data.xml_records[0])
        setProjectName(data.project.project_name);
        setReleaseId(data.xml_records[0].project_version);
        setSelectedTool(data.xml_records[0].tool_use);
        setKernelVersion(data.xml_records[0].kernel_version);
        setGithubLink(data.xml_records[0].github_link);
        setGithubBranch(data.xml_records[0].branch);
        setStableBranch(data.xml_records[0].dot_kernel_branch);
        setManifestPath(data.xml_records[0].xml_path)
        setBuildPath(data.xml_records[0].build_file)

        console.log("hello my data", selectedTool)
      } catch (error) {
        console.error('Error fetching project data:', error);
        setNotification({ message: 'Error fetching project data. Please try again.', type: 'error' });
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Effect to clear notification after 2 seconds
  useEffect(() => {
    if (notification.message) {
      const timeoutId = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 2000);
      
      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId);
    }
  }, [notification]);

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
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
      await axios.put(`${apiUrl}api/modify-project/${projectId}/`, formData, {
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setNotification({ message: 'Project updated successfully!', type: 'success' });
      navigate("/dashboard");
    } catch (error) {
      console.error('Error updating project:', error);
      if (error.response) {
        if (error.response.status === 403) {
          setNotification({ message: error.response.data.detail || 'You do not have permission to modify this project.', type: 'error' });
        } else if (error.response.status === 404) {
          setNotification({ message: 'Project not found.', type: 'error' });
        } else if (error.response.data && error.response.data.detail) {
          setNotification({ message: error.response.data.detail, type: 'error' });
        } else {
          setNotification({ message: 'An unexpected error occurred. Please try again later.', type: 'error' });
        }
      } else {
        setNotification({ message: 'Network error or server is unreachable. Please check your connection.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative justify-center items-center ml-3 mr-3 ">
      <h2 className="text-2xl font-bold mb-4 text-center">Modify Project</h2>
      {notification.message && (
        <Notification message={notification.message} type={notification.type} />
      )}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
                  onChange={() => {
                    setUseKernelVersion(false);
                    setKernelVersion('');
                  }}
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
            <p>{manifestPath}</p>
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
              value={kernelVersion}
              placeholder="5.15.74"
              onChange={(e) => setKernelVersion(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        )}

        {/* Added Blacklisting File Upload */}
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
              <label className="block text-gray-700 text-sm font-bold mb-2">Project kernel branch name</label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Stable Branch</label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2">Build File</label>
              <p>{buildPath}</p>
              <input
                type="file"
                onChange={(e) => setBuildFile(e.target.files[0])}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="#fff" /> : 'Update Project'}
        </button>
      </form>
    </div>
  );
};

export default ModifyProjectForm;