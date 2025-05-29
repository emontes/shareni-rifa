
import React, { useMemo } from 'react';
import { RaffleTicket, TicketStatus } from '../types';
import { TicketIcon, CheckCircleIcon, ClockIcon, QuestionMarkCircleIcon } from './icons/MiniHeroIcons';

interface ReportSummaryProps {
  tickets: RaffleTicket[];
  onFilterChange: (status: TicketStatus) => void;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ tickets, onFilterChange }) => {
  const summary = useMemo(() => {
    const counts = {
      [TicketStatus.AVAILABLE]: 0,
      [TicketStatus.SELECTED]: 0,
      [TicketStatus.RESERVED]: 0,
      [TicketStatus.PAID]: 0,
      total: tickets.length,
    };
    tickets.forEach(ticket => {
      counts[ticket.status]++;
    });
    return counts;
  }, [tickets]);

  const summaryItems = [
    { label: 'Pagados', count: summary[TicketStatus.PAID], status: TicketStatus.PAID, color: 'bg-red-600/80', hoverColor: 'hover:bg-red-500/80', icon: <CheckCircleIcon className="h-7 w-7 mr-3 text-red-300"/> },
    { label: 'Reservados (Pendientes)', count: summary[TicketStatus.RESERVED], status: TicketStatus.RESERVED, color: 'bg-yellow-500/80', hoverColor: 'hover:bg-yellow-400/80', icon: <ClockIcon className="h-7 w-7 mr-3 text-yellow-200"/> },
    { label: 'Seleccionados (En proceso)', count: summary[TicketStatus.SELECTED], status: TicketStatus.SELECTED, color: 'bg-sky-600/80', hoverColor: 'hover:bg-sky-500/80', icon: <QuestionMarkCircleIcon className="h-7 w-7 mr-3 text-sky-300"/> },
    { label: 'Disponibles', count: summary[TicketStatus.AVAILABLE], status: TicketStatus.AVAILABLE, color: 'bg-green-600/80', hoverColor: 'hover:bg-green-500/80', icon: <TicketIcon className="h-7 w-7 mr-3 text-green-300"/> },
  ];
  
  const totalSoldOrReserved = summary[TicketStatus.PAID] + summary[TicketStatus.RESERVED];
  const progressPercentage = summary.total > 0 ? (totalSoldOrReserved / summary.total) * 100 : 0;

  return (
    <div className="p-6 bg-slate-800/60 backdrop-blur-md rounded-xl shadow-xl">
      <h3 className="text-2xl font-semibold text-sky-400 mb-6">Resumen de Boletos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map(item => (
          <button
            key={item.label}
            onClick={() => item.count > 0 && onFilterChange(item.status)}
            disabled={item.count === 0}
            className={`p-5 rounded-lg shadow-lg flex items-center text-left w-full transition-all duration-150 ease-in-out
                        ${item.color} 
                        ${item.count > 0 ? `${item.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-opacity-75` : 'opacity-60 cursor-not-allowed'}
                        ${item.status === TicketStatus.PAID ? 'focus:ring-red-400' : ''}
                        ${item.status === TicketStatus.RESERVED ? 'focus:ring-yellow-300' : ''}
                        ${item.status === TicketStatus.SELECTED ? 'focus:ring-sky-400' : ''}
                        ${item.status === TicketStatus.AVAILABLE ? 'focus:ring-green-400' : ''}
                       `}
            aria-label={`Filtrar por ${item.label}: ${item.count} boletos`}
          >
            {item.icon}
            <div>
              <div className="text-3xl font-bold text-slate-100">{item.count}</div>
              <div className="text-sm text-slate-200">{item.label}</div>
            </div>
          </button>
        ))}
      </div>
       <div className="mt-6">
        <h4 className="text-lg font-semibold text-sky-300 mb-2">Progreso Total (Pagados + Reservados): {totalSoldOrReserved} / {summary.total}</h4>
        <div className="w-full bg-slate-700 rounded-full h-6">
          <div
            className="bg-gradient-to-r from-sky-500 to-green-500 h-6 rounded-full text-xs font-medium text-sky-100 text-center p-1 leading-none transition-width duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso de la rifa: ${progressPercentage.toFixed(1)}%`}
          >
            {progressPercentage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
