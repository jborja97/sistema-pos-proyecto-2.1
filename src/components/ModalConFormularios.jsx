"use client";

import { useEffect, useState } from "react";
import {
  createSale,
  getSales,
  updateSale,
  deleteSale,
  getSaleDetails,
  getProducts,
  createSaleDetail,
  deleteSaleDetail,
} from "../services/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CreditCard,
  Receipt,
  Eye,
  X,
  Trash,
} from "lucide-react";

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sales, setSales] = useState([]);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detallesVenta, setDetallesVenta] = useState([]);
  const [nuevoDetalle, setNuevoDetalle] = useState({ productoId: "", cantidad: "" });
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      const res = await getSales();
      const processedSales = res.data.map((sale) => ({
        ...sale,
        subtotalSale: parseFloat(sale.subtotalSale) || 0,
        totalTaxesSale: parseFloat(sale.totalTaxesSale) || 0,
        totalSale: parseFloat(sale.totalSale) || 0,
        saleDate: new Date(sale.saleDate).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      }));
      setSales(processedSales);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    }
  };

  const abrirDetalleVenta = async (venta) => {
    try {
      const [detallesRes, productosRes] = await Promise.all([
        getSaleDetails(),
        getProducts(),
      ]);
      const detalles = detallesRes.data.filter((d) => d.saleId === venta.saleId);
      setVentaSeleccionada(venta);
      setDetallesVenta(detalles);
      setProductos(productosRes.data);
      setDetalleVisible(true);
    } catch (err) {
      console.error("Error al cargar detalles:", err);
    }
  };

  const guardarDetalle = async () => {
    if (!nuevoDetalle.productoId || !nuevoDetalle.cantidad) {
      alert("Completa producto y cantidad");
      return;
    }
    await createSaleDetail({
      saleId: ventaSeleccionada.saleId,
      productId: nuevoDetalle.productoId,
      cantidad: parseInt(nuevoDetalle.cantidad),
    });
    const detallesActualizados = await getSaleDetails();
    setDetallesVenta(detallesActualizados.data.filter(d => d.saleId === ventaSeleccionada.saleId));
    setNuevoDetalle({ productoId: "", cantidad: "" });
  };

  const eliminarDetalle = async (detalleId) => {
    await deleteSaleDetail(detalleId);
    const detallesActualizados = await getSaleDetails();
    setDetallesVenta(detallesActualizados.data.filter(d => d.saleId === ventaSeleccionada.saleId));
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.saleId?.toString().includes(searchTerm) ||
      sale.saleDate?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-gray-600">Gestiona las ventas realizadas</p>
        </div>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar ventas por método de pago o ID..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left w-[120px]">ID Venta</th>
              <th className="px-4 py-2 text-left w-[150px]">Fecha</th>
              <th className="px-4 py-2 text-left w-[150px]">Subtotal</th>
              <th className="px-4 py-2 text-left w-[150px]">Impuestos</th>
              <th className="px-4 py-2 text-left w-[150px]">Total</th>
              <th className="px-4 py-2 text-left w-[200px]">Método de Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSales.map((sale) => (
              <tr key={sale.saleId}>
                <td className="px-4 py-2 flex items-center gap-2 truncate">
                  <Receipt className="h-5 w-5 text-gray-500" />
                  <div className="font-medium truncate">{sale.saleId}</div>
                </td>
                <td className="px-4 py-2">{sale.saleDate}</td>
                <td className="px-4 py-2">${sale.subtotalSale.toFixed(2)}</td>
                <td className="px-4 py-2">${sale.totalTaxesSale.toFixed(2)}</td>
                <td className="px-4 py-2 font-bold">${sale.totalSale.toFixed(2)}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  {sale.paymentMethod}
                  <button
                    onClick={() => abrirDetalleVenta(sale)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalleVisible && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setDetalleVisible(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-2">Detalle de Venta #{ventaSeleccionada.saleId}</h2>
            <p className="text-sm text-gray-600 mb-4">Total: ${ventaSeleccionada.totalSale.toFixed(2)}</p>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Productos vendidos:</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {detallesVenta.map((detalle, index) => {
                  const producto = productos.find((p) => p.id === detalle.productId);
                  return (
                    <li key={index} className="flex justify-between items-center">
                      <span>{producto?.productName || "Producto desconocido"} — Cantidad: {detalle.cantidad}</span>
                      <button
                        onClick={() => eliminarDetalle(detalle.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar detalle"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Agregar producto al detalle:</h3>
              <div className="flex gap-2 mb-3">
                <select
                  value={nuevoDetalle.productoId}
                  onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, productoId: e.target.value })}
                  className="flex-1 border p-2 rounded"
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName} — ${p.productPrice}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  value={nuevoDetalle.cantidad}
                  onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, cantidad: e.target.value })}
                  className="w-24 border p-2 rounded"
                />
              </div>
              <button
                onClick={guardarDetalle}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Guardar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
