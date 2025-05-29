
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-sm text-center p-6 mt-12 border-t border-slate-700">
      <p className="text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Rifa Pro Trasplante Shareni Azcarraga. Todos los derechos reservados.
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Aplicación desarrollada con ❤️ para una gran causa.
      </p>
      <div className="mt-2">
        <a href="https://www.gofundme.com/f/apoyo-para-share-transplante-de-rinon" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors">
          Visita la campaña en GoFundMe
        </a>
      </div>
    </footer>
  );
};

export default Footer;
