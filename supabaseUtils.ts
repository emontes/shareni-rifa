
import { supabase } from './supabaseClient';
import { RaffleTicket, TicketStatus } from './types';
import { RAFFLE_SIZE } from './constants';
import { SUPABASE_TICKETS_TABLE, SUPABASE_STORAGE_BUCKET } from './config';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

const generateDefaultTickets = (): RaffleTicket[] => 
  Array.from({ length: RAFFLE_SIZE }, (_, i) => ({
    id: i + 1,
    status: TicketStatus.AVAILABLE,
  }));

export const fetchTicketsFromSupabase = async (): Promise<RaffleTicket[]> => {
  if (!supabase) {
    console.warn("Supabase client no está inicializado (configuración faltante o inválida). Devolviendo boletos por defecto.");
    return generateDefaultTickets();
  }

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TICKETS_TABLE)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching tickets from Supabase:', error.message, error); // Enhanced logging
      throw error; 
    }

    const fetchedTicketsMap = new Map<number, RaffleTicket>();
    if (data) {
      data.forEach((ticket: any) => {
        const numericId = parseInt(ticket.id, 10); 
        if (!isNaN(numericId) && numericId >= 1 && numericId <= RAFFLE_SIZE) {
            fetchedTicketsMap.set(numericId, {
              id: numericId,
              status: ticket.status as TicketStatus,
              buyerName: ticket.buyerName,
              buyerPhone: ticket.buyerPhone,
              buyerInstagram: ticket.buyerInstagram,
              buyerCity: ticket.buyerCity,
              soldBy: ticket.soldBy,
              paymentProofUrl: ticket.paymentProofUrl,
              notes: ticket.notes,
            });
        }
      });
    }
    
    const finalTickets: RaffleTicket[] = [];
    let createdNewTicketsInLoop = false;
    for (let i = 1; i <= RAFFLE_SIZE; i++) {
        if (fetchedTicketsMap.has(i)) {
            finalTickets.push(fetchedTicketsMap.get(i)!);
        } else {
            finalTickets.push({ id: i, status: TicketStatus.AVAILABLE });
            createdNewTicketsInLoop = true;
        }
    }

    if (data && data.length < RAFFLE_SIZE && createdNewTicketsInLoop) {
        console.log(`Supabase table '${SUPABASE_TICKETS_TABLE}' parece incompleta o nueva. Intentando poblar con ${RAFFLE_SIZE} boletos disponibles.`);
        const initialTicketsToSave = finalTickets.filter(t => !fetchedTicketsMap.has(t.id));
        if (initialTicketsToSave.length > 0) {
            await upsertTicketsToSupabase(initialTicketsToSave, true);
        }
    }
    
    return finalTickets;

  } catch (error: any) { 
    const errorMessage = error?.message || 'Error desconocido al interactuar con Supabase durante la obtención de boletos.';
    console.error("Error detallado al obtener o inicializar boletos:", errorMessage, error);
    alert(`Error al obtener los boletos desde Supabase: ${errorMessage}. Se mostrará una lista por defecto.`);
    return generateDefaultTickets();
  }
};

export const upsertTicketsToSupabase = async (ticketsToUpsert: RaffleTicket | RaffleTicket[], isInitialPopulation: boolean = false): Promise<void> => {
  if (!supabase) {
    console.warn("Supabase client no está inicializado. Operación de guardado cancelada.");
    if (!isInitialPopulation) {
        alert("No se pueden guardar los cambios: Supabase no está configurado correctamente.");
    }
    return;
  }
  if (!ticketsToUpsert || (Array.isArray(ticketsToUpsert) && ticketsToUpsert.length === 0)) return;

  const ticketsArray = Array.isArray(ticketsToUpsert) ? ticketsToUpsert : [ticketsToUpsert];

  const recordsToUpsert = ticketsArray.map(ticket => ({
    id: ticket.id,
    status: ticket.status,
    buyerName: ticket.buyerName || null,
    buyerPhone: ticket.buyerPhone || null,
    buyerInstagram: ticket.buyerInstagram || null,
    buyerCity: ticket.buyerCity || null,
    soldBy: ticket.soldBy || null,
    paymentProofUrl: ticket.paymentProofUrl || null,
    notes: ticket.notes || null,
  }));

  try {
    const { error } = await supabase
      .from(SUPABASE_TICKETS_TABLE)
      .upsert(recordsToUpsert, { onConflict: 'id' }); 

    if (error) {
      const upsertErrorMessage = error?.message || 'Error desconocido al guardar boletos en Supabase.';
      console.error('Error upserting tickets to Supabase:', upsertErrorMessage, error);
      if (!isInitialPopulation) {
        alert(`Error al guardar los boletos en Supabase: ${upsertErrorMessage}`);
      }
      throw error; 
    }
    if (!isInitialPopulation) {
        console.log('Boletos actualizados/insertados en Supabase exitosamente.');
    } else {
        console.log('Boletos iniciales poblados en Supabase.');
    }
  } catch (error: any) {
    if (!isInitialPopulation) {
        const catchErrorMessage = error?.message || 'Error de red o inesperado al guardar boletos.';
        console.error("Falló el upsert a Supabase (bloque catch):", catchErrorMessage, error);
    }
  }
};

