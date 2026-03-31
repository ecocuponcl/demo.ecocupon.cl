/**
 * Gemini API Service
 * 
 * Conecta con el backend proxy (gemini-proxy.js) para llamadas seguras a Gemini API
 * SIN exponer la API Key en el frontend
 * 
 * Uso:
 *   import { generateContent, chat } from '@/services/gemini';
 *   
 *   const response = await generateContent('¿Qué es Smarter OS?');
 */

const API_URL = import.meta.env.VITE_PICOCLAW_API_URL || 'http://localhost:3335';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateOptions {
  prompt: string;
  context?: string;
}

export interface ChatOptions {
  messages: Message[];
  system?: string;
}

/**
 * Genera contenido usando Gemini API
 * @param options - Prompt y contexto opcional
 * @returns Texto generado por Gemini
 */
export const generateContent = async (options: GenerateOptions | string): Promise<string> => {
  const prompt = typeof options === 'string' ? options : options.prompt;
  const context = typeof options === 'object' ? options.context : '';

  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al generar contenido');
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Chat conversacional con historial
 * @param options - Mensajes y sistema opcional
 * @returns Respuesta del asistente
 */
export const chat = async (options: ChatOptions): Promise<string> => {
  const { messages, system = '' } = options;

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        system,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el chat');
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    throw error;
  }
};

/**
 * Verifica si el servicio Gemini está disponible
 * @returns true si está disponible
 */
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Gemini Health Check Error:', error);
    return false;
  }
};

export default {
  generateContent,
  chat,
  checkHealth,
};
