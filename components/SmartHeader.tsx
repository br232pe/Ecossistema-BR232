
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface SmartHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

const SmartHeader: React.FC<SmartHeaderProps> = ({ 
  title, 
  subtitle, 
  onBack, 
  rightAction,
  transparent = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-all ${transparent ? 'bg-transparent' : 'bg-background-dark/80 backdrop-blur-xl border-b border-white/5'}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="size-10 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl flex items-center justify-center border border-white/5 transition-all text-slate-300 hover:text-white"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex flex-col">
          {subtitle && (
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/80 mb-0.5">
              {subtitle}
            </span>
          )}
          <h1 className="text-lg font-black italic uppercase tracking-tight text-white leading-none">
            {title}
          </h1>
        </div>
      </div>

      {rightAction && (
        <div className="flex items-center">
          {rightAction}
        </div>
      )}
    </header>
  );
};

export default SmartHeader;
