import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;
console.log("env api",apiUrl);
// Create a context for authentication
const AuthContext = React.createContext(null);

// AuthProvider component to wrap your app and provide authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Login function, sends credentials to API and stores tokens
  const login = async (username, password) => {
    try {
      console.log('Attempting login for user:', username);

      const response = await axios.post(`${apiUrl}api/login/`, {
        query: username,
        password,
      });
      const { tokens, user } = response.data;

      // Save user and tokens
      setUser(user);
      console.log('Login successful, user:', user);
      console.log('Tokens received:', tokens);
      localStorage.setItem('tokens', JSON.stringify(tokens));
      console.log('Tokens saved to localStorage:', localStorage.getItem('tokens'));

      // Set the default Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
      return user;

    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      throw error; // Bubble up the error to be handled by the caller
    }
  };

  // Logout function, clears user state and removes tokens
  const logout = useCallback(() => {
    console.log('Logging out, removing tokens and user state');
    setUser(null);
    localStorage.removeItem('tokens');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Function to refresh the access token using the refresh token
  const refreshToken = useCallback(async () => {
    const storedTokens = localStorage.getItem('tokens');
    console.log('Attempting token refresh, storedTokens:', storedTokens);

    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      try {
        const response = await axios.post(`${apiUrl}api/token/refresh/`, {
          refresh: tokens.refresh,
        });
        const newTokens = { ...tokens, access: response.data.access };
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        axios.defaults.headers.common['Authorization'] = `Bearer ${newTokens.access}`;
        console.log('Token refreshed successfully, newTokens:', newTokens);
        return newTokens.access;
      } catch (error) {
        console.error('Token refresh failed:', error.response ? error.response.data : error.message);
        logout(); // If refresh fails, log the user out
        throw error;
      }
    }
    throw new Error('No tokens found for refresh');
  }, [logout]);

  // Persist user state from tokens on app mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('tokens');
    console.log('useEffect: Checking stored tokens on load:', storedTokens);

    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;

      // Fetch user details based on access token
      axios.get(`${apiUrl}api/user/`)
        .then(response => {
          setUser(response.data);  // Set user state
          console.log('User details fetched from API:', response.data);
        })
        .catch((error) => {
          console.error('Failed to fetch user details:', error.response ? error.response.data : error.message);
          logout();  // Log out if token invalid or expired
        });
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext in other components
export const useAuth = () => useContext(AuthContext);

