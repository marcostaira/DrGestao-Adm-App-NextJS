"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Tabs, Tab } from "@/components/ui/Tabs";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { WhatsAppService } from "@/services/whatsapp.service";
import {
  MessageSquare,
  Users,
  Clock,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function WhatsAppDataPage() {
  const { sessions, queue, messages, loading, error, loadData } = useWhatsApp();

  // Aba de Sessões
  const SessionsTab = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#008089] text-white">
            <tr>
              <th className="text-left p-3 font-semibold text-white">
                Tenant ID
              </th>
              <th className="text-left p-3 font-semibold text-white">Nome</th>
              <th className="text-left p-3 font-semibold text-white">Número</th>
              <th className="text-left p-3 font-semibold text-white">Status</th>
              <th className="text-left p-3 font-semibold text-white">
                Última atualização
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Nenhuma sessão encontrada
                </td>
              </tr>
            ) : (
              sessions.map((session, index) => (
                <tr
                  key={`${session.owner}-${index}`}
                  className="border-b hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <td className="p-3 text-sm">{session.owner}</td>
                  <td className="p-3 text-sm font-medium">{session.name}</td>
                  <td className="p-3 text-sm font-mono">
                    {WhatsAppService.formatPhoneBR(session.number)}
                  </td>
                  <td className="p-3 text-sm">
                    <span
                      className={`font-medium ${WhatsAppService.getStatusColor(
                        session.status
                      )}`}
                    >
                      {WhatsAppService.translateStatus(session.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {WhatsAppService.formatDateBR(session.updated_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Aba de Fila de Envio
  const QueueTab = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#008089] text-white">
            <tr>
              <th className="p-3 text-left font-semibold text-white">ID</th>
              <th className="p-3 text-left font-semibold text-white">
                Agendamento
              </th>
              <th className="p-3 text-left font-semibold text-white">
                Cliente (Tenant)
              </th>
              <th className="p-3 text-left font-semibold text-white">Status</th>
              <th className="p-3 text-left font-semibold text-white">
                Adicionado em
              </th>
              <th className="p-3 text-left font-semibold text-white">
                Enviado em
              </th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Nenhum item na fila
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <td className="p-3 text-sm font-mono">{item.id}</td>
                  <td className="p-3 text-sm">{item.schedule_id}</td>
                  <td className="p-3 text-sm font-medium">
                    {item.sessionName}
                  </td>
                  <td className="p-3 text-sm">
                    <span
                      className={`font-medium ${WhatsAppService.getStatusColor(
                        item.status
                      )}`}
                    >
                      {WhatsAppService.translateStatus(item.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {WhatsAppService.formatDateBR(item.created_at)}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {item.sent_at
                      ? WhatsAppService.formatDateBR(item.sent_at)
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Aba de Mensagens
  const MessagesTab = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#008089] text-white">
            <tr>
              <th className="p-3 text-left font-semibold text-white">ID</th>
              <th className="p-3 text-left font-semibold text-white">
                Agendamento
              </th>
              <th className="p-3 text-left font-semibold text-white">
                Cliente (Tenant)
              </th>
              <th className="p-3 text-left font-semibold text-white">Status</th>
              <th className="p-3 text-left font-semibold text-white">
                Adicionado em
              </th>
              <th className="p-3 text-left font-semibold text-white">
                Mensagem
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Nenhuma mensagem encontrada
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr
                  key={message.id}
                  className="border-b hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <td className="p-3 text-sm font-mono">{message.id}</td>
                  <td className="p-3 text-sm">{message.schedule_id}</td>
                  <td className="p-3 text-sm font-medium">
                    {message.sessionName}
                  </td>
                  <td className="p-3 text-sm">
                    <span
                      className={`font-medium ${WhatsAppService.getStatusColor(
                        message.status
                      )}`}
                    >
                      {WhatsAppService.translateStatus(message.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {WhatsAppService.formatDateBR(message.created_at)}
                  </td>
                  <td
                    className="p-3 text-sm max-w-xs truncate"
                    title={message.message}
                  >
                    {message.message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs: Tab[] = [
    {
      id: "sessions",
      label: "Sessões",
      content: <SessionsTab />,
    },
    {
      id: "queue",
      label: "Fila de Envio",
      content: <QueueTab />,
    },
    {
      id: "messages",
      label: "Mensagens",
      content: <MessagesTab />,
    },
  ];

  return (
    <ProtectedRoute requiredLevel={2}>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-[#008089]" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Dados de WhatsApp
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitore sessões, fila de envio e mensagens em tempo real
                </p>
              </div>
            </div>

            <Button
              onClick={loadData}
              disabled={loading}
              variant="secondary"
              leftIcon={
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              }
            >
              Atualizar
            </Button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Sessões Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Itens na Fila</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queue.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Mensagens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <Tabs tabs={tabs} defaultTab="sessions" />
        </div>

        {/* Info de atualização automática */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <RefreshCw className="h-4 w-4" />
            <p className="text-sm">
              Os dados são atualizados automaticamente a cada 5 segundos
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
