import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Dog, Users, CloudLightning, Lock, Unlock } from 'lucide-react';
import logoBida from '../assets/logo_bida.png';
import { getOfflineTrainings } from '../lib/gasService';

const navItems = [
  { path: '/', name: 'Dashboard', icon: Home },
  { path: '/new', name: 'Nuevo Entrenamiento', icon: ClipboardList },
  { path: '/dogs', name: 'Unidad Canina', icon: Dog },
  { path: '/trainers', name: 'Equipo', icon: Users },
];

export default function Sidebar({ onClose }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getOfflineTrainings().length);
    };
    const updateAdmin = () => {
      setIsAdmin(localStorage.getItem('nariz_admin') === 'true');
    };
    updateCount();
    updateAdmin();
    window.addEventListener('offline-trainings-updated', updateCount);
    window.addEventListener('admin-state-changed', updateAdmin);
    return () => {
      window.removeEventListener('offline-trainings-updated', updateCount);
      window.removeEventListener('admin-state-changed', updateAdmin);
    };
  }, []);

  const handleAdminToggle = () => {
    if (isAdmin) {
      localStorage.removeItem('nariz_admin');
      window.dispatchEvent(new Event('admin-state-changed'));
    } else {
      const code = prompt("Introduce la contraseña de administrador:");
      if (code === 'narizanariz') {
        localStorage.setItem('nariz_admin', 'true');
        window.dispatchEvent(new Event('admin-state-changed'));
      } else if (code !== null) {
        alert("Contraseña incorrecta.");
      }
    }
  };

  return (
    <aside className="w-64 bg-[#024580] text-white h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Dog className="text-[#F9953C]" />
          Nariz a Nariz
        </h1>
      </div>
      <nav className="flex-1 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-[#108BF7] border-r-4 border-[#F9953C] text-white shadow-inner'
                      : 'hover:bg-[#108BF7]/20 hover:text-white text-blue-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} className={isActive ? 'text-[#F9953C]' : ''} />
                    <span className="font-bold">{item.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto p-6 flex flex-col gap-4 bg-black/10">
        {pendingCount > 0 && (
          <div className="bg-[#F9953C]/10 border border-[#F9953C]/30 text-[#F9953C] rounded-2xl p-3 flex items-center gap-3 animate-pulse">
            <CloudLightning size={20} className="shrink-0" />
            <div className="text-left">
              <p className="font-bold text-xs">{pendingCount} lote{pendingCount > 1 ? 's' : ''} offline</p>
              <p className="text-[10px] opacity-70">Pendiente de sincronizar</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleAdminToggle}
          className={`flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
            isAdmin 
              ? 'bg-[#30E674]/10 border-[#30E674]/30 text-[#30E674]' 
              : 'bg-white/5 border-white/10 text-blue-200 hover:bg-white/10'
          }`}
        >
          {isAdmin ? (
            <>
              <Unlock size={12} />
              <span>Modo Administrador</span>
            </>
          ) : (
            <>
              <Lock size={12} />
              <span>Acceso Administrador</span>
            </>
          )}
        </button>
        <div className="flex items-center justify-center">
          <img 
            src={logoBida} 
            alt="BIDA Biodetección" 
            className="w-1/2 h-auto" 
          />
        </div>
        <div className="text-[10px] text-blue-200/50 flex justify-between items-center px-2">
          <span>© 2024 Nariz a Nariz</span>
          <span className="opacity-0">.</span>
        </div>
      </div>
    </aside>
  );
}
