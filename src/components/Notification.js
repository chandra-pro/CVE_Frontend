// Notification.js
import React from 'react';

const Notification = ({ message, type }) => {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded shadow-md transition-opacity duration-300 ${type === 'success' ? 'bg-white text-green-600' : 'bg-white text-red-600'}`}>
      {message}
    </div>
  );
};

export default Notification;
