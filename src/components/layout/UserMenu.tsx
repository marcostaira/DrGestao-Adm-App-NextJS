"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getLevelDescription } from "@/lib/auth/permissions";
import {
  ChevronDown,
  User as UserIcon,
  Settings,
  Key,
  LogOut,
  Shield,
} from "lucide-react";
import { UserMenuProps } from "@/types/layout.types";

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleEditProfile = () => {
    setIsOpen(false);
    // TODO: Implementar rota para editar perfil
    console.log("Editar perfil");
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    // TODO: Implementar rota para alterar senha
    console.log("Alterar senha");
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {getInitials(user.name)}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">
            {getLevelDescription(user.level)}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center mt-1">
              <Shield className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-600">
                {getLevelDescription(user.level)}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={handleEditProfile}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <UserIcon className="h-4 w-4 mr-3" />
              Editar Perfil
            </button>

            <button
              onClick={handleChangePassword}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Key className="h-4 w-4 mr-3" />
              Alterar Senha
            </button>

            {user.level <= 2 && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Implementar configurações
                  console.log("Configurações");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4 mr-3" />
                Configurações
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
