import { useState, useEffect } from 'react';
import { Users, UserPlus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { addEntity, getEntities } from '../lib/gasService';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', rol: '', estado: 'Activo' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadTrainers();
    
    const updateAdmin = () => {
      setIsAdmin(localStorage.getItem('nariz_admin') === 'true');
    };
    updateAdmin();
    window.addEventListener('admin-state-changed', updateAdmin);
    return () => window.removeEventListener('admin-state-changed', updateAdmin);
  }, []);

  async function loadTrainers() {
    setFetching(true);
    try {
      const data = await getEntities();
      if (data.status === 'success') {
        setTrainers(data.guides || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEntity('Equipo', formData);
      setSuccess(true);
      setFormData({ nombre: '', rol: '', estado: 'Activo' });
      await loadTrainers(); // Refresh list
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error al añadir miembro:", error);
      alert("Error al añadir miembro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#024580]">Equipo de Trabajo</h2>
        <Users size={32} className="text-[#F9953C]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Column */}
        {isAdmin && (
          <div className="md:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4 sticky top-8">
              <h3 className="text-lg font-bold text-[#024580] border-b pb-2 flex items-center gap-2">
                <UserPlus size={20} className="text-[#F9953C]" />
                Nuevo Miembro
              </h3>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#108BF7]"
                  placeholder="Ej. Carlos Mendoza"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rol / Cargo</label>
                <input 
                  type="text" 
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#108BF7]"
                  placeholder="Ej. Guía K9, Entrenador"
                />
              </div>
              <button 
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                  success ? 'bg-[#30E674]' : 'bg-[#024580] hover:bg-[#108BF7]'
                }`}
              >
                {loading ? 'Guardando...' : success ? '¡Añadido!' : 'Añadir al Equipo'}
              </button>
            </form>
          </div>
        )}

        {/* List Column */}
        <div className={isAdmin ? "md:col-span-2 space-y-4" : "md:col-span-3 space-y-4"}>
          <h3 className="text-xl font-bold text-[#024580]">Guías / Miembros</h3>
          {fetching ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="animate-spin text-[#108BF7] mb-2" />
              <p className="text-gray-400 text-sm">Consultando Equipo...</p>
            </div>
          ) : trainers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-100 italic text-gray-400">
              No hay miembros registrados todavía.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trainers.map((trainer, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-12 h-12 bg-[#F9953C]/10 rounded-full flex items-center justify-center text-[#F9953C]">
                    <Users size={24} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#024580]">{trainer.nombre}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        trainer.estado?.toLowerCase() !== 'inactivo' 
                          ? 'bg-green-100 text-green-750 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {trainer.estado || 'Activo'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">{trainer.rol || 'Miembro'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
