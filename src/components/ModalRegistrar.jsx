import React, { useState } from 'react';

export default function ModalRegistrar({ isOpen, onClose, onRefresh, token }) {
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('Atelerix albiventris (Erizo de vientre blanco)');
  const [edad, setEdad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usamos la ruta /api/hedgehogs sin caracteres especiales ni acentos
      const response = await fetch('http://localhost:8000/api/hedgehogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          name: nombre.trim(),
          especie: especie,
          edad: parseInt(edad, 10)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Mostrar el error exacto que envía Laravel
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          throw new Error(`Campo "${firstKey}": ${data.errors[firstKey][0]}`);
        }
        throw new Error(data.message || 'Error al registrar el espécimen');
      }

      // Limpiar y cerrar modal
      setNombre('');
      setEdad('');
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl text-slate-100">
        <h2 className="text-xl font-bold mb-4 text-emerald-400">Registrar Nuevo Espécimen 🦔</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ej. Copito"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Especie</label>
            <select
              value={especie}
              onChange={(e) => setEspecie(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Atelerix albiventris (Erizo de vientre blanco)">Atelerix albiventris (Vientre blanco)</option>
              <option value="Atelerix algirus (Erizo Moruno)">Atelerix algirus (Erizo Moruno)</option>
              <option value="Alergino Blanco">Alergino Blanco</option>
              <option value="Echinochinus">Echinochinus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Edad (meses)</label>
            <input
              type="number"
              required
              min="1"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ej. 6"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Guardar Espécimen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}