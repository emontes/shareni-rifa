
import React, { useState, useMemo } from 'react';
import { RaffleTicket, TicketStatus } from '../types';
import ReportSummary from './ReportSummary';
import PaymentVerificationModal from './PaymentVerificationModal';
import AdminTicketEditorModal from './AdminTicketEditorModal';
import { PencilIcon, EyeIcon, MagnifyingGlassIcon } from './icons/MiniHeroIcons';


interface AdminDashboardProps {
  tickets: RaffleTicket[];
  onUpdateTicket: (updatedTicket: RaffleTicket) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ tickets, onUpdateTicket }) => {
  const [selectedTicketForVerification, setSelectedTicketForVerification] = useState<RaffleTicket | null>(null);
  const [selectedTicketForEditing, setSelectedTicketForEditing] = useState<RaffleTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const statusMatch = filterStatus === 'ALL' || ticket.status === filterStatus;
      const term = searchTerm.toLowerCase();
      const searchMatch = !searchTerm ||
        ticket.id.toString().includes(term) ||
        ticket.buyerName?.toLowerCase().includes(term) ||
        ticket.buyerInstagram?.toLowerCase().includes(term) ||
        ticket.buyerPhone?.toLowerCase().includes(term) ||
        ticket.buyerCity?.toLowerCase().includes(term) ||
        ticket.soldBy?.toLowerCase().includes(term);
      return statusMatch && searchMatch;
    });
  }, [tickets, filterStatus, searchTerm]);

  const handleVerifyPayment = (ticket: RaffleTicket, newStatus: TicketStatus.PAID | TicketStatus.AVAILABLE, notes?: string) => {
    onUpdateTicket({ ...ticket, status: newStatus, notes: notes || ticket.notes });
    setSelectedTicketForVerification(null);
  };

  const handleSaveChanges = (updatedTicket: RaffleTicket) => {
    onUpdateTicket(updatedTicket);
    setSelectedTicketForEditing(null);
  };
  
  const getStatusClass = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.AVAILABLE: return 'bg-green-600/80 text-green-100';
      case TicketStatus.SELECTED: return 'bg-sky-600/80 text-sky-100';
      case TicketStatus.RESERVED: return 'bg-yellow-500/80 text-yellow-900';
      case TicketStatus.PAID: return 'bg-red-600/80 text-red-100';
      default: return 'bg-slate-500/80 text-slate-100';
    }
  };

  const statusTranslations: Record<TicketStatus | 'ALL', string> = {
    ALL: 'Todos',
    AVAILABLE: 'Disponibles',
    SELECTED: 'Seleccionados',
    RESERVED: 'Reservados',
    PAID: 'Pagados',
  };

  const handleSummaryFilterChange = (status: TicketStatus) => {
    setFilterStatus(status);
  };

  return (
    <div className="space-y-8">
      <ReportSummary tickets={tickets} onFilterChange={handleSummaryFilterChange} />

      <div className="p-6 bg-slate-800/60 backdrop-blur-md rounded-xl shadow-xl">
        <h3 className="text-2xl font-semibold text-sky-400 mb-6">Gestión de Boletos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-slate-300 mb-1">Filtrar por estado:</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'ALL')}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500"
            >
              {(['ALL'] as (TicketStatus | 'ALL')[]).concat(Object.values(TicketStatus)).map(s => (
                <option key={s} value={s}>{statusTranslations[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-slate-300 mb-1">Buscar:</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                type="text"
                id="searchTerm"
                placeholder="ID, nombre, Instagram..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400"
                />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-slate-700 bg-slate-800">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Comprador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Instagram</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Ciudad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Vendido Por</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">{ticket.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                      {statusTranslations[ticket.status]}
                      {ticket.status === TicketStatus.PAID && ' ✓'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{ticket.buyerName || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{ticket.buyerInstagram || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{ticket.buyerPhone || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{ticket.buyerCity || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{ticket.soldBy || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    {ticket.status === TicketStatus.RESERVED && (
                      <button
                        onClick={() => setSelectedTicketForVerification(ticket)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-md"
                        title="Verificar Pago"
                      >
                        <EyeIcon className="h-5 w-5"/>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTicketForEditing(ticket)}
                      className="text-sky-400 hover:text-sky-300 transition-colors p-1.5 bg-sky-500/20 hover:bg-sky-500/30 rounded-md"
                      title="Editar Boleto"
                    >
                      <PencilIcon className="h-5 w-5"/>
                    </button>
                  </td>
                </tr>
              ))}
               {filteredTickets.length === 0 && (
                <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                        No se encontraron boletos con los filtros actuales.
                    </td>
                </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicketForVerification && (
        <PaymentVerificationModal
          isOpen={!!selectedTicketForVerification}
          onClose={() => setSelectedTicketForVerification(null)}
          ticket={selectedTicketForVerification}
          onVerify={handleVerifyPayment}
        />
      )}

      {selectedTicketForEditing && (
        <AdminTicketEditorModal
          isOpen={!!selectedTicketForEditing}
          onClose={() => setSelectedTicketForEditing(null)}
          ticket={selectedTicketForEditing}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
