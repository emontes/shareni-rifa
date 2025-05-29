import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Initialize to null. It will be populated if config is valid and client creation succeeds.
let supabaseExport: SupabaseClient | null = null;

const isPlaceholders = !SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL' ||
                       !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY';

if (isPlaceholders) {
  const message = "CONFIGURACIÓN DE SUPABASE INCOMPLETA: Por favor, edita el archivo 'config.ts' con tu Supabase Project URL y Anon Key.\n\n" +
                  "Project URL: " + (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' ? "Configurado (pero podría ser inválido si esta alerta aparece)" : "NO CONFIGURADO") + "\n" +
                  "Anon Key: " + (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' ? "Configurado" : "NO CONFIGURADO") + "\n\n" +
                  "La aplicación no funcionará correctamente hasta que esto se configure.";
  console.error(message);
  alert(message); 
  // supabaseExport remains null
} else {
  // Config seems to be filled (not placeholders), try to create client
  try {
    supabaseExport = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    // This catch block will handle errors like "TypeError: Failed to construct 'URL': Invalid URL"
    // if SUPABASE_URL is not a placeholder but still an invalid URL string.
    console.error("Error al inicializar Supabase Client:", error);
    const userMessage = "Error al conectar con Supabase. Verifica que la URL en config.ts ('" + SUPABASE_URL + "') sea válida.\n" +
                        "Detalle: " + (error instanceof Error ? error.message : String(error));
    alert(userMessage);
    // supabaseExport remains null
  }
}

// Export the instance (which might be null if config is missing or client creation failed)
export const supabase = supabaseExport;