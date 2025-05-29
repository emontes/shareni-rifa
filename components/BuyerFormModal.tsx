
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { RaffleTicket } from '../types';
import { BBVA_ACCOUNT_HOLDER, BBVA_ACCOUNT_NUMBER, BBVA_CLABE_NUMBER, BBVA_DEBIT_CARD_NUMBER, BBVA_CONCEPT } from '../constants';
import { CameraIcon, XMarkIcon } from './icons/MiniHeroIcons';
import { uploadFileToSupabaseStorage } from '../supabaseUtils';

interface BuyerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (buyerDetails: Omit<RaffleTicket, 'id' | 'status' | 'notes'>) => void;
  selectedTicketIds: number[];
  ticketPrice: number;
}

const BuyerFormModal: React.FC<BuyerFormModalProps> = ({ isOpen, onClose, onSubmit, selectedTicketIds, ticketPrice }) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerInstagram, setBuyerInstagram] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("El archivo es demasiado grande. El límite es 10MB.");
        return;
      }
      setPaymentProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentProofFile) {
      alert("Por favor, sube tu comprobante de pago.");
      return;
    }
    if(selectedTicketIds.length === 0){
        alert("No hay boletos seleccionados para reservar.");
        return;
    }
    setIsSubmitting(true);
    
    try {
      const supabaseFileUrl = await uploadFileToSupabaseStorage(paymentProofFile);
      if (!supabaseFileUrl) {
        // Error already alerted in uploadFileToSupabaseStorage
        setIsSubmitting(false);
        return;
      }

      onSubmit({
        buyerName,
        buyerInstagram,
        buyerPhone,
        buyerCity,
        paymentProofUrl: supabaseFileUrl, // Use the Supabase Storage URL
        soldBy: 'Online', 
      });

      // Reset form
      setBuyerName('');
      setBuyerInstagram('');
      setBuyerPhone('');
      setBuyerCity('');
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      // onClose handled by parent after successful submission
    } catch (error) {
      console.error("Error during submission process:", error);
      alert("Ocurrió un error al procesar tu solicitud. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = selectedTicketIds.length * ticketPrice;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-sky-400 transition-colors">
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-2xl font-bold text-sky-400 mb-6 text-center">Reservar Boletos</h2>
        <p className="text-slate-300 mb-2 text-center">Estás reservando los boletos: <span className="font-semibold text-yellow-400">{selectedTicketIds.join(', ')}</span></p>
        <p className="text-lg font-semibold text-yellow-400 mb-6 text-center">Total a Pagar: ${totalAmount} MXN</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="buyerName" className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo:</label>
            <input type="text" id="buyerName" value={buyerName} onChange={e => setBuyerName(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" placeholder="Tu nombre completo"/>
          </div>
          <div>
            <label htmlFor="buyerInstagram" className="block text-sm font-medium text-slate-300 mb-1">Usuario de Instagram:</label>
            <input type="text" id="buyerInstagram" value={buyerInstagram} onChange={e => setBuyerInstagram(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" placeholder="@tuusuario"/>
          </div>
          <div>
            <label htmlFor="buyerPhone" className="block text-sm font-medium text-slate-300 mb-1">Teléfono:</label>
            <input type="tel" id="buyerPhone" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" placeholder="Tu número de teléfono"/>
          </div>
          <div>
            <label htmlFor="buyerCity" className="block text-sm font-medium text-slate-300 mb-1">Ciudad:</label>
            <input type="text" id="buyerCity" value={buyerCity} onChange={e => setBuyerCity(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400" placeholder="Tu ciudad"/>
          </div>

          <div className="p-4 bg-slate-700/70 rounded-lg">
            <p className="text-sm font-semibold text-sky-300 mb-2">Instrucciones de Pago:</p>
            <p className="text-xs text-slate-300">Realiza tu donativo de <strong>${totalAmount} MXN</strong> a la cuenta:</p>
            <ul className="list-disc list-inside ml-4 mt-1 text-xs text-slate-300 space-y-0.5">
                <li><strong>Titular:</strong> {BBVA_ACCOUNT_HOLDER}</li>
                <li><strong>Cuenta BBVA:</strong> {BBVA_ACCOUNT_NUMBER}</li>
                <li><strong>CLABE:</strong> {BBVA_CLABE_NUMBER}</li>
                <li><strong>Tarjeta de Débito (para referencia):</strong> {BBVA_DEBIT_CARD_NUMBER}</li>
                <li><strong>Concepto:</strong> {BBVA_CONCEPT}</li>
            </ul>
          </div>

          <div>
            <label htmlFor="paymentProof" className="block text-sm font-medium text-slate-300 mb-2">Comprobante de Pago:</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {paymentProofPreview ? (
                  <img src={paymentProofPreview} alt="Vista previa del comprobante" className="mx-auto h-32 w-auto object-contain rounded-md"/>
                ) : (
                  <CameraIcon className="mx-auto h-12 w-12 text-slate-400" />
                )}
                <div className="flex text-sm text-slate-500 justify-center">
                  <label htmlFor="paymentProofFile" className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-sky-500 px-3 py-1.5">
                    <span>{paymentProofFile ? 'Cambiar archivo' : 'Subir un archivo'}</span>
                    <input id="paymentProofFile" name="paymentProofFile" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required />
                  </label>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </div>
             {paymentProofFile && <p className="text-xs text-slate-400 mt-1">Archivo seleccionado: {paymentProofFile.name}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !paymentProofFile}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-500 disabled:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors"
          >
            {isSubmitting ? 'Enviando...' : `Enviar y Reservar ${selectedTicketIds.length} Boleto(s)`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyerFormModal;