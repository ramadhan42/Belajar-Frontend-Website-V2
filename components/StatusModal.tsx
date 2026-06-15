// components/StatusModal.tsx
import { X } from "lucide-react";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "warning";
  themeColor: string;
}

export default function StatusModal({ isOpen, onClose, title, message, type, themeColor }: StatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="bg-white rounded-[24px] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Ikon Statis */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${themeColor}20` }}>
            {type === "success" && <span className="text-3xl">✅</span>}
            {type === "error" && <span className="text-3xl">❌</span>}
            {type === "warning" && <span className="text-3xl">⚠️</span>}
          </div>
          
          <h3 className="text-xl font-bold font-['Nohemi'] mb-2" style={{ color: themeColor }}>{title}</h3>
          <p className="text-gray-600 font-['Parkinsans'] mb-6">{message}</p>
          
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-bold font-['Nohemi'] transition-all active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}