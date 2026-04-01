import { useState, useEffect } from 'react';
import { Activity, Target, Trophy, Clock, Loader2 } from 'lucide-react';
import { getEntities } from '../lib/gasService';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getEntities();
        if (res.status === 'success') {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { 
      label: 'Perros Registrados', 
      value: data?.counts?.dogs || '0', 
      icon: Trophy, 
      color: 'text-[#F9953C]', 
      bg: 'bg-[#F9953C]/10',
      description: 'Total en Unidad Canina'
    },
    { 
      label: 'Guías Registrados', 
      value: data?.counts?.guides || '0', 
      icon: Activity, 
      color: 'text-[#108BF7]', 
      bg: 'bg-[#108BF7]/10',
      description: 'Total en Equipo activo'
    },
    { 
      label: 'Precisión Estimada', 
      value: data?.stats?.precision ? `${data.stats.precision}%` : '0%', 
      icon: Target, 
      color: 'text-[#30E674]', 
      bg: 'bg-[#30E674]/10',
      description: 'Cálculo UA Correctas vs Incorrectas'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#024580] w-12 h-12" />
        <p className="mt-4 text-gray-500 italic">Cargando métricas reales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold text-[#024580] tracking-tight">Panel de Control</h2>
        <p className="text-gray-500 font-normal italic text-lg">
          "La detección biológica al servicio de la seguridad"
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 relative group overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${stat.bg}`}></div>
            <div className="flex flex-col gap-6">
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em] mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-[#024580] ubuntu-numbering">{stat.value}</p>
              </div>
              <p className="text-[11px] text-gray-400 font-medium italic border-t pt-4">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mt-12 border-l-[12px] border-l-[#30E674]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-[#024580]">Actividad Reciente</h3>
          <button className="text-[10px] font-bold text-[#108BF7] uppercase tracking-widest hover:underline">Ver Historial Completo</button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-50 rounded-[2rem] bg-gray-50/30">
          <Activity size={64} className="text-gray-100 mb-6 drop-shadow-sm" />
          <p className="text-gray-300 italic text-center max-w-xs">
            Comienza a registrar entrenamientos para visualizar las estadísticas de desempeño aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
