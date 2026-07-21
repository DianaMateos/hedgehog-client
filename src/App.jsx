import { useState } from 'react';
import Login from './components/Login';
import HedgehogList from './components/HedgehogList';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Handler que actualiza el estado local cuando el login es exitoso
  const handleLoginSuccess = () => {
    const newToken = localStorage.getItem('token');
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div>
      {token ? (
        <HedgehogList onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}