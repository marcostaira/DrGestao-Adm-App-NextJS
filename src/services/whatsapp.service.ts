import { ApiService } from './api.service';
import { ApiResponse } from '@/types/user.types';
import { WhatsAppSummary, WaSession, WaQueue, WaMessage } from '@/types/whatsapp.types';

export class WhatsAppService {
  /**
   * Buscar resumo completo do WhatsApp
   */
  static async getSummary(): Promise<ApiResponse<WhatsAppSummary>> {
    try {
      console.log('📱 Carregando dados do WhatsApp...');
      return await ApiService.get<WhatsAppSummary>('/summary');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do WhatsApp:', error);
      return {
        success: false,
        message: 'Erro ao carregar dados do WhatsApp'
      };
    }
  }

  /**
   * Processar dados do summary adicionando sessionName
   */
  static processWhatsAppData(data: WhatsAppSummary): {
    sessions: WaSession[];
    queue: WaQueue[];
    messages: WaMessage[];
  } {
    const sessions = data.wa_sessions || [];
    
    // Processar fila adicionando nome da sessão
    const queue = (data.wa_queue || []).map((item) => {
      const session = sessions.find(
        (s) => String(s.owner) === String(item.owner_id)
      );
      return {
        ...item,
        sessionName: session?.name || 'Desconhecido',
      };
    });

    // Processar mensagens adicionando nome da sessão
    const messages = (data.wa_messages || []).map((item) => {
      const session = sessions.find(
        (s) => String(s.owner) === String(item.owner)
      );
      return {
        ...item,
        sessionName: session?.name || 'Desconhecido',
      };
    });

    return { sessions, queue, messages };
  }

  /**
   * Formatar número de telefone para padrão brasileiro
   */
  static formatPhoneBR(phone: string): string {
    if (!phone) return '';
    
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Formata baseado no tamanho
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  /**
   * Traduzir status para português
   */
  static translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'connected': 'Conectado',
      'disconnected': 'Desconectado',
      'connecting': 'Conectando',
      'pending': 'Pendente',
      'sent': 'Enviado',
      'delivered': 'Entregue',
      'read': 'Lido',
      'failed': 'Falhou',
      'queued': 'Na Fila',
      'processing': 'Processando'
    };

    return statusMap[status.toLowerCase()] || status;
  }

  /**
   * Obter cor do status
   */
  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'connected': 'text-green-600',
      'conectado': 'text-green-600',
      'sent': 'text-blue-600',
      'enviado': 'text-blue-600',
      'delivered': 'text-green-500',
      'entregue': 'text-green-500',
      'read': 'text-green-700',
      'lido': 'text-green-700',
      'failed': 'text-red-600',
      'falhou': 'text-red-600',
      'disconnected': 'text-red-500',
      'desconectado': 'text-red-500',
      'pending': 'text-yellow-600',
      'pendente': 'text-yellow-600',
      'queued': 'text-yellow-500',
      'na fila': 'text-yellow-500',
      'connecting': 'text-blue-500',
      'conectando': 'text-blue-500',
      'processing': 'text-purple-600',
      'processando': 'text-purple-600'
    };

    return colorMap[status.toLowerCase()] || 'text-gray-600';
  }

  /**
   * Formatar data para padrão brasileiro
   */
  static formatDateBR(dateString: string): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}