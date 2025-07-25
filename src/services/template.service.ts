import { ApiService } from './api.service';
import { ApiResponse } from '@/types/user.types';

export interface Template {
  id: number;
  type: string;
  content: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateTemplateData {
  content: string;
  active: boolean;
}

export class TemplateService {
  private static readonly baseUrl = '/templates/def';

  /**
   * Buscar todos os templates padrão
   */
  static async getDefaultTemplates(): Promise<ApiResponse<Template[]>> {
    try {
      console.log('📋 Carregando templates padrão...');
      return await ApiService.get<Template[]>(this.baseUrl);
    } catch (error) {
      console.error('❌ Erro ao carregar templates:', error);
      return {
        success: false,
        message: 'Erro ao carregar templates'
      };
    }
  }

  /**
   * Atualizar template específico
   */
  static async updateTemplate(template: Template): Promise<ApiResponse<Template>> {
    try {
      console.log(`💾 Atualizando template ID: ${template.id} (${template.type})`);
      
      const updateData: UpdateTemplateData = {
        content: template.content,
        active: template.active
      };

      return await ApiService.put<Template>(`${this.baseUrl}/${template.id}`, updateData);
    } catch (error) {
      console.error('❌ Erro ao atualizar template:', error);
      return {
        success: false,
        message: 'Erro ao atualizar template'
      };
    }
  }

  /**
   * Validar variáveis do template
   */
  static validateTemplateVariables(content: string): {
    isValid: boolean;
    invalidVariables: string[];
    validVariables: string[];
  } {
    const validVariables = [
      'nome_clinica',
      'tel_clinica', 
      'data',
      'hora',
      'nome_paciente',
      'nome_completo',
      'primeiro_nome_profissional',
      'nome_profissional'
    ];

    // Extrair variáveis do conteúdo
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const foundVariables: string[] = [];
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
      foundVariables.push(match[1].trim());
    }

    // Separar válidas e inválidas
    const validFound = foundVariables.filter(v => validVariables.includes(v));
    const invalidFound = foundVariables.filter(v => !validVariables.includes(v));

    return {
      isValid: invalidFound.length === 0,
      invalidVariables: [...new Set(invalidFound)], // Remove duplicatas
      validVariables: [...new Set(validFound)]
    };
  }

  /**
   * Formatar tipo de template para display
   */
  static formatTemplateType(type: string): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Obter variáveis disponíveis
   */
  static getAvailableVariables(): Array<{ name: string; description: string }> {
    return [
      { name: 'nome_clinica', description: 'Nome da clínica' },
      { name: 'tel_clinica', description: 'Telefone da clínica' },
      { name: 'data', description: 'Data do agendamento' },
      { name: 'hora', description: 'Hora do agendamento' },
      { name: 'nome_paciente', description: 'Nome do paciente' },
      { name: 'nome_completo', description: 'Nome completo do paciente' },
      { name: 'primeiro_nome_profissional', description: 'Primeiro nome do profissional' },
      { name: 'nome_profissional', description: 'Nome completo do profissional' }
    ];
  }
}