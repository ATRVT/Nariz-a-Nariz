import { useState, useEffect } from 'react';
import { Dog, Plus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { addEntity, getEntities } from '../lib/gasService';

export default function Dogs() {
  const [dogs, setDogs] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', raza: '', estado: 'Activo' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadDogs();
  }, []);

  async function loadDogs() {
    setFetching(true);
    try {
      const data = await getEntities();
      if (data.status === 'success') {
        setDogs(data.dogs || []);
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
      await addEntity('Unidad Canina', formData);
      setSuccess(true);
      setFormData({ nombre: '', raza: '', estado: 'Activo' });
      await loadDogs(); // Refresh list
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error al añadir perro:", error);
      alert("Error al añadir perro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#024580]">Unidad Canina</h2>
        <Dog size={32} className="text-[#F9953C]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4 sticky top-8">
            <h3 className="text-lg font-bold text-[#024580] border-b pb-2 flex items-center gap-2">
              <Plus size={20} className="text-[#F9953C]" />
              Nuevo Perro
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre</label>
              <input 
                type="text" 
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#108BF7]"
                placeholder="Ej. Max"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Raza</label>
              <input 
                type="text" 
                value={formData.raza}
                onChange={(e) => setFormData({...formData, raza: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#108BF7]"
                placeholder="Ej. Pastor Alemán"
              />
            </div>
            <button 
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                success ? 'bg-[#30E674]' : 'bg-[#024580] hover:bg-[#108BF7]'
              }`}
            >
              {loading ? 'Guardando...' : success ? '¡Añadido!' : 'Añadir Perro'}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-[#024580]">Perros Registrados</h3>
          {fetching ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="animate-spin text-[#108BF7] mb-2" />
              <p className="text-gray-400 text-sm">Consultando Sheets...</p>
            </div>
          ) : dogs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-100 italic text-gray-400">
              No hay perros registrados todavía.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dogs.map((dog, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-12 h-12 bg-[#F9953C]/10 rounded-full flex items-center justify-center text-[#F9953C]">
                    <Dog size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-[#024580]">{dog.nombre}</p>
                    <p className="text-xs text-gray-500 italic">{dog.raza || 'Sin raza'}</p>
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
