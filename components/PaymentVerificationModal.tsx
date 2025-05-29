import React, {useState} from 'react';
import { RaffleTicket, TicketStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, XMarkIcon, EyeIcon } from './icons/MiniHeroIcons';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: RaffleTicket;
  onVerify: (ticket: RaffleTicket, newStatus: TicketStatus.PAID | TicketStatus.AVAILABLE, notes?: string) => void;
}

const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({ isOpen, onClose, ticket, onVerify }) => {
  const [rejectionNotes, setRejectionNotes] = useState(ticket.notes || '');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onVerify(ticket, TicketStatus.PAID, rejectionNotes || 'Pago confirmado.');
  };

  const handleReject = () => {
    if (!rejectionNotes.trim()) {
        if(!confirm("¿Estás seguro de rechazar sin una nota específica? El boleto volverá a estar disponible.")){
            return;
        }
        onVerify(ticket, TicketStatus.AVAILABLE, 'Rechazado: Sin motivo específico.');
    } else {
        onVerify(ticket, TicketStatus.AVAILABLE, `Rechazado: ${rejectionNotes}`);
    }
  };
  
  const displayProofUrl = ticket.paymentProofUrl; // Supabase provides a direct public URL

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-sky-400 transition-colors">
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-2xl font-bold text-sky-400 mb-6">Verificar Pago - Boleto #{ticket.id}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Detalles del Comprador:</h3>
                <p className="text-sm text-slate-400"><strong>Nombre:</strong> {ticket.buyerName || '-'}</p>
                <p className="text-sm text-slate-400"><strong>Instagram:</strong> {ticket.buyerInstagram || '-'}</p>
                <p className="text-sm text-slate-400"><strong>Teléfono:</strong> {ticket.buyerPhone || '-'}</p>
                <p className="text-sm text-slate-400"><strong>Ciudad:</strong> {ticket.buyerCity || '-'}</p>
                <p className="text-sm text-slate-400"><strong>Vendido por:</strong> {ticket.soldBy || '-'}</p>
                {ticket.notes && <p className="text-sm text-slate-400 mt-2 pt-2 border-t border-slate-700"><strong>Notas Admin Previas:</strong> {ticket.notes}</p>}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Comprobante de Pago:</h3>
                {displayProofUrl ? (
                <a href={displayProofUrl} target="_blank" rel="noopener noreferrer" className="block border-2 border-slate-600 rounded-lg overflow-hidden hover:border-sky-500 transition-all">
                    <img 
                        src={displayProofUrl} 
                        alt={`Comprobante boleto ${ticket.id}`} 
                        className="w-full h-auto max-h-64 object-contain bg-slate-700"
                        onError={(e) => { 
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2QxZDVhZCI+PHBhdGggZD0iTTE2Ljg2MiA0LjQ4N2wxLjY4Ny0xLjY4OGExLjg3NSAxLjg3NSAwIDExMi42NTIgMi42NTJMMTAuNTgyIDE2LjA3YTQuNSA0LjUgMCAwMS0xLjg5NyAxLjEzTDYgMThsLjgtMi42ODVhNC41IDQuNSAwIDAxMS4xMy0xLjg5N2w4LjkzMi04LjkzMXptMCAwTDE5LjUgNy4xMjVNMTggMTR2NC43NUEyLjI1IDIuMjUgMCAwMTE1Ljc1IDIxSDUuMjVBMi4yNSAyLjI1IDAgMDEzIDE4Ljc1VjguMjVBMi4yNSAyLjI1IDAgMDE1LjI1IDZIMTAiIC8+PC9zdmc+'; 
                            (e.target as HTMLImageElement).alt = 'Error al cargar imagen'; 
                        }}
                    />
                    <span className="block text-center p-2 bg-slate-700 text-sky-400 text-sm hover:bg-slate-600">
                        <EyeIcon className="h-4 w-4 inline mr-1"/> Ver imagen original
                    </span>
                </a>
                ) : (
                <p className="text-sm text-slate-400 bg-slate-700 p-3 rounded-md">No se subió comprobante o el enlace no está disponible.</p>
                )}
            </div>
        </div>
        
        <div className="mb-6">
            <label htmlFor="rejectionNotes" className="block text-sm font-medium text-slate-300 mb-1">Notas (visibles para admin, se guardarán con el boleto):</label>
            <textarea 
                id="rejectionNotes" 
                value={rejectionNotes} 
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400"
                placeholder="Ej: Comprobante ilegible, monto incorrecto, pago confirmado el DD/MM/YY..."
            />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button 
            onClick={handleReject} 
            className="flex items-center justify-center px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            <XCircleIcon className="h-5 w-5 mr-2"/> Rechazar Pago (y liberar boleto)
          </button>
          <button 
            onClick={handleConfirm} 
            className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2"/> Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationModal;
