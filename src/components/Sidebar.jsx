"use client";

import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  UserCheck,
  ShoppingCart,
  Receipt,
  Building2,
  Percent,
  Truck,
  Tags,
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/empleados", label: "Empleados", icon: Users },
  { path: "/dashboard/roles", label: "Roles", icon: ShieldCheck },
  { path: "/dashboard/productos", label: "Productos", icon: Package },
  { path: "/dashboard/usuarios", label: "Usuarios", icon: UserCheck },
  { path: "/dashboard/taxes", label: "Tax", icon: Users },
  { path: "/dashboard/suppliers", label: "Suppliers", icon: ShoppingCart },
  { path: "/dashboard/customers", label: "Customers", icon: UserCheck },
  { path: "/dashboard/sales", label: "Sales", icon: Package },
  { path: "/dashboard/detailsales", label: "Detail Sales", icon: Receipt },
  { path: "/dashboard/sedes", label: "Sedes", icon: Building2 },
  { path: "/dashboard/inventory", label: "Inventario", icon: Percent },
  { path: "/dashboard/company", label: "Company", icon: Truck },
  { path: "/dashboard/categorias", label: "Categorías", icon: Tags },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-black to-gray-800 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">POS System</h1>
            <p className="text-xs text-gray-500">Punto de Venta</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
