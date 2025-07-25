export interface WaSession {
  owner: string;
  name: string;
  number: string;
  status: string;
  updated_at: string;
}

export interface WaQueue {
  id: number;
  schedule_id: number;
  owner_id: string;
  status: string;
  created_at: string;
  sent_at?: string;
  sessionName?: string; // Campo calculado
}

export interface WaMessage {
  id: number;
  schedule_id: number;
  owner: string;
  status: string;
  message: string;
  created_at: string;
  sessionName?: string; // Campo calculado
}

export interface WhatsAppSummary {
  wa_sessions: WaSession[];
  wa_queue: WaQueue[];
  wa_messages: WaMessage[];
}