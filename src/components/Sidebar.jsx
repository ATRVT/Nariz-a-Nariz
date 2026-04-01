import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Dog, Users } from 'lucide-react';
import logoBida from '../assets/logo_bida.png';

const navItems = [
  { path: '/', name: 'Dashboard', icon: Home },
  { path: '/new', name: 'Nuevo Entrenamiento', icon: ClipboardList },
  { path: '/dogs', name: 'Unidad Canina', icon: Dog },
  { path: '/trainers', name: 'Equipo', icon: Users },
];

export default function Sidebar({ onClose }) {
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
