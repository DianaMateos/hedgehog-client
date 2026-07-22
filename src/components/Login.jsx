import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegistering 
      ? 'http://localhost:8000/api/register' 
      : 'http://localhost:8000/api/login';

    const payload = isRegistering 
      ? { name, email, password } 
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          throw new Error(data.errors[firstKey][0]);
        }
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      const token = data.access_token || data.token;
      const user = data.user || { name: name || email.split('@')[0], email };

      if (token) {
        onLoginSuccess(token, user);
      } else if (isRegistering) {
        // Si el registro no devuelve token directo, pasamos al login
        setIsRegistering(false);
        setError('¡Cuenta creada con éxito! Ahora inicia sesión.');
      } else {
        throw new Error('No se recibió el token de autenticación.');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-slate-100">
      <div className="text-center mb-6">
        <span className="text-5xl block mb-2">🦔</span>
        <h2 className="text-2xl font-bold text-sky-400">Hedgehog Hub</h2>
        <p className="text-sm text-slate-400 mt-1">
          {isRegistering ? 'Crea tu cuenta de administrador' : 'Ingresa tus credenciales para acceder'}
        </p>
      </div>

      {/* Selector entre Iniciar Sesión y Registrarse */}
      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mb-6">
        <button
          type="button"
          onClick={() => { setIsRegistering(false); setError(''); }}
          className={`w-1/2 py-2 text-sm font-medium rounded-md transition ${
            !isRegistering ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => { setIsRegistering(true); setError(''); }}
          className={`w-1/2 py-2 text-sm font-medium rounded-md transition ${
            isRegistering ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Registrarse
        </button>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded-lg text-sm mb-6 text-center font-medium border ${
          error.includes('éxito') 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
            : 'bg-red-500/20 border-red-500/50 text-red-300'
        }`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 text-white rounded-lg p-3 text-sm focus:outline-none transition"
              placeholder="Diana Mateos"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 text-white rounded-lg p-3 text-sm focus:outline-none transition"
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 text-white rounded-lg p-3 text-sm focus:outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 cursor-pointer text-sm mt-2"
        >
          {loading 
            ? (isRegistering ? 'Creando cuenta...' : 'Iniciando Sesión...') 
            : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
        </button>
      </form>
    </div>
  );
}