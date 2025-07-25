'use client';

import React, { useState } from 'react';
import { Menu, User, Settings, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ToolbarProps } from '@/types/layout.types';

export function Toolbar({ onToggleSidebar, sidebarOpen }: ToolbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleEditProfile = () => {
    setUserMenuOpen(false);
    // TODO: Implementar rota para editar perfil
    console.log('Editar perfil');
  };

  const handleChangePassword = () => {
    setUserMenuOpen(false);
    // TODO: Implementar rota para alterar senha
    console.log('Alterar senha');
  };

  return (
    <header className="bg-[#008089] border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Lado esquerdo - Botão hambúrguer */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-white/10 rounded-md text-white"
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <Menu className="h-5 w-5" />
        </Button>
        

      </div>

      {/* Lado direito - Menu do usuário */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-md"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white hidden sm:block">
            {user?.name || 'Usuário'}
          </span>
        </Button>

        {/* Dropdown do usuário */}
        {userMenuOpen && (
          <>
            {/* Overlay para fechar o menu */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setUserMenuOpen(false)}
            />
            
            {/* Menu popup */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                {/* Informações do usuário */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Level {user?.level} - {user?.role}
                  </p>
                </div>

                {/* Opções do menu */}
                <button
                  onClick={handleEditProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Editar Perfil
                </button>

                <button
                  onClick={handleChangePassword}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <KeyRound className="h-4 w-4 mr-3" />
                  Alterar Senha
                </button>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}