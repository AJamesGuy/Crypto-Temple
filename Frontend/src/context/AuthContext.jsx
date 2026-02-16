import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

// Create a hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(10000);

  useEffect(() => {
    const u = localStorage.getItem('user');
    const b = localStorage.getItem('balance');
    if (u) setUser(JSON.parse(u));
    if (b) setBalance(parseFloat(b));
  }, []);

  const login = (username) => {
    const userData = { username, id: Date.now() };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const resetBalance = () => {
    setBalance(10000);
    localStorage.setItem('balance', '10000');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, balance, setBalance, resetBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
