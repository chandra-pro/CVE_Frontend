import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AddProjectForm from './AddProjectForm';
import UserProjects from './UserProjects';
import HelpPage from './HelpPage';
import logo from '../public/assets/logo.png';
import { FaBars, FaTimes, FaProjectDiagram, FaPlus, FaQuestionCircle, FaSignOutAlt, FaShareAlt, FaFileAlt } from 'react-icons/fa';
import ShareProjectsForm from './ShareProjectsForm';
import CVEToolDetails from './CVEToolDetails';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems = [
    { name: 'Projects', icon: FaProjectDiagram, tab: 'projects' },
    { name: 'Add Project', icon: FaPlus, tab: 'addProject' },
    { name: 'Share Project', icon: FaShareAlt, tab: 'share' },
    { name: 'Help', icon: FaQuestionCircle, tab: 'Help' },
    { name: 'About', icon: FaFileAlt, tab: 'details'}
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Hamburger icon for mobile screens */}
      <button
        className="lg:hidden p-4 text-white bg-indigo-600 fixed top-0 left-0 z-50 rounded-br-lg shadow-lg"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative w-64 bg-indigo-600 text-white h-full z-40 transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-200`}
      >
        <div className="p-5">
          <ul className="space-y-2">
            <li>
              <button
                className="w-full flex mb-4"
                onClick={() => setActiveTab('profile')}
              >
                <img src={logo} alt="Company logo" className="w-30 h-12" />
              </button>
            </li>
            {sidebarItems.map((item) => (
              <li key={item.tab}>
                <button
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                    activeTab === item.tab
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-200 hover:bg-indigo-600'
                  }`}
                  onClick={() => setActiveTab(item.tab)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay for mobile screens when the sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <button
                onClick={() => setActiveTab('profile')}
              >
          <h1 className="text-xl font-bold text-customCyan">
            Integrated CVE SCANNER
          </h1>
              </button>

          <div className="flex items-center space-x-4">
            <span
              className="text-gray-800 font-medium cursor-pointer"
              onClick={() => setActiveTab('profile')}
            >
              {user?.profile?.first_name} {user?.profile?.last_name || 'User'}
            </span>
            <button
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={logout}
              title="Logout"
            >
              <FaSignOutAlt size={20} />
            </button>
            Logout
          </div>
        </nav>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Conditional rendering for tabs */}
            {activeTab === 'profile' && (
              <div className="profile-container max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-5 text-gray-800">
                  Welcome, {user?.username || 'User'}
                </h1>
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Profile Details</h2>
                <div className="flex flex-col sm:flex-row items-center mb-4">
                  <img
                    src={
                      'https://static-00.iconduck.com/assets.00/profile-circle-icon-256x256-cm91gqm2.png'
                    }
                    alt="User Profile"
                    className="w-24 h-24 rounded-full border-2 border-indigo-300 shadow-md mb-4 sm:mb-0"
                  />
                  <div className="sm:ml-4 text-center sm:text-left">
                    <p className="text-lg font-medium">
                      <strong>Username:</strong> {user?.username}
                    </p>
                    <p className="text-lg">
                      <strong>Email:</strong> {user?.email || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded shadow">
                  <p className="text-lg mb-2">
                    <strong>Full Name:</strong> {user?.profile?.first_name}{' '}
                    {user?.profile?.last_name || 'User'}
                  </p>
                  <p className="text-lg mb-2">
                    <strong>Title:</strong> {user?.profile?.title || 'No title provided'}
                  </p>
                  <p className="text-lg mb-2">
                    <strong>About:</strong> {user?.profile?.about || 'No information provided'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'projects' && <UserProjects />}
            {activeTab === 'Help' && <HelpPage />}
            {activeTab === 'addProject' && (
              <div>
                <AddProjectForm />
              </div>
            )}
            {activeTab === 'share' && <ShareProjectsForm />}
            {activeTab === 'details' && <CVEToolDetails />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