export const uploadFileToSupabaseStorage = async (file: File): Promise<string | null> => {
  if (!supabase) {
    console.warn("Supabase client no está inicializado. Operación de subida de archivo cancelada.");
    alert("No se puede subir el archivo: Supabase no está configurado correctamente.");
    return null;
  }

  const fileName = `proof_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = `${fileName}`; 

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, 
      });

    if (uploadError) {
      const uploadErrorMessage = uploadError?.message || 'Error desconocido al subir archivo a Supabase Storage.';
      console.error('Error uploading file to Supabase Storage:', uploadErrorMessage, uploadError);
      alert(`Error al subir archivo a Supabase Storage: ${uploadErrorMessage}`);
      return null;
    }

    if (uploadData) {
       try {
           const { data: publicUrlData } = supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .getPublicUrl(uploadData.path);

           if (publicUrlData && publicUrlData.publicUrl) {
               console.log('Archivo subido y URL pública obtenida:', publicUrlData.publicUrl);
               return publicUrlData.publicUrl;
           } else {
               console.error('Archivo subido pero falló la obtención de la URL pública (URL no encontrada en data).');
               alert('Archivo subido pero no se pudo obtener la URL pública.');
               return null;
           }
       } catch (urlError: any) {
           const urlErrorMessage = urlError?.message || 'Error desconocido al obtener URL pública.';
           console.error('Error getting public URL from Supabase Storage:', urlErrorMessage, urlError);
           alert(`Archivo subido pero no se pudo obtener la URL pública: ${urlErrorMessage}.`);
           return null;
       }
    }
    console.warn('Upload to Supabase Storage did not return data or an error.');
    return null; 
  } catch (error: any) {
    const unexpectedErrorMessage = error?.message || 'Error inesperado durante la subida del archivo.';
    console.error('Error inesperado durante la subida del archivo:', unexpectedErrorMessage, error);
    alert(`Error inesperado al subir el archivo: ${unexpectedErrorMessage}.`);
    return null;
  }
};

export const getPublicUrlFromSupabaseStorage = (filePath: string): string | null => {
  if (!supabase) {
    console.warn("Supabase client no está inicializado. No se puede obtener URL pública.");
    return null;
  }
  if (!filePath) {
    console.warn("getPublicUrlFromSupabaseStorage: filePath es nulo o vacío.");
    return null;
  }
  
  try {
    const { data } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (data && data.publicUrl) {
        return data.publicUrl;
    } else {
        console.warn(`No se pudo obtener la URL pública para: ${filePath}. La respuesta no contenía una URL válida o data fue null.`);
        return null;
    }
  } catch (error: any) {
    const catchErrorMessage = error?.message || 'Error inesperado al obtener URL pública.';
    console.error(`Error inesperado obteniendo URL pública de Supabase Storage para ${filePath}:`, catchErrorMessage, error);
    return null;
  }
};

// --- Supabase Auth Utils ---

export const signInWithEmailPassword = async (email?: string, password?: string) => {
  if (!supabase) throw new Error("Supabase client no inicializado.");
  if (!email || !password) throw new Error("Email y contraseña son requeridos.");
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

export const signOutUser = async () => {
  if (!supabase) throw new Error("Supabase client no inicializado.");
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) {
      console.warn("Supabase client no inicializado. No se puede obtener el usuario actual.");
      return null;
  }
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
      console.error("Error al obtener la sesión actual de Supabase:", error.message);
      return null;
  }
  return session?.user ?? null;
};

export const onAuthStateChangeHandler = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
  if (!supabase) {
      console.warn("Supabase client no inicializado. No se puede suscribir a cambios de autenticación.");
      return { data: { subscription: null } }; // Return a compatible structure
  }
  return supabase.auth.onAuthStateChange(callback);
};