
import React, { useState, FormEvent } from 'react';
import { XMarkIcon, KeyIcon, EnvelopeIcon } from './icons/MiniHeroIcons';
import { signInWithEmailPassword } from '../supabaseUtils'; // Assuming this is correctly set up

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthError: (error: string | null) => void;
  authError: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, setAuthError, authError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signInWithEmailPassword(email, password);
      // On successful sign-in, the onAuthStateChange listener in App.tsx
      // will handle closing the modal and updating the user state.
      // No explicit onClose() call here unless signIn does not trigger state change to close it.
    } catch (error: any) {
      console.error("Auth Error:", error);
      setAuthError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-sky-400 transition-colors"
          aria-label="Cerrar modal de autenticación"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-2xl font-bold text-sky-400 mb-6 text-center">Acceso de Administrador</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico:</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" 
                    placeholder="tu@email.com"
                />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Contraseña:</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="password" 
                    id="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" 
                    placeholder="Tu contraseña"
                />
            </div>
          </div>

          {authError && (
            <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center">{authError}</p>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-500 disabled:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors"
          >
            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;