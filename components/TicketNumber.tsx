
import React from 'react';
import { RaffleTicket, TicketStatus } from '../types';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from './icons/MiniHeroIcons'; // Placeholder, replace with actual icons or adjust

interface TicketNumberProps {
  ticket: RaffleTicket;
  onSelect: () => void;
  isSelectedForPurchase: boolean;
}

const TicketNumber: React.FC<TicketNumberProps> = ({ ticket, onSelect, isSelectedForPurchase }) => {
  let bgColor = 'bg-green-600 hover:bg-green-500'; // AVAILABLE
  let textColor = 'text-white';
  let statusText = ticket.id.toString();
  let borderColor = 'border-transparent';
  let icon = null;

  switch (ticket.status) {
    case TicketStatus.AVAILABLE:
      bgColor = 'bg-green-600 hover:bg-green-500 focus:bg-green-400';
      statusText = ticket.id.toString();
      break;
    case TicketStatus.SELECTED:
      bgColor = 'bg-sky-600 hover:bg-sky-500 focus:bg-sky-400';
      statusText = ticket.id.toString();
      icon = <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-0.5" />;
      break;
    case TicketStatus.RESERVED:
      bgColor = 'bg-yellow-500 cursor-not-allowed';
      textColor = 'text-slate-900';
      statusText = ticket.id.toString();
      icon = <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-0.5" />;
      break;
    case TicketStatus.PAID:
      bgColor = 'bg-red-600 cursor-not-allowed';
      statusText = `${ticket.id}`;
      icon = <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-0.5" />;
      break;
  }

  if (isSelectedForPurchase && ticket.status === TicketStatus.AVAILABLE) {
    // If selected by current user for purchase and was available
    borderColor = 'border-sky-400 ring-2 ring-sky-400';
    bgColor = 'bg-sky-600'; // Visually indicate selection before it becomes globally SELECTED
  } else if (isSelectedForPurchase && ticket.status === TicketStatus.SELECTED) {
    // If re-affirming a ticket already globally SELECTED
    borderColor = 'border-sky-400 ring-2 ring-sky-400';
  }


  const isDisabled = ticket.status === TicketStatus.RESERVED || ticket.status === TicketStatus.PAID;

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`w-full aspect-square flex flex-col items-center justify-center rounded-md text-sm sm:text-base font-bold transition-all duration-150 ease-in-out
                  ${bgColor} ${textColor} ${borderColor} 
                  ${isDisabled ? 'opacity-70' : 'shadow-md hover:shadow-lg transform hover:-translate-y-0.5'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-opacity-75`}
      aria-label={`Boleto número ${ticket.id}, estado: ${ticket.status}`}
    >
      {icon}
      <span className={icon ? 'mt-0.5' : ''}>{statusText}</span>
      {ticket.status === TicketStatus.PAID && <span className="text-xs absolute bottom-0.5 right-0.5">✓</span>}
    </button>
  );
};

export default TicketNumber;
