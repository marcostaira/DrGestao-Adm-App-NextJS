'use client';

import { useState, useEffect, useRef } from 'react';
import { WhatsAppService } from '@/services/whatsapp.service';
import { WaSession, WaQueue, WaMessage } from '@/types/whatsapp.types';

export function useWhatsApp() {
  const [sessions, setSessions] = useState<WaSession[]>([]);
  const [queue, setQueue] = useState<WaQueue[]>([]);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar dados
  const loadData = async () => {
    if (loading) return; // Evita múltiplas requisições simultâneas
    
    setLoading(true);
    setError(null);

    const response = await WhatsAppService.getSummary();

    if (response.success && response.data) {
      console.log('📱 Dados do WhatsApp carregados:', response.data);
      
      const processedData = WhatsAppService.processWhatsAppData(response.data);
      
      setSessions(processedData.sessions);
      setQueue(processedData.queue);
      setMessages(processedData.messages);
    } else {
      setError(response.message || 'Erro ao carregar dados do WhatsApp');
      console.error('❌ Erro ao carregar dados do WhatsApp:', response);
    }

    setLoading(false);
  };

  // Iniciar auto-refresh
  const startAutoRefresh = (intervalMs: number = 5000) => {
    stopAutoRefresh(); // Para qualquer refresh anterior
    
    intervalRef.current = setInterval(() => {
      loadData();
    }, intervalMs);
    
    console.log(`🔄 Auto-refresh iniciado (${intervalMs}ms)`);
  };

  // Parar auto-refresh
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ Auto-refresh parado');
    }
  };

  // Carregar dados e iniciar auto-refresh na inicialização
  useEffect(() => {
    loadData();
    startAutoRefresh(5000); // Atualiza a cada 5 segundos

    // Cleanup
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Parar auto-refresh quando componente for desmontado
  useEffect(() => {
    return () => stopAutoRefresh();
  }, []);

  return {
    sessions,
    queue,
    messages,
    loading,
    error,
    loadData,
    startAutoRefresh,
    stopAutoRefresh
  };
}