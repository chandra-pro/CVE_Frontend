// src/components/AuthCheck.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // To handle redirection
import { useAuth } from './AuthContext';

const apiUrl = process.env.REACT_APP_API_URL;

export const AuthCheck = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { refreshToken, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      console.log('AuthCheck: Tokens in localStorage:', tokens);

      if (tokens?.access) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
          console.log('AuthCheck: Verifying access token...');
          await axios.get(`${apiUrl}api/user/`); // Replace with your actual user endpoint
          console.log('AuthCheck: Token is valid');
        } catch (error) {
          console.log('AuthCheck: Access token is invalid, trying refresh token');
          try {
            await refreshToken();
          } catch (refreshError) {
            console.error('AuthCheck: Token refresh failed:', refreshError);
            logout();
            navigate('/login'); // Redirect to login if token refresh fails
          }
        }
      } else {
        console.log('AuthCheck: No access token found, logging out');
        logout();
        navigate('/login'); // Redirect to login if no tokens are found
      }
      setIsLoading(false);
    };

    if (!user) {
      console.log('AuthCheck: No user found, checking authentication');
      checkAuth(); // Only check authentication if no user is logged in
    } else {
      console.log('AuthCheck: User already logged in:', user);
      setIsLoading(false); // No need to check if the user is already logged in
    }
  }, [refreshToken, logout, navigate, user]);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading state
  }

  return <>{children}</>; // Render children if authentication is successful
};
