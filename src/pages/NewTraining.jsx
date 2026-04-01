import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { submitTraining, getEntities } from '../lib/gasService';

export default function NewTraining() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dogId: '',
    guideId: '',
    sessions: [
      { target: '', uaCorrect: '', uaIncorrect: '', reinforcers: '', comments: '' }
    ]
  });

  const [dogs, setDogs] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEntities();
        if (data.status === 'success') {
          setDogs(data.dogs || []);
          setGuides(data.guides || []);
        }
      } catch (err) {
        console.error("Error al cargar perros/guías:", err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const addSession = () => {
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, { target: '', uaCorrect: '', uaIncorrect: '', reinforcers: '', comments: '' }]
    }));
  };

  const removeSession = (index) => {
    if (formData.sessions.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }));
  };

  const handleSessionChange = (index, field, value) => {
    const newSessions = [...formData.sessions];
    newSessions[index][field] = value;
    setFormData({ ...formData, sessions: newSessions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dogId || !formData.guideId) {
      alert("Debes seleccionar un perro y un guía.");
      return;
    }

    setLoading(true);
    try {
      // Find names from lists
      const dog = dogs.find(d => String(d.id) === String(formData.dogId))?.nombre || 'Desconocido';
      const guide = guides.find(g => String(g.id) === String(formData.guideId))?.nombre || 'Desconocido';

      await submitTraining({
        ...formData,
        dog,
        guide
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset only sessions
      setFormData(prev => ({
        ...prev,
        sessions: [{ target: '', uaCorrect: '', uaIncorrect: '', reinforcers: '', comments: '' }]
      }));
    } catch (error) {
      console.error(error);
      alert("Error al enviar a Google Sheets");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p className="text-gray-500 font-medium">Cargando datos de Unidad Canina y Equipo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 font-poppins">
      <h2 className="text-3xl font-black text-[#024580] uppercase tracking-tight">Cargar Entrenamiento</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Main Data Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 flex items-center gap-2">
            <CheckCircle2 size={24} className="text-accent" />
            Datos de Identificación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full text-lg border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Perro</label>
              <select 
                name="dogId"
                value={formData.dogId}
                onChange={handleChange}
                required
                className="w-full text-lg border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary appearance-none bg-white cursor-pointer"
              >
                {dogs.length === 0 ? (
                  <option value="">❌ No hay perros registrados</option>
                ) : (
                  <>
                    <option value="">Selecciona perro...</option>
                    {dogs.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </>
                )}
              </select>
              {dogs.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1 italic font-['Raleway']">Ve a "Unidad Canina" para registrar perros primero.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Guía</label>
              <select 
                name="guideId"
                value={formData.guideId}
                onChange={handleChange}
                required
                className="w-full text-lg border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary appearance-none bg-white cursor-pointer"
              >
                {guides.length === 0 ? (
                  <option value="">❌ No hay guías registrados</option>
                ) : (
                  <>
                    <option value="">Selecciona guía...</option>
                    {guides.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </>
                )}
              </select>
              {guides.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1 italic font-['Raleway']">Ve a "Equipo" para registrar guías primero.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Sesiones / Repeticiones</h3>
            <button 
              type="button"
              onClick={addSession}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-all shadow-md"
            >
              <Plus size={20} /> Agregar Sesión
            </button>
          </div>

          {formData.sessions.map((session, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 relative animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">SESIÓN #{index + 1}</span>
                {formData.sessions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeSession(index)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">OCP</label>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={session.target} 
                    onChange={(e) => handleSessionChange(index, 'target', e.target.value)}
                    placeholder="Ej. 1" 
                    required 
                    className="w-full text-lg border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">UA Correctas</label>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={session.uaCorrect} 
                    onChange={(e) => handleSessionChange(index, 'uaCorrect', e.target.value)}
                    required 
                    className="w-full text-2xl border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 font-bold text-center text-green-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">UA Incorrectas</label>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={session.uaIncorrect} 
                    onChange={(e) => handleSessionChange(index, 'uaIncorrect', e.target.value)}
                    required 
                    className="w-full text-2xl border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-500 font-bold text-center text-red-700" 
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reforzadores</label>
                  <input 
                    type="text" 
                    value={session.reinforcers} 
                    onChange={(e) => handleSessionChange(index, 'reinforcers', e.target.value)}
                    placeholder="Ej. Pelota, Comida" 
                    className="w-full text-lg border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Comentarios de Sesión</label>
                  <input 
                    type="text" 
                    value={session.comments} 
                    onChange={(e) => handleSessionChange(index, 'comments', e.target.value)}
                    placeholder="Notas específicas..." 
                    className="w-full text-lg border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-lg text-gray-600 font-medium">
            Se registrarán <span className="text-accent font-bold text-2xl">{formData.sessions.length}</span> sesiones para <span className="text-primary font-bold">
              {formData.dogId ? (dogs.find(d => String(d.id) === String(formData.dogId))?.nombre || '...') : '...'}
            </span>.
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 rounded-xl font-bold text-xl text-white transition-all transform hover:-translate-y-1 shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : success ? 'bg-green-500 shadow-green-200' : 'bg-primary hover:bg-primary-dark hover:shadow-primary/30'}`}
          >
            {loading ? 'Guardando...' : success ? (
              <><CheckCircle2 size={24} /> ¡Guardado!</>
            ) : (
              <><Send size={24} /> FINALIZAR</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
