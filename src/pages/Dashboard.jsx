import { useState, useEffect } from 'react';
import { Activity, Target, Trophy, Loader2, CloudLightning, RotateCw, Medal } from 'lucide-react';
import { getEntities, getOfflineTrainings, syncOfflineTrainings } from '../lib/gasService';

// Helper to parse OCP/Objetivo, dealing with Google Sheets auto-formatting to dates
function parseOcp(ocp) {
  if (!ocp) return 0;
  const num = parseFloat(ocp);
  if (!isNaN(num)) return num;
  const dateObj = new Date(ocp);
  if (!isNaN(dateObj.getTime())) {
    // If it's a valid date, the day component usually represents the objective level
    return dateObj.getUTCDate();
  }
  return 0;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  async function loadData() {
    try {
      const res = await getEntities();
      if (res.status === 'success') {
        setData(res);
      }
    } catch (err) {
      console.error("Error al cargar entidades:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Setup offline count and listener
    const updateOfflineCount = () => {
      setOfflineCount(getOfflineTrainings().length);
    };
    updateOfflineCount();
    window.addEventListener('offline-trainings-updated', updateOfflineCount);
    return () => window.removeEventListener('offline-trainings-updated', updateOfflineCount);
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await syncOfflineTrainings();
      alert(`¡Sincronización completada con éxito! Se subieron ${res.count} lote(s) de entrenamientos.`);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al sincronizar datos offline.");
    } finally {
      setSyncing(false);
    }
  };

  // 1. Process Leaderboard Statistics
  const teamsMap = {};
  if (data?.trainings) {
    data.trainings.forEach(t => {
      const guideName = t.guia || t.guía || 'Desconocido';
      const dogName = t.perro || 'Desconocido';
      const key = `${guideName} & ${dogName}`;

      const uac = parseFloat(t.ua_c) || 0;
      const uai = parseFloat(t.ua_i) || 0;
      const ocpVal = parseOcp(t.objetivo || t.ocp);

      if (!teamsMap[key]) {
        teamsMap[key] = {
          guide: guideName,
          dog: dogName,
          totalUaC: 0,
          totalUaI: 0,
          maxOcp: 0,
          sessionCount: 0
        };
      }

      const team = teamsMap[key];
      team.totalUaC += uac;
      team.totalUaI += uai;
      team.sessionCount += 1;
      if (ocpVal > team.maxOcp) {
        team.maxOcp = ocpVal;
      }
    });
  }

  const leaderboard = Object.values(teamsMap).map(team => {
    const points = (team.totalUaC * 10) - (team.totalUaI * 5);
    const totalAttempts = team.totalUaC + team.totalUaI;
    const accuracy = totalAttempts > 0 ? (team.totalUaC / totalAttempts) * 100 : 0;

    return {
      ...team,
      points: Math.max(0, points), // Prevent negative points for UI aesthetics
      accuracy: accuracy.toFixed(1)
    };
  });

  // Sort by points descending, then by level descending, then by accuracy descending
  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.maxOcp !== a.maxOcp) return b.maxOcp - a.maxOcp;
    return parseFloat(b.accuracy) - parseFloat(a.accuracy);
  });

  // 2. Prepare Stats cards
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
      </div>

      {/* Offline Sync Banner */}
      {offlineCount > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm border-l-[12px] border-l-[#F9953C]">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#F9953C] shrink-0 animate-pulse">
              <CloudLightning size={24} />
            </div>
            <div>
              <h4 className="font-bold text-orange-950">Registros Offline Pendientes</h4>
              <p className="text-sm text-orange-850 mt-0.5">Tienes <strong>{offlineCount} lote{offlineCount > 1 ? 's' : ''}</strong> de entrenamientos guardados localmente sin sincronizar.</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full md:w-auto px-6 py-3 bg-[#F9953C] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {syncing ? (
              <><RotateCw className="animate-spin" size={18} /> Sincronizando...</>
            ) : (
              <><RotateCw size={18} /> Sincronizar Ahora</>
            )}
          </button>
        </div>
      )}
      
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

      {/* Marcador de Competición & Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Leaderboard Column (Spans 2 on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 border-l-[12px] border-l-[#108BF7] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="text-[#F9953C] w-6 h-6" />
              <h3 className="text-xl font-semibold text-[#024580]">Marcador de Competición</h3>
            </div>
            
            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/20 italic text-gray-400">
                Aún no hay estadísticas suficientes para generar el marcador.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Podium (Top 3) */}
                <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-100 items-end min-h-[160px]">
                  {/* 2nd Place */}
                  {leaderboard[1] && (
                    <div className="flex flex-col items-center text-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 order-1">
                      <div className="relative">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold shadow-inner">
                          2
                        </div>
                        <Medal className="absolute -bottom-1 -right-1 text-slate-400 w-5 h-5 fill-slate-400" />
                      </div>
                      <p className="font-bold text-xs mt-3 text-[#024580] truncate w-full">{leaderboard[1].guide}</p>
                      <p className="text-[10px] text-gray-400 italic truncate w-full">{leaderboard[1].dog}</p>
                      <div className="mt-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">
                        {leaderboard[1].points} pts
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {leaderboard[0] && (
                    <div className="flex flex-col items-center text-center p-5 bg-[#F9953C]/5 rounded-2xl border-2 border-[#F9953C]/20 shadow-sm order-2">
                      <div className="relative">
                        <div className="w-14 h-14 bg-[#F9953C]/10 rounded-full flex items-center justify-center text-[#F9953C] font-bold text-xl shadow-inner border border-[#F9953C]/30">
                          1
                        </div>
                        <Trophy className="absolute -bottom-1 -right-1 text-[#F9953C] w-5 h-5 fill-[#F9953C]" />
                      </div>
                      <p className="font-bold text-sm mt-3 text-[#024580] truncate w-full">{leaderboard[0].guide}</p>
                      <p className="text-[10px] text-gray-400 italic truncate w-full">{leaderboard[0].dog}</p>
                      <div className="mt-2 px-3 py-1 bg-[#F9953C] text-white rounded-full text-xs font-bold shadow-md shadow-[#F9953C]/20">
                        {leaderboard[0].points} pts
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {leaderboard[2] && (
                    <div className="flex flex-col items-center text-center p-4 bg-gray-50/80 rounded-2xl border border-gray-100 order-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-bold shadow-inner">
                          3
                        </div>
                        <Medal className="absolute -bottom-1 -right-1 text-amber-700 w-5 h-5 fill-amber-700" />
                      </div>
                      <p className="font-bold text-xs mt-3 text-[#024580] truncate w-full">{leaderboard[2].guide}</p>
                      <p className="text-[10px] text-gray-400 italic truncate w-full">{leaderboard[2].dog}</p>
                      <div className="mt-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-bold">
                        {leaderboard[2].points} pts
                      </div>
                    </div>
                  )}
                </div>

                {/* Leaderboard Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2 px-2">Pos</th>
                        <th className="py-2">Binomio (Guía / Perro)</th>
                        <th className="py-2 text-center">Nivel Máx</th>
                        <th className="py-2 text-center">Precisión</th>
                        <th className="py-2 text-right">Puntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((team, idx) => (
                        <tr key={idx} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx < 3 ? 'font-medium' : ''}`}>
                          <td className="py-3 px-2">
                            <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              idx === 0 ? 'bg-[#F9953C]/10 text-[#F9953C]' : 
                              idx === 1 ? 'bg-slate-200/50 text-slate-700' :
                              idx === 2 ? 'bg-amber-100/50 text-amber-800' : 'text-gray-400'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3">
                            <div>
                              <p className="text-xs font-bold text-[#024580]">{team.guide}</p>
                              <p className="text-[10px] text-gray-400 italic">Perro: {team.dog}</p>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="bg-[#108BF7]/10 text-[#108BF7] text-[10px] font-bold px-2 py-0.5 rounded">
                              Nivel {team.maxOcp}
                            </span>
                          </td>
                          <td className="py-3 text-center text-xs font-semibold">
                            <span className={parseFloat(team.accuracy) >= 80 ? 'text-[#30E674]' : parseFloat(team.accuracy) >= 50 ? 'text-[#F9953C]' : 'text-red-400'}>
                              {team.accuracy}%
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-xs text-[#024580]">
                            {team.points} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Column */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 border-l-[12px] border-l-[#30E674]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#024580]">Actividad Reciente</h3>
          </div>
          {data?.recentTrainings && data.recentTrainings.length > 0 ? (
            <div className="space-y-4">
              {data.recentTrainings.map((t, idx) => (
                <div key={idx} className="flex flex-col p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[#024580] text-sm">{t.perro}</p>
                      <p className="text-[11px] text-gray-400">con {t.guia || t.guía || 'Desconocido'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#30E674]">+{t.ua_c} UA Correctas</p>
                      <p className="text-[10px] text-[#F878A3]">-{t.ua_i} Incorrectas</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200/50 mt-3 pt-2 flex justify-between items-center text-[10px] text-gray-400 italic">
                    <span>{t.fecha_sesion ? t.fecha_sesion.split('T')[0] : ''}</span>
                    <span className="font-bold text-[#108BF7] bg-[#108BF7]/5 px-2 py-0.5 rounded">Obj: {t.objetivo || t.ocp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-50 rounded-[2rem] bg-gray-50/30">
              <Activity size={64} className="text-gray-100 mb-6 drop-shadow-sm" />
              <p className="text-gray-300 italic text-center max-w-xs">
                Comienza a registrar entrenamientos para visualizar las estadísticas de desempeño aquí.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
