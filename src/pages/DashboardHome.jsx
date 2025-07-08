import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react"

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center mt-2">
          {changeType === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${changeType === "up" ? "text-green-600" : "text-red-600"}`}>
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
        </div>
      </div>
      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

const RecentActivity = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
    <div className="space-y-4">
      {[
        { action: "Nueva venta registrada", time: "Hace 5 min", amount: "$125.50" },
        { action: "Producto agregado", time: "Hace 15 min", product: "Laptop Dell" },
        { action: "Cliente registrado", time: "Hace 30 min", customer: "Juan Pérez" },
        { action: "Venta completada", time: "Hace 1 hora", amount: "$89.99" },
      ].map((activity, index) => (
        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
          <div className="text-right">
            {activity.amount && <span className="text-sm font-semibold text-green-600">{activity.amount}</span>}
            {activity.product && <span className="text-sm text-gray-600">{activity.product}</span>}
            {activity.customer && <span className="text-sm text-gray-600">{activity.customer}</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const TopProducts = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
    <div className="space-y-4">
      {[
        { name: "Laptop HP", sales: 45, revenue: "$22,500" },
        { name: "Mouse Logitech", sales: 89, revenue: "$1,780" },
        { name: "Teclado Mecánico", sales: 34, revenue: "$3,400" },
        { name: "Monitor Samsung", sales: 28, revenue: "$8,400" },
      ].map((product, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">{product.sales} ventas</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-900">{product.revenue}</span>
        </div>
      ))}
    </div>
  </div>
)

export default function DashboardHome() {
  const stats = [
    {
      title: "Ventas Totales",
      value: "$12,426",
      change: "+12.5%",
      changeType: "up",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Órdenes",
      value: "1,245",
      change: "+8.2%",
      changeType: "up",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Productos",
      value: "856",
      change: "+3.1%",
      changeType: "up",
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Clientes",
      value: "2,341",
      change: "-2.4%",
      changeType: "down",
      icon: Users,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido de vuelta, aquí tienes un resumen de tu negocio</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar className="h-4 w-4 mr-2 inline" />
            Últimos 30 días
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            Ver Reportes
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Mes</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de ventas mensuales</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Productos</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de distribución</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <TopProducts />
      </div>
    </div>
  )
}
