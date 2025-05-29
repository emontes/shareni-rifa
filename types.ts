
export enum TicketStatus {
  AVAILABLE = 'AVAILABLE', // Verde: Disponible para compra/selección.
  SELECTED = 'SELECTED',   // Azul: Seleccionado por un comprador potencial (selección inicial).
  RESERVED = 'RESERVED',   // Amarillo: Seleccionado y comprobante de pago enviado, esperando verificación del administrador.
  PAID = 'PAID',           // Rojo con ✓: Pagado (Administrador ha confirmado el pago).
}

export interface RaffleTicket {
  id: number;
  status: TicketStatus;
  buyerName?: string;
  buyerPhone?: string;
  buyerInstagram?: string;
  buyerCity?: string;
  soldBy?: string;
  paymentProofUrl?: string; // Data URL of the uploaded image
  notes?: string; // Admin notes, e.g., reason for rejection
}

export interface AdminConfig {
  password?: string; // Simple password for demo purposes
}
