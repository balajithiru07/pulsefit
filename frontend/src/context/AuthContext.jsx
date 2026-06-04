import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pulsefit_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Show a temporary alert banner helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const profileData = await res.json();
          setUser({ ...profileData });
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('pulsefit_token', data.token);
      setToken(data.token);
      showToast('Logged in successfully!');
      return true;
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('pulsefit_token', data.token);
      setToken(data.token);
      showToast('Registration successful! Welcome to PulseFit!');
      return true;
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('pulsefit_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.');
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showToast(`Passcode sent! For preview, your code is: ${data.code}`);
      return data.code; // Return the code for ease of mockup testing
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('Password reset successful! You can now log in.');
      return true;
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser(data);
      showToast('Profile metrics updated successfully!');
      return true;
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    }
  };

  const upgradeSubscription = async (paymentData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/payments/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local status
      setUser(prev => ({
        ...prev,
        subscriptionStatus: data.subscriptionStatus
      }));
      showToast(data.message);
      return data.invoice;
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        toastMessage,
        showToast,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        upgradeSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
