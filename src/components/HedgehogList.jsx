import { useEffect, useState } from 'react';
import { getHedgehogs, createHedgehog, deleteHedgehog } from '../api/hedgehogs';
import { logout } from '../api/auth';

export default function HedgehogList({ onLogout }) {
  const [hedgehogs, setHedgehogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Estados del formulario
  const [name, setName] = useState('');
  const [speciesSelect, setSpeciesSelect] = useState('Atelerix albiventris (Vientre Blanco)');
  const [customSpecies, setCustomSpecies] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Estado para Modal de Confirmación
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchHedgehogs = async () => {
    try {
      const data = await getHedgehogs();
      setHedgehogs(data.data || data);
      setError('');
    } catch (err) {
      setError('Error al conectar con la API de Hedgehog Hub.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHedgehogs();
  }, []);

  // Cargar imagen local en Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('La imagen es muy pesada. Elige una de menos de 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setFormError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    const finalSpecies = speciesSelect === 'Otro' ? customSpecies : speciesSelect;

    if (!finalSpecies.trim()) {
      setFormError('Por favor especifica la especie.');
      return;
    }

    if (!imageUrl) {
      setFormError('Por favor selecciona una imagen para el espécimen.');
      return;
    }

    try {
      const newHedgehog = await createHedgehog({
        name,
        species: finalSpecies,
        age: Number(age),
        description,
        image_url: imageUrl,
      });

      const createdItem = newHedgehog.data || newHedgehog;
      setHedgehogs([...hedgehogs, createdItem]);

      // Limpiar formulario
      setName('');
      setSpeciesSelect('Atelerix albiventris (Vientre Blanco)');
      setCustomSpecies('');
      setAge('');
      setDescription('');
      setImageUrl('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar el espécimen.');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteHedgehog(itemToDelete.id);
      setHedgehogs(hedgehogs.filter((h) => h.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      alert(`Error ${err.response?.status || ''}: ${err.response?.data?.message || 'No se pudo eliminar el registro.'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn('La sesión ya había caducado en el servidor.');
    } finally {
      localStorage.removeItem('token');
      if (onLogout) onLogout();
    }
  };

  const filteredHedgehogs = hedgehogs.filter((h) => {
    const speciesName = h.species || h.specie || '';
    return (
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      speciesName.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f8fafc' }}>
      <p style={{ fontSize: '1.1rem' }}>Cargando catálogo... 🦔</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', color: '#f8fafc', padding: '30px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Header */}
      <header style={{ maxWidth: '1100px', margin: '0 auto 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#38bdf8' }}>
            Hedgehog Hub 🦔
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Catálogo Centralizado de Especies y Especímenes
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Formulario */}
        <section style={{ backgroundColor: '#131c2e', padding: '28px', borderRadius: '16px', marginBottom: '35px', border: '1px solid #1e293b', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.15rem', color: '#10b981', fontWeight: 600, marginBottom: '20px' }}>
             Registrar Nuevo Espécimen
          </h2>
          
          {formError && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px' }}>{formError}</p>}
          
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', alignItems: 'start' }}>
            
            {/* Nombre */}
            <div style={{ gridColumn: 'span 4' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>Nombre</label>
              <input 
                type="text" 
                placeholder="ej. Holly" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0b0f19', color: 'white', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>

            {/* Especie Desplegable */}
            <div style={{ gridColumn: speciesSelect === 'Otro' ? 'span 3' : 'span 5' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>Especie</label>
              <select 
                value={speciesSelect} 
                onChange={(e) => setSpeciesSelect(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0b0f19', color: 'white', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Atelerix albiventris (Vientre Blanco)">Atelerix albiventris (Vientre Blanco)</option>
                <option value="Atelerix algirus (Erizo Moruno)">Atelerix algirus (Erizo Moruno)</option>
                <option value="Hemiechinus auritus (Erizo Orejudo)">Hemiechinus auritus (Erizo Orejudo)</option>
                <option value="Erinaceus europaeus (Erizo Europeo)">Erinaceus europaeus (Erizo Europeo)</option>
                <option value="Otro">Otro (Especificar...)</option>
              </select>
            </div>

            {/* Campo Especie Personalizada */}
            {speciesSelect === 'Otro' && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#10b981', marginBottom: '6px', fontWeight: 500 }}>¿Cuál especie?</label>
                <input 
                  type="text" 
                  placeholder="ej. Pygmy Enano" 
                  value={customSpecies} 
                  onChange={(e) => setCustomSpecies(e.target.value)} 
                  required 
                  style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: '8px', border: '1px solid #10b981', backgroundColor: '#0b0f19', color: 'white', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
            )}

            {/* Edad */}
            <div style={{ gridColumn: 'span 3' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>Edad (meses)</label>
              <input 
                type="number" 
                placeholder="ej. 2" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                required 
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0b0f19', color: 'white', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>

            {/* Subida de Imagen con Vista Previa */}
            <div style={{ gridColumn: 'span 12', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <label style={{ flexGrow: 1, border: imageUrl ? '1px solid #10b981' : '1px dashed #334155', backgroundColor: '#0b0f19', borderRadius: '8px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.85rem', color: imageUrl ? '#10b981' : '#38bdf8', fontWeight: 600 }}>
                  {imageUrl ? '✓ Fotografía cargada desde tu galería (clic para cambiar)' : '📷 Clic para seleccionar fotografía desde tu dispositivo'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ display: 'none' }} 
                />
              </label>

              {imageUrl && (
                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #10b981', flexShrink: 0 }}>
                  <img src={imageUrl} alt="Preview local" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Descripción */}
            <div style={{ gridColumn: 'span 12' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>Descripción / Características</label>
              <textarea 
                rows="2"
                placeholder="Detalles sobre hábitos, carácter o notas del espécimen..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0b0f19', color: 'white', fontSize: '0.875rem', resize: 'none', outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: 'span 12', textAlign: 'right' }}>
              <button 
                type="submit" 
                style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                + Guardar Espécimen
              </button>
            </div>

          </form>
        </section>

        {/* Buscador */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Catálogo de Especímenes ({filteredHedgehogs.length})</h3>
          <input 
            type="text" 
            placeholder="🔍 Buscar por nombre, especie o descripción..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ padding: '10px 16px', borderRadius: '20px', border: '1px solid #334155', backgroundColor: '#131c2e', color: 'white', width: '300px', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>

        {error && <p style={{ color: '#f87171', textAlign: 'center', margin: '20px 0' }}>{error}</p>}

        {/* Tarjetas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredHedgehogs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', backgroundColor: '#131c2e', borderRadius: '12px', border: '1px dashed #334155', color: '#94a3b8' }}>
              No hay especímenes registrados o coincidentes con la búsqueda.
            </div>
          ) : (
            filteredHedgehogs.map((item) => {
              const itemSpecies = item.species || item.specie || 'Especie no especificada';
              const itemAge = item.age ?? item.age_months;

              return (
                <div 
                  key={item.id} 
                  style={{ backgroundColor: '#131c2e', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  {/* Visualización de Foto con Fallback */}
                  <div style={{ width: '100%', height: '170px', backgroundColor: '#0b0f19', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+No+Disponible';
                      }}
                    />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(11, 15, 25, 0.85)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #1e293b' }}>
                      ID: #{item.id}
                    </span>
                  </div>

                  <div style={{ padding: '18px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', color: '#38bdf8', fontSize: '1.15rem' }}>{item.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginBottom: '8px' }}>
                        {itemSpecies}
                      </div>
                      <p style={{ margin: '4px 0 10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <strong>Edad:</strong> {itemAge !== undefined ? `${itemAge} meses` : 'No especificada'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
                        <strong>Descripción:</strong> {item.description || 'Sin descripción disponible.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setItemToDelete(item)} 
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Modal Advertencia */}
      {itemToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#131c2e', border: '1px solid #ef4444', borderRadius: '14px', padding: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px', color: '#f8fafc', fontSize: '1.2rem' }}>¿Confirmar eliminación?</h3>
            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.4' }}>
              Estás a punto de borrar a <strong style={{ color: '#38bdf8' }}>{itemToDelete.name}</strong> del catálogo.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setItemToDelete(null)}
                style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}