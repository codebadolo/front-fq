import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api'; // Importez votre client axios déjà configuré

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const saveToken = (tok) => {
    setToken(tok);
    if (tok) localStorage.setItem('token', tok);
    else localStorage.removeItem('token');
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login/', { email, password });
      saveToken(data.token);
      setUser(data.user || null);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.detail || 'Erreur lors de la connexion' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      await api.post('/auth/signup/', userData);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data || 'Erreur lors de l\'inscription' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/auth/user/', {
          headers: { Authorization: `Token ${token}` },
        });
        setUser(data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
