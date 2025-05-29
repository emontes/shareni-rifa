
import React, { useState, useEffect, useCallback } from 'react';
import { RaffleTicket, TicketStatus } from './types';
import { RAFFLE_SIZE, DRAW_DATE, TICKET_PRICE, PRIZE_AMOUNT, BBVA_ACCOUNT_HOLDER, BBVA_ACCOUNT_NUMBER, BBVA_CLABE_NUMBER, BBVA_DEBIT_CARD_NUMBER, BBVA_CONCEPT } from './constants';
import { ADMIN_EMAILS } from './config'; 
import RaffleGrid from './components/RaffleGrid';
import BuyerFormModal from './components/BuyerFormModal';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { CheckIcon, CubeTransparentIcon, InformationCircleIcon } from './components/icons/MiniHeroIcons';
import {
  fetchTicketsFromSupabase,
  upsertTicketsToSupabase,
  getCurrentUser,
  onAuthStateChangeHandler,
  signOutUser,
} from './supabaseUtils';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'; 
import type { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [selectedTicketsForPurchase, setSelectedTicketsForPurchase] = useState<number[]>([]);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);


  useEffect(() => {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' && SUPABASE_URL && SUPABASE_ANON_KEY) {
      setIsSupabaseConfigured(true);
    } else {
      setIsSupabaseConfigured(false);
      setIsLoading(false); 
      if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn("App.tsx: Supabase no está configurado (placeholders detectados en config.ts).");
      } else if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("App.tsx: Supabase URL o Anon Key faltan en config.ts.");
        alert("Error de configuración: Falta la URL o la Clave Anónima de Supabase en config.ts.");
      }
    }
  }, []);

  // Auth effect
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkInitialUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
    };
    checkInitialUser();

    const { data: authListener } = onAuthStateChangeHandler((event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
      setAuthError(null); // Clear auth error on state change
      setShowAuthModal(false); // Close auth modal on successful auth change
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [isSupabaseConfigured]);
  
  // Efecto para hacer scroll al inicio cuando se activa la vista de administrador
  useEffect(() => {
    if (isAdminView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAdminView]);


  const loadRaffleData = useCallback(async () => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        console.log("loadRaffleData: Supabase no configurado, saltando carga de datos.");
        return;
    }
    setIsLoading(true);
    try {
      const fetchedTickets = await fetchTicketsFromSupabase();
      if (fetchedTickets && fetchedTickets.length > 0) {
        setTickets(fetchedTickets);
      } else {
        console.warn("loadRaffleData: fetchTicketsFromSupabase devolvió un array vacío o nulo.");
        if(tickets.length === 0){ 
            setTickets(Array.from({ length: RAFFLE_SIZE }, (_, i) => ({
                id: i + 1,
                status: TicketStatus.AVAILABLE,
            })));
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al cargar datos de la rifa.';
      console.error("Error loading raffle data in App.tsx catch:", errorMessage, error);
      alert(`Error crítico al cargar los datos de la rifa: ${errorMessage}. Revisa la consola.`);
      setTickets(Array.from({ length: RAFFLE_SIZE }, (_, i) => ({
        id: i + 1,
        status: TicketStatus.AVAILABLE,
      })));
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured, tickets.length]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadRaffleData();
    }
  }, [isSupabaseConfigured, loadRaffleData]);


  const updateTicketState = async (newFullTicketListForUI: RaffleTicket[], ticketsToSaveToSupabase: RaffleTicket | RaffleTicket[]) => {
    setTickets(newFullTicketListForUI);
    if (!isSupabaseConfigured) {
        alert("Supabase no está configurado. Los cambios no se guardarán.");
        return;
    }
    try {
      const ticketsToPersistArray = Array.isArray(ticketsToSaveToSupabase) ? ticketsToSaveToSupabase : [ticketsToSaveToSupabase];
      if (ticketsToPersistArray.length > 0) {
        await upsertTicketsToSupabase(ticketsToPersistArray);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido al guardar datos en Supabase.";
      console.error("Failed to save tickets to Supabase (App.tsx catch):", errorMessage, error);
      alert(`Error al guardar los datos de la rifa en Supabase: ${errorMessage}. Los cambios podrían no persistir.`);
    }
  };

  const handleTicketSelect = (ticketId: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    let newStatus: TicketStatus;
    let ticketToUpdate: RaffleTicket;

    if (selectedTicketsForPurchase.includes(ticketId)) {
      setSelectedTicketsForPurchase(prev => prev.filter(id => id !== ticketId));
      newStatus = TicketStatus.AVAILABLE;
      ticketToUpdate = { 
        ...ticket, 
        status: newStatus, 
        buyerName: '', 
        buyerCity: '', 
        buyerInstagram: '', 
        buyerPhone: '', 
        paymentProofUrl: '',
        notes: ticket.status === TicketStatus.SELECTED ? '' : ticket.notes, 
        soldBy: ticket.soldBy === 'Online' ? '' : ticket.soldBy 
      };
    } else {
      if (ticket.status === TicketStatus.AVAILABLE) {
        setSelectedTicketsForPurchase(prev => [...prev, ticketId]);
        newStatus = TicketStatus.SELECTED;
        ticketToUpdate = { ...ticket, status: newStatus, soldBy: 'Online' };
      } else {
        alert(`El boleto número ${ticketId} no está disponible para selección (Estado: ${ticket.status}).`);
        return;
      }
    }
    
    const updatedTickets = tickets.map(t => t.id === ticketId ? ticketToUpdate : t);
    updateTicketState(updatedTickets, ticketToUpdate);
  };

  const handleOpenBuyerModal = () => {
    if (selectedTicketsForPurchase.length === 0) {
      alert("Por favor, selecciona al menos un boleto.");
      return;
    }
    const allSelectedAreValid = selectedTicketsForPurchase.every(id => {
        const ticket = tickets.find(t => t.id === id);
        return ticket && (ticket.status === TicketStatus.AVAILABLE || ticket.status === TicketStatus.SELECTED);
    });

    if (!allSelectedAreValid) {
        alert("Alguno de los boletos seleccionados ya no está disponible o su estado ha cambiado. Por favor, revisa tu selección.");
        const newSelectedTickets = selectedTicketsForPurchase.filter(id => {
            const ticket = tickets.find(t => t.id === id);
            return ticket && (ticket.status === TicketStatus.AVAILABLE || ticket.status === TicketStatus.SELECTED);
        });
        setSelectedTicketsForPurchase(newSelectedTickets);

        if (newSelectedTickets.length === 0) {
            setIsBuyerModalOpen(false); 
            return;
        }
    }
    setIsBuyerModalOpen(true);
  };

  const handleBuyerFormSubmit = async (buyerDetails: Omit<RaffleTicket, 'id' | 'status'>) => {
    const ticketsToReserve = selectedTicketsForPurchase.map(id => {
      const currentTicket = tickets.find(t => t.id === id);
      if (!currentTicket || (currentTicket.status !== TicketStatus.AVAILABLE && currentTicket.status !== TicketStatus.SELECTED)) {
          alert(`El boleto ${id} ya no está disponible. Por favor, revisa tu selección.`);
          loadRaffleData(); 
          return null; 
      }
      return {
        ...currentTicket, 
        ...buyerDetails,
        id: id, 
        status: TicketStatus.RESERVED,
      } as RaffleTicket;
    }).filter(ticket => ticket !== null) as RaffleTicket[];

    if (ticketsToReserve.length !== selectedTicketsForPurchase.length) {
        const validReservedIds = ticketsToReserve.map(t=>t.id);
        const remainingSelectedForPurchase = selectedTicketsForPurchase.filter(id => validReservedIds.includes(id));
        setSelectedTicketsForPurchase(remainingSelectedForPurchase);

        if(ticketsToReserve.length === 0) {
            alert("Todos los boletos seleccionados previamente ya no están disponibles.");
            setIsBuyerModalOpen(false);
            return;
        }
    }
    
    if (ticketsToReserve.length === 0) {
        setIsBuyerModalOpen(false);
        return;
    }

    const updatedTicketsList = tickets.map(ticket => {
      const reservedVersion = ticketsToReserve.find(rt => rt.id === ticket.id);
      return reservedVersion ? reservedVersion : ticket;
    });
    
    await updateTicketState(updatedTicketsList, ticketsToReserve);
    
    alert(`¡Gracias! Tus boletos (${ticketsToReserve.map(t => t.id).join(', ')}) han sido reservados. Un administrador verificará tu pago pronto.`);
    setSelectedTicketsForPurchase([]);
    setIsBuyerModalOpen(false);
  };
  
  const handleLogout = async () => {
  try {
    await signOutUser();
    // Forzamos la actualización del estado para garantizar que la UI se actualice
    setCurrentUser(null);
    setIsAdminView(false);
  } catch (error: any) {
    // Incluso si hay un error, actualizamos el estado de la UI para "desconectar" al usuario
    setCurrentUser(null);
    setIsAdminView(false);
    
    // Mostramos un mensaje más amigable
    alert("La sesión ha sido cerrada localmente. Por favor, recarga la página si encuentras algún problema.");
  }
};

  const handleAdminUpdateTicket = async (updatedTicket: RaffleTicket) => {
    const updatedTickets = tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t);
    await updateTicketState(updatedTickets, updatedTicket);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4">
          <CubeTransparentIcon className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-2">Configuración Incompleta</h1>
          <p className="text-slate-300 text-center max-w-md">
              Parece que Supabase no está configurado correctamente. Por favor, edita el archivo <code className="bg-slate-700 px-1 rounded">config.ts</code> con tu URL y Clave Anónima de Supabase.
          </p>
          <p className="text-slate-400 text-sm mt-4">La aplicación no funcionará hasta que esto se resuelva.</p>
      </div>
    );
  }

  if (isLoading && !currentUser) { // Show loading only if Supabase is configured and we are initially fetching data/user
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <CubeTransparentIcon className="h-16 w-16 text-sky-500 animate-spin" />
        <p className="ml-4 text-xl text-slate-300">Cargando...</p>
      </div>
    );
  }
  
  const totalSelectedPrice = selectedTicketsForPurchase.length * TICKET_PRICE;

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100 ${!isAdminView ? 'pb-36 sm:pb-28' : ''}`}>
      <Header 
        currentUser={currentUser}
        isAdmin={isAdminView}
        onLoginClick={() => { setAuthError(null); setShowAuthModal(true); }}
        onLogoutClick={handleLogout}
      />
      
      <main className={`flex-grow container mx-auto p-4 sm:p-6 lg:p-8 ${!isAdminView ? 'pb-32' : ''}`}> {/* Add padding-bottom for buyer view */}
        {isAdminView ? (
          <AdminDashboard tickets={tickets} onUpdateTicket={handleAdminUpdateTicket} />
        ) : (
          <>
            <div className="bg-sky-800/50 backdrop-blur-md shadow-xl rounded-lg p-6 mb-8 text-center">
              <h2 className="text-3xl font-bold text-sky-300 mb-2">¡Participa y Apoya!</h2>
              <p className="text-slate-300 mb-1">Ayuda a Shareni Azcarraga con los gastos de cirugía de donante para su transplante de riñón.</p>
              <p className="text-slate-300 font-semibold">Premio: <span className="text-yellow-400">{PRIZE_AMOUNT}</span> | Costo por boleto: <span className="text-yellow-400">{TICKET_PRICE} MXN</span></p>
              <p className="text-sm text-sky-400 mt-2">Sorteo: {DRAW_DATE}</p>
            </div>

            {/* Sticky Action Bar - This entire block is moved and styled to be sticky */}
            {/* It was previously here: <div className="mb-6 p-4 bg-slate-800/60 backdrop-blur-sm rounded-lg shadow-lg"> */}
            {/* End of original location for action bar */}


            <RaffleGrid
              tickets={tickets}
              onSelectTicket={handleTicketSelect}
              selectedTicketsForPurchase={selectedTicketsForPurchase}
            />
            
            <div className="mt-8 p-6 bg-slate-800/60 backdrop-blur-sm rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-sky-400 mb-4 flex items-center"><InformationCircleIcon className="h-7 w-7 mr-2 text-sky-500"/>Instrucciones para Participar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>Selecciona los números deseados en el tablero. Los números que elijas se marcarán en azul.</li>
                <li>Verifica tu selección y el monto total a pagar.</li>
                <li>Haz clic en "Reservar Boletos Seleccionados".</li>
                <li>Completa el formulario con tus datos: Nombre, Instagram, Teléfono y Ciudad.</li>
                <li>Sube una foto de tu comprobante de pago. El pago es un donativo directo.
                    <ul className="list-disc list-inside ml-6 mt-2 p-3 bg-slate-700/50 rounded space-y-1">
                        <li><strong>Titular:</strong> {BBVA_ACCOUNT_HOLDER}</li>
                        <li><strong>Cuenta BBVA:</strong> {BBVA_ACCOUNT_NUMBER}</li>
                        <li><strong>CLABE:</strong> {BBVA_CLABE_NUMBER}</li>
                        <li><strong>Tarjeta de Débito (para referencia):</strong> {BBVA_DEBIT_CARD_NUMBER}</li>
                        <li><strong>Concepto:</strong> {BBVA_CONCEPT}</li>
                        <li><strong>Monto:</strong> {TICKET_PRICE} MXN por boleto.</li>
                    </ul>
                </li>
                <li>Una vez enviado, tus boletos cambiarán a estado "Reservado" (amarillo). Un administrador confirmará tu pago.</li>
                <li>Si tu pago es confirmado, el estado cambiará a "Pagado" (rojo con ✓).</li>
              </ol>
              <p className="mt-4 text-sm text-sky-400">Para cualquier duda, contacta a los organizadores.</p>
            </div>
          </>
        )}
      </main>
      
      {/* Sticky Action Bar - Placed outside main, before Footer */}
      {!isAdminView && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-800/90 backdrop-blur-md p-4 shadow-lg border-t border-slate-700">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-sky-400">Boletos Seleccionados: {selectedTicketsForPurchase.length}</h3>
                {selectedTicketsForPurchase.length > 0 && (
                  <p className="text-xs text-slate-300 max-w-xs truncate" title={selectedTicketsForPurchase.join(', ')}>
                    Números: {selectedTicketsForPurchase.join(', ')}
                  </p>
                )}
                <p className="text-md text-yellow-400 font-bold">Total a Pagar: ${totalSelectedPrice} MXN</p>
              </div>
              <button
                onClick={handleOpenBuyerModal}
                disabled={selectedTicketsForPurchase.length === 0 || tickets.length === 0}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white font-bold rounded-lg shadow-md transition-all duration-150 ease-in-out flex items-center justify-center gap-2 text-md"
                title={tickets.length === 0 ? "Datos no disponibles." : "Reservar boletos"}
              >
                <CheckIcon className="h-5 w-5" />
                Reservar Boletos
              </button>
            </div>
            {tickets.length === 0 && isSupabaseConfigured && <p className="text-center text-xs text-yellow-500 mt-1">La funcionalidad de reserva está deshabilitada. No se pudieron cargar los datos de los boletos.</p>}
          </div>
        </div>
      )}

      {isBuyerModalOpen && (
        <BuyerFormModal
          isOpen={isBuyerModalOpen}
          onClose={() => setIsBuyerModalOpen(false)}
          onSubmit={handleBuyerFormSubmit}
          selectedTicketIds={selectedTicketsForPurchase}
          ticketPrice={TICKET_PRICE}
        />
      )}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => { setShowAuthModal(false); setAuthError(null); }}
          setAuthError={setAuthError}
          authError={authError}
        />
      )}
      <Footer />
    </div>
  );
};

export default App;
