"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  permission?: string;
  level?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    level: 4, // Todos podem acessar
  },
  {
    id: "whatsApp",
    title: "WhatsApp",
    icon: FileText,
    level: 2,
    children: [
      {
        id: "templates-default",
        title: "Templates",
        icon: FileText,
        href: "/templates/default",
        level: 2,
      },
      {
        id: "whatsapp-data",
        title: "Dados",
        icon: BarChart3,
        href: "/whatsapp/data",
        level: 2,
      },
    ],
  },
  {
    id: "reports",
    title: "Relatórios",
    icon: BarChart3,
    level: 3,
    children: [
      {
        id: "reports-dashboard",
        title: "Dashboard",
        icon: BarChart3,
        href: "/reports",
        level: 3,
      },
      {
        id: "reports-export",
        title: "Exportar Dados",
        icon: FileText,
        href: "/reports/export",
        level: 2,
      },
    ],
  },
  {
    id: "settings",
    title: "Configurações",
    icon: Settings,
    level: 2,
    children: [
      {
        id: "users",
        title: "Usuários",
        icon: Users,
        level: 2, // Admin e acima
        href: "/admin-users",
      },
      {
        id: "settings-general",
        title: "Parâmetros",
        icon: Settings,
        href: "/settings/params",
        level: 2,
      },
      {
        id: "settings-security",
        title: "Segurança",
        icon: Shield,
        href: "/settings/security",
        level: 1,
      },
    ],
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const { hasLevel } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["dashboard"]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    // Verificar permissão de acesso
    if (item.level && !hasLevel(item.level)) {
      return null;
    }

    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.href;

    const itemClasses = cn(
      "flex items-center text-left py-2 text-sm rounded-md transition-colors min-w-0",
      isActive
        ? "bg-white/20 text-white font-medium"
        : "text-white/80 hover:bg-white/10 hover:text-white",
      // Estilos específicos para cada estado
      isOpen
        ? depth === 0
          ? "mx-2 px-3 w-auto"
          : "mx-4 ml-6 px-3 w-auto"
        : "mx-1 w-14 justify-center"
    );

    return (
      <div key={item.id}>
        {/* Item principal */}
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={itemClasses}
          >
            <item.icon
              className={cn("h-4 w-4 flex-shrink-0", isOpen && "mr-3")}
            />
            {isOpen && (
              <>
                <span className="flex-1">{item.title}</span>
                {hasChildren &&
                  (isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </>
            )}
          </button>
        ) : (
          <Link href={item.href || "#"} className={itemClasses}>
            <item.icon
              className={cn("h-4 w-4 flex-shrink-0", isOpen && "mr-3")}
            />
            {isOpen && <span>{item.title}</span>}
          </Link>
        )}

        {/* Subitens */}
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "bg-[#005e66] border-r border-gray-600 transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Cabeçalho da sidebar */}
      <div className="p-4">
        <div className={cn("flex items-center", !isOpen && "justify-center")}>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <h2 className="text-sm font-semibold text-white">Painel</h2>
              <p className="text-xs text-white/70">Sistema DrGestão</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer da sidebar */}
      {isOpen && (
        <div className="p-4">
          <div className="text-xs text-white/60 text-center">
            v1.0.0 - ViaForteApps
          </div>
        </div>
      )}
    </aside>
  );
}