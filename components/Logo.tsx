
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'inverted' | 'white';
}

/**
 * Componente Logo Oficial Ecossistema BR232
 * Reconstrução fiel em SVG baseada na identidade visual enviada.
 * Cores Oficiais: Azul (#1e4d8c), Vermelho (#e31d24)
 */
const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'default' }) => {
  // Definindo as cores baseado na variante para melhor contraste
  const colors = {
    blue: variant === 'white' ? '#ffffff' : '#1e4d8c',
    red: variant === 'white' ? '#ffffff' : '#e31d24',
    text: variant === 'white' ? '#ffffff' : (variant === 'inverted' ? '#ffffff' : '#1e4d8c')
  };

  return (
    <div className={`flex items-center gap-3 transition-opacity ${className}`}>
      <svg 
        viewBox="0 0 512 512" 
        className="h-full w-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Números 232 integrados na parte superior */}
        <g fill={colors.blue} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
           <text x="80" y="210" fontSize="160" letterSpacing="-5">232</text>
        </g>

        {/* Estrutura Icônica da Logo (Curvas e Haste) */}
        <g strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Haste Vertical Esquerda (A parte do 'B') */}
          <path 
            d="M85 45 V420 C85 460 120 485 160 485 H320 C360 485 400 450 400 400" 
            stroke={colors.blue} 
          />
          
          {/* Curva Central Vermelha (O detalhe dinâmico) */}
          <path 
            d="M110 330 C150 250 280 250 320 330" 
            stroke={colors.red} 
          />

          {/* Curva Inferior Direita (Finalizando o 'R') */}
          <path 
            d="M290 350 C330 400 440 330 460 220" 
            stroke={colors.blue} 
          />
          
          {/* Ponto de Acabamento Vermelho na Base */}
          <path 
            d="M320 410 V485" 
            stroke={colors.red} 
            strokeWidth="32"
          />
        </g>
      </svg>
      
      {/* Tipografia de Apoio - Mantendo a clareza da plataforma */}
      <div className="flex flex-col justify-center border-l-2 border-slate-200 dark:border-white/10 pl-3">
        <span className={`font-black uppercase tracking-[0.2em] text-[10px] leading-none ${variant === 'white' ? 'text-white' : 'text-slate-500'}`}>
          Ecossistema
        </span>
        <span className={`font-black italic text-lg leading-tight tracking-tighter ${variant === 'white' ? 'text-white' : 'text-[#1e4d8c] dark:text-white'}`}>
          BR<span className="text-[#e31d24]">232</span>
        </span>
      </div>
    </div>
  );
};

export default Logo;
