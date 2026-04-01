import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

export default function MultiSelect({ options, selected, onChange, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    const isSelected = selected.includes(id);
    if (isSelected) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeOption = (e, id) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== id));
  };

  const selectedOptions = options.filter(opt => selected.includes(opt.id));

  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      
      <div 
        className="min-h-[42px] p-2 border border-gray-300 rounded-lg bg-white flex flex-wrap gap-2 items-center cursor-pointer hover:border-primary transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-400 select-none pl-2">{placeholder}</span>
        ) : (
          selectedOptions.map(opt => (
            <span key={opt.id} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
              {opt.name}
              <button onClick={(e) => removeOption(e, opt.id)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))
        )}
        <div className="ml-auto pr-2">
          <ChevronDown size={18} className="text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No hay opciones disponibles</div>
          ) : (
            options.map(opt => {
              const isSelected = selected.includes(opt.id);
              return (
                <div 
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`px-4 py-2 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                >
                  <span className={`text-sm ${isSelected ? 'font-medium text-primary' : 'text-gray-700'}`}>
                    {opt.name}
                  </span>
                  {isSelected && <Check size={16} className="text-primary" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
