
import React from 'react';
import { DRAW_DATE } from '../constants';
import { Cog6ToothIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from './icons/MiniHeroIcons';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  currentUser: User | null;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    currentUser,
    isAdmin,
    onLoginClick,
    onLogoutClick,
}) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-md shadow-lg p-4 sm:p-6 top-0 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-400">
            Rifa Pro Trasplante Shareni
          </h1>
          <p className="text-xs sm:text-sm text-sky-500">
            {isAdmin ? "Panel de Administración" : `Sorteo: ${DRAW_DATE}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="text-sm text-slate-300 hidden md:block">
              {currentUser.email} {isAdmin && <span className="text-sky-400">(Admin)</span>}
            </div>
          )}
          {currentUser ? (
            <button
              onClick={onLogoutClick}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-md transition-colors"
              title="Cerrar Sesión"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 sm:mr-2"/>
              <span className="hidden sm:inline">Salir</span>
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-colors"
              title="Iniciar Sesión (Admin)"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 sm:mr-2"/>
              <span className="hidden sm:inline">Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;