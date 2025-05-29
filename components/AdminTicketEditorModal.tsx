import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { RaffleTicket, TicketStatus } from '../types';
import { XMarkIcon, CheckIcon, ArrowPathIcon, CameraIcon, CubeTransparentIcon } from './icons/MiniHeroIcons';
import { uploadFileToSupabaseStorage, getPublicUrlFromSupabaseStorage } from '../supabaseUtils';

interface AdminTicketEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: RaffleTicket;
  onSave: (updatedTicket: RaffleTicket) => void;
}

const AdminTicketEditorModal: React.FC<AdminTicketEditorModalProps> = ({ isOpen, onClose, ticket, onSave }) => {
  const [formData, setFormData] = useState<RaffleTicket>({ ...ticket });
  const [newProofFile, setNewProofFile] = useState<File | null>(null);
  const [newProofPreview, setNewProofPreview] = useState<string | null>(null); // For local preview of new file
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData({ ...ticket });
    setNewProofFile(null);
    setNewProofPreview(null);
  }, [ticket, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("El archivo es demasiado grande. El límite es 10MB.");
        return;
      }
      setNewProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setNewProofFile(null);
        setNewProofPreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    let finalFormData = { ...formData };

    if (newProofFile) {
      const supabaseFileUrl = await uploadFileToSupabaseStorage(newProofFile);
      if (supabaseFileUrl) {
        finalFormData.paymentProofUrl = supabaseFileUrl;
      } else {
        // Error already handled by uploadFileToSupabaseStorage
        setIsUploading(false);
        return; // Don't save if upload failed
      }
    }
    
    onSave(finalFormData);
    setIsUploading(false);
    // onClose(); // Usually handled by parent after successful save
  };

  if (!isOpen) return null;

  // Display new preview if available, otherwise existing Supabase URL
  const currentProofUrlToDisplay = newProofPreview || formData.paymentProofUrl;
  
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-sky-400 transition-colors">
            <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-2xl font-bold text-sky-400 mb-6">Editar Boleto #{ticket.id}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">Estado:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500"
              >
                {Object.values(TicketStatus).map(statusVal => (
                  <option key={statusVal} value={statusVal}>{statusVal}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="soldBy" className="block text-sm font-medium text-slate-300 mb-1">Vendido por:</label>
              <input type="text" id="soldBy" name="soldBy" value={formData.soldBy || ''} onChange={handleChange} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" placeholder="Nombre del vendedor"/>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-300 pt-2 border-t border-slate-700">Información del Comprador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="buyerName" className="block text-sm font-medium text-slate-300 mb-1">Nombre:</label>
              <input type="text" id="buyerName" name="buyerName" value={formData.buyerName || ''} onChange={handleChange} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" />
            </div>
            <div>
              <label htmlFor="buyerInstagram" className="block text-sm font-medium text-slate-300 mb-1">Instagram:</label>
              <input type="text" id="buyerInstagram" name="buyerInstagram" value={formData.buyerInstagram || ''} onChange={handleChange} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" />
            </div>
            <div>
              <label htmlFor="buyerPhone" className="block text-sm font-medium text-slate-300 mb-1">Teléfono:</label>
              <input type="tel" id="buyerPhone" name="buyerPhone" value={formData.buyerPhone || ''} onChange={handleChange} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" />
            </div>
            <div>
              <label htmlFor="buyerCity" className="block text-sm font-medium text-slate-300 mb-1">Ciudad:</label>
              <input type="text" id="buyerCity" name="buyerCity" value={formData.buyerCity || ''} onChange={handleChange} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" />
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">Notas (Admin):</label>
            <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" placeholder="Notas internas, ej: razón de rechazo manual"/>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Comprobante de Pago:</label>
            {currentProofUrlToDisplay ? (
                <div className="my-2 p-2 border border-slate-600 rounded-md bg-slate-700/50 max-w-xs">
                    <a href={formData.paymentProofUrl || '#'} target="_blank" rel="noopener noreferrer" title="Ver comprobante actual">
                        <img 
                            src={currentProofUrlToDisplay} 
                            alt="Comprobante" 
                            className="max-h-40 rounded object-contain" 
                            onError={(e) => { 
                                (e.target as HTMLImageElement).alt = 'No se pudo cargar imagen'; 
                                (e.target as HTMLImageElement).src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2QxZDVhZCI+PHBhdGggZD0iTTE2Ljg2MiA0LjQ4N2wxLjY4Ny0xLjY4OGExLjg3NSAxLjg3NSAwIDExMi42NTIgMi42NTJMMTAuNTgyIDE2LjA3YTQuNSA0LjUgMCAwMS0xLjg5NyAxLjEzTDYgMThsLjgtMi42ODVhNC41IDQuNSAwIDAxMS4xMy0xLjg5N2w4LjkzMi04LjkzMXptMCAwTDE5LjUgNy4xMjVNMTggMTR2NC43NUEyLjI1IDIuMjUgMCAwMTE1Ljc1IDIxSDUuMjVBMi4yNSAyLjI1IDAgMDEzIDE4Ljc1VjguMjVBMi4yNSAyLjI1IDAgMDE1LjI1IDZIMTAiIC8+PC9zdmc+'; 
                            }}
                        />
                    </a>
                    {newProofPreview && <p className="text-xs text-sky-300 mt-1">Nueva imagen seleccionada (pendiente de guardar).</p>}
                    {!newProofPreview && formData.paymentProofUrl && 
                        <a href={formData.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline block mt-1">
                            Ver imagen original
                        </a>
                    }
                </div>
            ) : (
                 <p className="text-sm text-slate-400 my-2">No hay comprobante actual.</p>
            )}
            <input 
                type="file" 
                id="newPaymentProof" 
                name="newPaymentProof" 
                onChange={handleFileChange} 
                accept="image/*"
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-sky-50 hover:file:bg-sky-500"
            />
            <p className="text-xs text-slate-500 mt-1">Sube una nueva imagen para reemplazar la actual. Límite 10MB.</p>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button 
                type="button" 
                onClick={() => { setFormData({...ticket}); setNewProofFile(null); setNewProofPreview(null); }}
                disabled={isUploading}
                className="flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
                title="Restaurar cambios"
            >
                <ArrowPathIcon className="h-5 w-5 mr-2" /> Restaurar
            </button>
            <button 
              type="submit" 
              disabled={isUploading}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isUploading ? <><CubeTransparentIcon className="h-5 w-5 mr-2 animate-spin" /> Guardando...</> : <><CheckIcon className="h-5 w-5 mr-2" /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTicketEditorModal;
