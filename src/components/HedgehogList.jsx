import React, { useState, useEffect } from "react";

export default function HedgehogList({ token, user, onLogout }) {
  const [activeTab, setActiveTab] = useState("adopcion");
  const [erizos, setErizos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [catalogoEspecies, setCatalogoEspecies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Búsqueda en tiempo real para Adopción
  const [searchAdopcion, setSearchAdopcion] = useState("");

  // Estado para edición de Erizos
  const [editingId, setEditingId] = useState(null);

  // Estados para Modal de Adopción
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(false);
  const [selectedHedgehogForAdoption, setSelectedHedgehogForAdoption] = useState(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantNotes, setApplicantNotes] = useState("");
  const [adoptionSuccess, setAdoptionSuccess] = useState(false);

  // Modales de Especies (Admin)
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
  const [editingSpeciesId, setEditingSpeciesId] = useState(null);
  const [espNombre, setEspNombre] = useState("");
  const [espCientifico, setEspCientifico] = useState("");
  const [espCategoria, setEspCategoria] = useState("Doméstica");
  const [espDescripcion, setEspDescripcion] = useState("");
  const [espDificultad, setEspDificultad] = useState("Principiante");
  const [espEsperanza, setEspEsperanza] = useState("4 - 6 años");
  const [espTemperatura, setEspTemperatura] = useState("22°C - 27°C");
  const [espPeso, setEspPeso] = useState("250g - 450g");
  const [espAlimentacion, setEspAlimentacion] = useState("Insectívoro");
  const [espOrigen, setEspOrigen] = useState("África");

  // Búsqueda y Filtro en el Catálogo de Especies
  const [searchSpecies, setSearchSpecies] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Detección estricta de Admin
  const isAdmin =
    user?.role_id === 1 ||
    user?.rol_id === 1 ||
    user?.role === "admin" ||
    user?.rol === "admin" ||
    user?.role === "administrador" ||
    user?.rol === "administrador";

  // Formulario para registrar / editar erizo
  const [nombre, setNombre] = useState("");
  const [especieSelect, setEspecieSelect] = useState("Erizo Pigmeo Africano (Sal y Pimienta)");
  const [otraEspecie, setOtraEspecie] = useState("");
  const [genero, setGenero] = useState("Macho");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [estadoSalud, setEstadoSalud] = useState("Saludable");
  const [fotoUrl, setFotoUrl] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Cargar Especies desde PostgreSQL
  const fetchEspecies = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/species", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data || [];
        setCatalogoEspecies(lista);
      } else {
        console.error("Error al obtener especies:", res.status);
      }
    } catch (err) {
      console.error("Error de conexión al cargar especies:", err);
    }
  };

  // Cargar erizos desde la API
  const fetchErizos = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/hedgehogs", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setErizos(Array.isArray(data) ? data : data.data || []);
      } else {
        setErizos([]);
      }
    } catch (err) {
      console.error("Error al cargar erizos:", err);
      setErizos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios reales de PostgreSQL
  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data || [];
        if (lista.length > 0) {
          setUsuarios(lista);
          return;
        }
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }

    setUsuarios([
      { id: 1, name: "Administrador", email: "admin@hedgehoghub.com", role_id: 1, role: "admin" },
      { id: 2, name: "Veterinario User", email: "user@hedgehoghub.com", role_id: 2, role: "user" },
      { id: 3, name: "Diana Mateos", email: "diana.mateos123@gmail.com", role_id: null, role: "user" }
    ]);
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    fetchEspecies();
    fetchErizos();
    fetchUsuarios();
  }, []);

  // Recarga garantizada al cambiar de pestaña
  useEffect(() => {
    if (activeTab === "especies") {
      fetchEspecies();
    }
  }, [activeTab]);

  // Subir imagen en Canvas
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          setFotoUrl(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Modales Crear y Editar Erizos
  const handleOpenCreateModal = (especiePredefinida = null) => {
    setEditingId(null);
    setNombre("");
    setEdad("");
    setPeso("");
    setEstadoSalud("Saludable");
    setGenero("Macho");
    setFotoUrl("");
    setDescripcion("");
    setEspecieSelect(especiePredefinida || "Erizo Pigmeo Africano (Sal y Pimienta)");
    setOtraEspecie("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setNombre(item.nombre || item.name || "");
    setEdad(item.edad || item.age || "");
    setPeso(item.peso || "");
    setEstadoSalud(item.estado_salud || "Saludable");
    setGenero(item.genero || item.gender || "Macho");
    setFotoUrl(item.image_url || item.foto_url || "");
    setDescripcion(item.descripcion || item.description || "");

    const esp = item.especie || item.specie || "";
    const opcionesConocidas = catalogoEspecies.map((e) => e.nombre);

    if (opcionesConocidas.includes(esp)) {
      setEspecieSelect(esp);
      setOtraEspecie("");
    } else {
      setEspecieSelect("Otro");
      setOtraEspecie(esp);
    }

    setFormError("");
    setIsModalOpen(true);
  };

  // Modales Crear / Editar Especies (Admin)
  const handleOpenSpeciesModal = (esp = null) => {
    if (esp) {
      setEditingSpeciesId(esp.id);
      setEspNombre(esp.nombre);
      setEspCientifico(esp.cientifico);
      setEspCategoria(esp.categoria || "Doméstica");
      setEspDescripcion(esp.descripcion);
      setEspDificultad(esp.dificultad || "Principiante");
      setEspEsperanza(esp.esperanza_vida || esp.esperanzaVida || "4 - 6 años");
      setEspTemperatura(esp.temperatura || "22°C - 27°C");
      setEspPeso(esp.peso_promedio || esp.pesoPromedio || "250g - 450g");
      setEspAlimentacion(esp.alimentacion || "Insectívoro");
      setEspOrigen(esp.origen || "África");
    } else {
      setEditingSpeciesId(null);
      setEspNombre("");
      setEspCientifico("");
      setEspCategoria("Doméstica");
      setEspDescripcion("");
      setEspDificultad("Principiante");
      setEspEsperanza("4 - 6 años");
      setEspTemperatura("22°C - 27°C");
      setEspPeso("250g - 450g");
      setEspAlimentacion("Insectívoro");
      setEspOrigen("África");
    }
    setIsSpeciesModalOpen(true);
  };

  const handleSaveSpecies = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: espNombre,
      cientifico: espCientifico,
      categoria: espCategoria,
      descripcion: espDescripcion,
      dificultad: espDificultad,
      esperanza_vida: espEsperanza,
      temperatura: espTemperatura,
      peso_promedio: espPeso,
      alimentacion: espAlimentacion,
      origen: espOrigen,
    };

    const isEdit = Boolean(editingSpeciesId);
    const url = isEdit
      ? `http://localhost:8000/api/species/${editingSpeciesId}`
      : "http://localhost:8000/api/species";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSpeciesModalOpen(false);
        await fetchEspecies();
      } else {
        alert("Error al guardar la especie en la base de datos.");
      }
    } catch (err) {
      console.error("Error al guardar especie:", err);
    }
  };

  const handleDeleteSpecies = async (id, nombreEspecie) => {
    if (window.confirm(`¿Deseas eliminar la especie "${nombreEspecie}" de la base de datos?`)) {
      try {
        const res = await fetch(`http://localhost:8000/api/species/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (res.ok) {
          await fetchEspecies();
        }
      } catch (err) {
        console.error("Error al eliminar especie:", err);
      }
    }
  };

  // Eliminar Erizo
  const handleDeleteHedgehog = async (id, nombreErizo) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a "${nombreErizo}"?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/hedgehogs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        await fetchErizos();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "No tienes permisos para realizar esta acción.");
      }
    } catch (err) {
      alert("Error de conexión al intentar eliminar.");
    }
  };

  // Guardar Erizo
  const handleSaveHedgehog = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const especieFinal = especieSelect === "Otro" ? otraEspecie.trim() : especieSelect;

    const payload = {
      nombre: nombre.trim(),
      name: nombre.trim(),
      especie: especieFinal || "Erizo Pigmeo",
      specie: especieFinal || "Erizo Pigmeo",
      genero: genero,
      edad: parseInt(edad, 10),
      age: parseInt(edad, 10),
      peso: peso ? parseFloat(peso) : null,
      estado_salud: estadoSalud,
      foto_url: fotoUrl || null,
      image_url: fotoUrl || null,
      descripcion: descripcion ? descripcion.trim() : null,
    };

    const isEdit = Boolean(editingId);
    const url = isEdit
      ? `http://localhost:8000/api/hedgehogs/${editingId}`
      : "http://localhost:8000/api/hedgehogs";

    try {
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          throw new Error(`Campo "${firstKey}": ${data.errors[firstKey][0]}`);
        }
        throw new Error(data.message || "Error al guardar el erizo");
      }

      setIsModalOpen(false);
      await fetchErizos();
    } catch (err) {
      setFormError(err.message || "Error de conexión con el servidor");
    } finally {
      setSaving(false);
    }
  };

  // Modal Adopción
  const handleOpenAdoptionModal = (item) => {
    setSelectedHedgehogForAdoption(item);
    setApplicantName(user?.name || user?.nombre || "");
    setApplicantPhone("");
    setApplicantNotes("");
    setAdoptionSuccess(false);
    setAdoptionModalOpen(true);
  };

  const handleSendAdoption = (e) => {
    e.preventDefault();
    const hedgehogName =
      selectedHedgehogForAdoption?.nombre ||
      selectedHedgehogForAdoption?.name ||
      "el erizo";
    const message = `¡Hola! Mi nombre es *${applicantName}* y me interesa adoptar a *${hedgehogName}* (ID: #${selectedHedgehogForAdoption?.id}).\n\nMi teléfono de contacto es: ${applicantPhone}\nNotas: ${
      applicantNotes || "Sin notas adicionales."
    }`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setAdoptionSuccess(true);
  };

  // Filtros
  const misErizosFiltrados = erizos.filter(
    (item) => user && (item.user_id === user.id || item.user_id === user.user_id)
  );

  const erizosAdopcionFiltrados = erizos.filter((item) => {
    const search = searchAdopcion.toLowerCase();
    const nombreErizo = (item.nombre || item.name || "").toLowerCase();
    const especieErizo = (item.especie || item.specie || "").toLowerCase();
    const saludErizo = (item.estado_salud || "").toLowerCase();
    return (
      nombreErizo.includes(search) ||
      especieErizo.includes(search) ||
      saludErizo.includes(search)
    );
  });

  const especiesFiltradas = catalogoEspecies.filter((esp) => {
    const matchesSearch =
      (esp.nombre || "").toLowerCase().includes(searchSpecies.toLowerCase()) ||
      (esp.cientifico || "").toLowerCase().includes(searchSpecies.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || esp.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRegistradorNombre = (item) => {
    if (item.user?.name) return item.user.name;
    if (item.user?.nombre) return item.user.nombre;
    if (item.usuario?.name) return item.usuario.name;

    if (user && (item.user_id === user.id || item.user_id === user.user_id)) {
      return user.name || user.nombre || "Diana Mateos";
    }

    const encontrado = usuarios.find((u) => u.id === item.user_id);
    if (encontrado) return encontrado.name || encontrado.nombre;

    return "Refugio General";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Navbar Superior */}
      <nav className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-sky-400 m-0 leading-tight">
            Hedgehog Hub
          </h1>
          <p className="text-xs text-slate-400">
            Sistema de Control y Gestión de Erizos
          </p>
        </div>

        {/* Menú de Navegación */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab("adopcion")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === "adopcion"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Catálogo / Adopción
          </button>
          <button
            onClick={() => setActiveTab("miserizos")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === "miserizos"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Mis Erizos ({misErizosFiltrados.length})
          </button>
          <button
            onClick={() => setActiveTab("especies")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === "especies"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Enciclopedia Especies
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("usuarios")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "usuarios"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Usuarios
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-200">
              {user?.name || user?.nombre || "Usuario"}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                isAdmin
                  ? "bg-amber-950/80 text-amber-400 border-amber-700"
                  : "bg-sky-950/80 text-sky-400 border-sky-800"
              }`}
            >
              {isAdmin ? "Administrador" : "Usuario"}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Pestaña 1: Catálogo General */}
      {activeTab === "adopcion" && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Erizos Disponibles para Adopción y Consulta
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Explora el inventario general del refugio y solicita adopción.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar por nombre, especie..."
                value={searchAdopcion}
                onChange={(e) => setSearchAdopcion(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 w-full sm:w-64"
              />
              <button
                onClick={() => handleOpenCreateModal()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition shadow cursor-pointer text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <span>+</span> Registrar Erizo
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-400 text-center py-12">Cargando catálogo...</p>
          ) : erizosAdopcionFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <p className="text-slate-400">No se encontraron erizos con esa búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {erizosAdopcionFiltrados.map((item) => {
                const isOwner =
                  user && (item.user_id === user.id || item.user_id === user.user_id);
                const canManage = isAdmin || isOwner;
                const registrador = getRegistradorNombre(item);

                return (
                  <div
                    key={item.id || item.nombre || item.name}
                    className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:border-slate-600 transition duration-200 flex flex-col justify-between relative"
                  >
                    <div>
                      <div className="w-full h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
                        {item.image_url || item.foto_url ? (
                          <img
                            src={item.image_url || item.foto_url}
                            alt={item.nombre || item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <span className="text-slate-600 text-xs font-semibold">Sin imagen</span>
                        )}

                        {(item.genero || item.gender) && (
                          <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-700 text-sky-300 shadow">
                            {item.genero || item.gender}
                          </span>
                        )}

                        {canManage && (
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="bg-amber-600/90 hover:bg-amber-500 text-white px-2 py-1 rounded border border-amber-500 text-[11px] font-semibold cursor-pointer shadow"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteHedgehog(item.id, item.nombre || item.name)
                              }
                              className="bg-red-900/80 hover:bg-red-600 text-white px-2 py-1 rounded border border-red-700 text-[11px] font-semibold cursor-pointer shadow"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-sky-400 capitalize mb-0.5">
                            {item.nombre || item.name || "Erizo"}
                          </h3>
                          <p className="text-xs text-slate-300">
                            <strong>Especie:</strong> {item.especie || item.specie || "Erizo Pigmeo"}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            <span className="text-slate-500">Registrado por:</span>{" "}
                            <strong className="text-emerald-400 font-medium">{registrador}</strong>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-500 block">Edad</span>
                            <span className="text-slate-200 font-semibold">{item.edad || item.age || "N/A"} meses</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Peso</span>
                            <span className="text-slate-200 font-semibold">{item.peso ? `${item.peso} g` : "N/R"}</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-slate-500">Estado Salud:</span>
                            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              (item.estado_salud || "").toLowerCase().includes("tratamiento")
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}>
                              {item.estado_salud || "Saludable"}
                            </span>
                          </div>
                        </div>

                        {(item.descripcion || item.description) && (
                          <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 line-clamp-2">
                            "{item.descripcion || item.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      {!isOwner ? (
                        <button
                          onClick={() => handleOpenAdoptionModal(item)}
                          className="w-full bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          Solicitar Adopción
                        </button>
                      ) : (
                        <span className="block text-center text-[11px] text-slate-500 bg-slate-950/80 py-1.5 rounded border border-slate-800 font-medium">
                          Tu ejemplar registrado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pestaña 2: Mis Erizos */}
      {activeTab === "miserizos" && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Mis Erizos Registrados
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ejemplares ingresados a la plataforma bajo tu cuenta ({user?.email}).
              </p>
            </div>
            <button
              onClick={() => handleOpenCreateModal()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg transition shadow cursor-pointer text-xs"
            >
              + Registrar Erizo
            </button>
          </div>

          {misErizosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <p className="text-slate-400">Aún no has registrado ningún erizo propio.</p>
              <button
                onClick={() => handleOpenCreateModal()}
                className="mt-4 text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Registrar mi primer erizo ahora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {misErizosFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shrink-0">
                      {item.image_url || item.foto_url ? (
                        <img src={item.image_url || item.foto_url} alt="Erizo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-600">Sin foto</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-sky-400">{item.nombre || item.name}</h3>
                      <p className="text-xs text-slate-400">{item.especie || item.specie}</p>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 mt-1 inline-block">
                        {item.estado_salud || 'Saludable'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 py-1.5 rounded text-xs font-semibold cursor-pointer transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteHedgehog(item.id, item.nombre || item.name)}
                      className="flex-1 bg-red-900/20 hover:bg-red-600/30 text-red-300 border border-red-700/40 py-1.5 rounded text-xs font-semibold cursor-pointer transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pestaña 3: Enciclopedia de Especies */}
      {activeTab === "especies" && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Enciclopedia & Guía Clínica de Especies 📖
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulta parámetros biológicos y requerimientos técnicos ({catalogoEspecies.length} especies persistentes en BD).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {isAdmin && (
                <button
                  onClick={() => handleOpenSpeciesModal()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition shadow cursor-pointer text-xs whitespace-nowrap"
                >
                  + Nueva Especie
                </button>
              )}

              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
                {["Todas", "Doméstica", "Exótica", "Silvestre"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded transition cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-sky-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="🔍 Buscar especie..."
                value={searchSpecies}
                onChange={(e) => setSearchSpecies(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 w-full sm:w-48"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {especiesFiltradas.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-3 text-center py-12">
                No se encontraron especies en PostgreSQL con esos criterios.
              </p>
            ) : (
              especiesFiltradas.map((esp) => (
                <div
                  key={esp.id}
                  className="bg-slate-900 p-5 rounded-xl border border-slate-700/80 shadow hover:border-slate-600 transition flex flex-col justify-between space-y-4 relative"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded italic">
                        {esp.cientifico}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 font-medium">
                          {esp.categoria || "Doméstica"}
                        </span>
                        {isAdmin && (
                          <div className="flex gap-1 ml-1">
                            <button
                              onClick={() => handleOpenSpeciesModal(esp)}
                              className="text-[10px] bg-amber-600/30 text-amber-300 hover:bg-amber-600 border border-amber-500 px-1.5 py-0.5 rounded cursor-pointer transition"
                              title="Editar especie"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteSpecies(esp.id, esp.nombre)}
                              className="text-[10px] bg-red-900/40 text-red-300 hover:bg-red-600 border border-red-700 px-1.5 py-0.5 rounded cursor-pointer transition"
                              title="Eliminar especie"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mb-1 leading-snug">
                      {esp.nombre}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {esp.descripcion}
                    </p>

                    <div className="flex gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-semibold bg-slate-800 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                        🎯 Cuidado: {esp.dificultad || "Principiante"}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-800 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded">
                        ⏳ Vida: {esp.esperanza_vida || esp.esperanzaVida || "4 - 6 años"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">🌡️ Hábitat</span>
                      <span className="text-slate-200 font-medium">{esp.temperatura || "22°C - 27°C"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">⚖️ Peso Prom.</span>
                      <span className="text-slate-200 font-medium">{esp.peso_promedio || esp.pesoPromedio || "250g - 450g"}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block">🥗 Dieta Sugerida:</span>
                      <span className="text-slate-300">{esp.alimentacion || "Insectívoro"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">📍 {esp.origen || "África"}</span>
                    <button
                      onClick={() => {
                        setActiveTab("adopcion");
                        handleOpenCreateModal(esp.nombre);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                    >
                      + Registrar ejemplar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pestaña 4: Panel de Usuarios */}
      {activeTab === "usuarios" && isAdmin && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-xl font-bold text-amber-400">
                Panel de Control de Usuarios
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Gestión de cuentas registradas en la base de datos de PostgreSQL.
              </p>
            </div>
            <span className="bg-amber-950 text-amber-300 border border-amber-700 text-xs px-3 py-1 rounded-full font-bold">
              Vista Administrador
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
              <span className="text-slate-400 text-xs block">Erizos Registrados</span>
              <span className="text-2xl font-bold text-sky-400">{erizos.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
              <span className="text-slate-400 text-xs block">Usuarios Registrados</span>
              <span className="text-2xl font-bold text-emerald-400">
                {usuarios.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
              <span className="text-slate-400 text-xs block">Estado del Servidor API</span>
              <span className="text-xs font-bold text-emerald-400 block mt-2">En Línea (PostgreSQL)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Correo Electrónico</th>
                  <th className="p-3">Rol del Sistema</th>
                  <th className="p-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usuarios.map((u) => {
                  const roleIsAdmin =
                    u.role_id === 1 ||
                    u.rol_id === 1 ||
                    u.role === "admin" ||
                    u.rol === "admin";

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono text-slate-500">#{u.id}</td>
                      <td className="p-3 font-semibold text-slate-200">
                        {u.name || u.nombre || "Usuario Registrado"}
                      </td>
                      <td className="p-3 text-sky-400">{u.email || u.correo}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            roleIsAdmin
                              ? "bg-amber-950 text-amber-400 border border-amber-700"
                              : "bg-sky-950 text-sky-400 border border-sky-800"
                          }`}
                        >
                          {roleIsAdmin ? "Administrador" : "Usuario"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-emerald-400 font-semibold">Activo</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Registrar / Editar Erizos */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-emerald-400">
              {editingId ? "Editar Erizo" : "Registrar Nuevo Erizo"}
            </h2>

            {formError && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveHedgehog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="Ej. Copito"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Género</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Especie / Variedad *</label>
                <select
                  value={especieSelect}
                  onChange={(e) => setEspecieSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  {catalogoEspecies.map((e) => (
                    <option key={e.id} value={e.nombre}>
                      {e.nombre}
                    </option>
                  ))}
                  <option value="Otro">Otro (Escribir abajo...)</option>
                </select>
              </div>

              {especieSelect === "Otro" && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-emerald-400">
                    Especificar Especie *
                  </label>
                  <input
                    type="text"
                    required
                    value={otraEspecie}
                    onChange={(e) => setOtraEspecie(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500 rounded p-2 text-white focus:outline-none text-sm"
                    placeholder="Escribe la especie..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Edad (meses) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="Ej. 6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Peso (gramos)</label>
                  <input
                    type="number"
                    min="1"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="Ej. 235"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Salud</label>
                  <select
                    value={estadoSalud}
                    onChange={(e) => setEstadoSalud(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="Saludable">Saludable</option>
                    <option value="En Observación">En Observación</option>
                    <option value="En Tratamiento">En Tratamiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fotografía del Erizo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer bg-slate-900 border border-slate-700 rounded"
                />
                {fotoUrl && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-emerald-400 mb-1">Vista previa:</p>
                    <img
                      src={fotoUrl}
                      alt="Preview"
                      className="h-20 mx-auto rounded border border-slate-700 object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción / Notas</label>
                <textarea
                  rows="2"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 resize-none text-sm"
                  placeholder="Dieta especial, comportamiento..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold transition disabled:opacity-50 cursor-pointer text-sm"
                >
                  {saving ? "Guardando..." : editingId ? "Actualizar Erizo" : "Guardar Erizo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Especie (Admin) */}
      {isSpeciesModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-sky-400">
              {editingSpeciesId ? "Editar Especie 📖" : "Nueva Especie en Enciclopedia 📖"}
            </h2>

            <form onSubmit={handleSaveSpecies} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Nombre Común *</label>
                  <input
                    type="text"
                    required
                    value={espNombre}
                    onChange={(e) => setEspNombre(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-xs"
                    placeholder="Ej. Erizo Pigmeo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Nombre Científico *</label>
                  <input
                    type="text"
                    required
                    value={espCientifico}
                    onChange={(e) => setEspCientifico(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-xs"
                    placeholder="Ej. Atelerix albiventris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Categoría</label>
                  <select
                    value={espCategoria}
                    onChange={(e) => setEspCategoria(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-xs"
                  >
                    <option value="Doméstica">Doméstica</option>
                    <option value="Exótica">Exótica</option>
                    <option value="Silvestre">Silvestre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Dificultad de Cuidado</label>
                  <select
                    value={espDificultad}
                    onChange={(e) => setEspDificultad(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-xs"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Experto">Experto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Descripción Breve *</label>
                <textarea
                  rows="2"
                  required
                  value={espDescripcion}
                  onChange={(e) => setEspDescripcion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-xs resize-none"
                  placeholder="Características físicas y temperamento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Temperatura Ideal</label>
                  <input
                    type="text"
                    value={espTemperatura}
                    onChange={(e) => setEspTemperatura(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Esperanza de Vida</label>
                  <input
                    type="text"
                    value={espEsperanza}
                    onChange={(e) => setEspEsperanza(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSpeciesModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white font-semibold text-xs transition cursor-pointer"
                >
                  {editingSpeciesId ? "Guardar Cambios" : "Agregar Especie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adopción */}
      {adoptionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl text-slate-100">
            <h2 className="text-xl font-bold mb-2 text-sky-400">Solicitud de Adopción</h2>
            <p className="text-xs text-slate-400 mb-4">
              Erizo seleccionado:{" "}
              <strong className="text-emerald-400">
                {selectedHedgehogForAdoption?.nombre || selectedHedgehogForAdoption?.name}
              </strong>
            </p>

            {adoptionSuccess ? (
              <div className="text-center py-6 space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">¡Solicitud Procesada!</h3>
                <p className="text-xs text-slate-300">
                  Se ha abierto la solicitud en WhatsApp. Un encargado del centro revisará tus datos a la brevedad.
                </p>
                <button
                  onClick={() => setAdoptionModalOpen(false)}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cerrar Ventana
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendAdoption} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Tu Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Teléfono de Contacto / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 5512345678"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Notas / Experiencia previa con erizos</label>
                  <textarea
                    rows="2"
                    placeholder="Ej. Cuento con espacio adecuado y hábitat climatizado..."
                    value={applicantNotes}
                    onChange={(e) => setApplicantNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdoptionModalOpen(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-xs transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Enviar Solicitud por WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}