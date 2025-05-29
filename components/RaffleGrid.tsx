
import React from 'react';
import { RaffleTicket, TicketStatus } from '../types';
import TicketNumber from './TicketNumber';

interface RaffleGridProps {
  tickets: RaffleTicket[];
  onSelectTicket: (ticketId: number) => void;
  selectedTicketsForPurchase: number[];
}

const RaffleGrid: React.FC<RaffleGridProps> = ({ tickets, onSelectTicket, selectedTicketsForPurchase }) => {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 xl:grid-cols-25 gap-2 p-4 bg-slate-800/60 backdrop-blur-sm rounded-lg shadow-xl">
      {tickets.map(ticket => (
        <TicketNumber
          key={ticket.id}
          ticket={ticket}
          onSelect={() => onSelectTicket(ticket.id)}
          isSelectedForPurchase={selectedTicketsForPurchase.includes(ticket.id)}
        />
      ))}
    </div>
  );
};

export default RaffleGrid;
