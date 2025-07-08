import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import DashboardLayout from "./layouts/DashboardLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardHome from "./pages/DashboardHome"
import Tax from "./pages/Tax"
import Roles from "./pages/Roles"
import Supplier from "./pages/Supplier"
import Empleados from "./pages/Empleados"
import Productos from "./pages/Productos"
import Categorias from "./pages/Categorias"
import Ordenes from "./pages/Ordenes"
import Company from "./pages/Company"
import Sedes from "./pages/Sedes"
import Impuestos from "./pages/Impuestos"
import DetalleVenta from "./pages/DetalleVenta"
import Usuarios from "./pages/Usuarios" 
import Customers from "./pages/Customers"
import Sale from "./pages/Sale"


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<DashboardHome />} />
          <Route path="taxes" element={<Tax />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="roles" element={<Roles />} />
          <Route path="suppliers" element={<Supplier />} />
          <Route path="productos" element={<Productos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="customers" element={<Customers />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="sales" element={<Sale />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="detailsales" element={<DetalleVenta />} />
          <Route path="company" element={<Company />} />
          <Route path="sedes" element={<Sedes />} />
          <Route path="impuestos" element={<Impuestos />} />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
