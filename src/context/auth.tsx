// Modified auth.tsx file with fixed login function
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User } from '../types';

interface AuthState {
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthState>({
  isLoading: false,
  userToken: null,
  user: null,
  error: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) {
          setUserToken(token);
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.log('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the example credentials from the DummyJSON documentation
      const testUsername = 'emilys';
      const testPassword = 'emilyspass';
      
      console.log(`Attempting login with updated credentials: ${testUsername}, password: ${testPassword}`);
      
      // Create request data according to API documentation
      const requestData = {
        username: testUsername,
        password: testPassword,
        expiresInMins: 60
      };
      
      console.log('Request payload:', requestData);
      
      const response = await axios.post<LoginResponse>(
        'https://dummyjson.com/auth/login', 
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      console.log('Login successful!');
      console.log('Response:', response.data);
      
      const { accessToken, refreshToken, ...userData } = response.data;
      
      // Store the credentials it is necessary to store refreshToken and accessToken to use them in future requests
      await AsyncStorage.setItem('userToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Update state
      setUserToken(accessToken);
      setUser(userData);
    } catch (error) {
      console.log('Login error:', error);
      
      if (axios.isAxiosError(error)) {
        console.log('Response data:', error.response?.data);
        console.log('Response status:', error.response?.status);
        
        // Try to make a direct fetch request as a fallback with the updated credentials
        try {
          console.log('Attempting fallback with fetch API...');
          
          const fetchResponse = await fetch('https://dummyjson.com/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: 'emilys',
              password: 'emilyspass',
              expiresInMins: 60
            }),
            credentials: 'include'
          });
          
          if (fetchResponse.ok) {
            const data = await fetchResponse.json();
            console.log('Fetch fallback successful:', data);
            
            const { accessToken, refreshToken, ...userData } = data;
            
            // Store credentials
            await AsyncStorage.setItem('userToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            // Update state
            setUserToken(accessToken);
            setUser(userData);
            return;
          } else {
            const errorText = await fetchResponse.text();
            console.log('Fetch fallback failed:', errorText);
            setError(`Authentication failed: ${errorText}`);
          }
        } catch (fetchError) {
          console.log('Fetch fallback error:', fetchError);
          setError('Network error during authentication');
        }
        
        if (error.response?.status === 400 && error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Authentication failed. Please check your credentials.');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUserToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isLoading,
        userToken,
        user,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};