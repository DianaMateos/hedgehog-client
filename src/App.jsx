import React, { useState } from "react";
import HedgehogList from "./components/HedgehogList";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  // Estados del Formulario (Login / Register)
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Normalización del usuario considerando role_id (1 = Admin, 2 = User)
  const normalizeUserData = (userData) => {
    if (!userData) return null;
    let roleStr = "usuario";

    if (userData.role_id === 1 || userData.rol_id === 1) {
      roleStr = "admin";
    } else if (typeof userData.role === "string") {
      roleStr = userData.role.toLowerCase();
    } else if (typeof userData.rol === "string") {
      roleStr = userData.rol.toLowerCase();
    } else if (userData.role?.name) {
      roleStr = userData.role.name.toLowerCase();
    }

    return {
      ...userData,
      role: roleStr,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const endpoint = isRegistering
      ? "http://localhost:8000/api/register"
      : "http://localhost:8000/api/login";

    const payload = isRegistering
      ? { name, email, password }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          throw new Error(data.errors[firstKey][0]);
        }
        throw new Error(data.message || "Error al procesar la solicitud");
      }

      if (isRegistering) {
        setSuccessMsg("¡Cuenta creada exitosamente! Ya puedes iniciar sesión.");
        setIsRegistering(false);
        setPassword("");
      } else {
        const rawUser = data.user || data.usuario || data;
        const normalizedUser = normalizeUserData(rawUser);
        const userToken = data.token || data.access_token || token;

        setToken(userToken);
        setUser(normalizedUser);

        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      }
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setSuccessMsg("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-2">🦔</span>
            <h1 className="text-2xl font-bold text-sky-400">Hedgehog Hub</h1>
            <p className="text-xs text-slate-400 mt-1">
              {isRegistering
                ? "Crea una cuenta para comenzar"
                : "Iniciar Sesión para gestionar la plataforma"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-xs font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-3 rounded-lg text-xs font-semibold mb-4 text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@hedgehoghub.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-lg text-sm transition cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading
                ? "Procesando..."
                : isRegistering
                ? "Registrarse"
                : "Entrar al Sistema"}
            </button>
          </form>

          {/* Toggle entre Login y Registro */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs text-sky-400 hover:underline cursor-pointer"
            >
              {isRegistering
                ? "¿Ya tienes cuenta? Inicia sesión aquí"
                : "¿No tienes cuenta? Regístrate aquí"}
            </button>
          </div>

          {!isRegistering && (
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 mb-1">
                Cuentas de prueba disponibles:
              </p>
              <p className="text-[11px] text-slate-400">
                👑 Admin:{" "}
                <code className="text-amber-400">admin@hedgehoghub.com</code>
              </p>
              <p className="text-[11px] text-slate-400">
                👤 User:{" "}
                <code className="text-sky-400">user@hedgehoghub.com</code>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <HedgehogList token={token} user={user} onLogout={handleLogout} />
    </div>
  );
}