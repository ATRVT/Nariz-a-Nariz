import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#F3F5F2] min-h-screen overflow-hidden">
      {/* Mobile Menu Button - Fixed bottom right on mobile for easier reach */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-[#024580] text-white rounded-full shadow-2xl active:scale-95 transition-transform"
      >
        {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-[#021e3b]/80 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
        lg:static lg:block lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:opacity-100'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto w-full relative">
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12 pb-32 lg:pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
