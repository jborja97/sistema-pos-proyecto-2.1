"use client";

import { useEffect, useState } from "react";
import { createSale, getSales, updateSale, deleteSale } from "../services/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CreditCard,
  Receipt,
} from "lucide-react";

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [editingSale, setEditingSale] = useState(null);

  const initialFormState = {
    saleDate: new Date().toISOString().split("T")[0],
    subtotalSale: 0,
    totalTaxesSale: 0,
    totalSale: 0,
    paymentMethod: "",
  };

  const [form, setForm] = useState(initialFormState);

  const paymentMethods = ["CASH", "CARD", "TRANSFER", "OTHER"];

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

        saleDateForInput: sale.saleDate
          ? new Date(sale.saleDate).toISOString().split("T")[0]
          : "",
      }));
      setSales(processedSales);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const newValue =
      name === "subtotalSale" ||
      name === "totalTaxesSale" ||
      name === "totalSale"
        ? parseFloat(value) || 0
        : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleGuardar = async () => {
    try {
      const saleDataToSave = {
        ...form,
        saleDate: new Date(form.saleDate).toISOString(),
      };

      if (editingSale) {
        await updateSale(editingSale.saleId, saleDataToSave);
      } else {
        await createSale(saleDataToSave);
      }
      setShowModal(false);
      setEditingSale(null);
      setForm(initialFormState);
      cargarVentas();
    } catch (error) {
      console.error("Error guardando venta:", error);
    }
  };

  const handleAddSaleClick = () => {
    setEditingSale(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingSale(null);
    setForm(initialFormState);
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

      {/* Table with horizontal scroll */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-100">
            <tr>
              {/* Define column widths. Adjust as necessary. */}
              <th className="px-4 py-2 text-left w-[120px]">ID Venta</th>
              <th className="px-4 py-2 text-left w-[150px]">Fecha</th>
              <th className="px-4 py-2 text-left w-[150px]">Subtotal</th>
              <th className="px-4 py-2 text-left w-[150px]">Impuestos</th>
              <th className="px-4 py-2 text-left w-[150px]">Total</th>
              <th className="px-4 py-2 text-left w-[150px]">Método de Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSales.map((sale) => (
              <tr key={sale.saleId}>
                <td className="px-4 py-2 flex items-center gap-2 truncate">
                  <Receipt className="h-5 w-5 text-gray-500" />
                  <div className="font-medium truncate">{sale.saleId}</div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <Calendar className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {sale.saleDate}
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {sale.subtotalSale.toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {sale.totalTaxesSale.toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-bold">{sale.totalSale.toFixed(2)}</span>
                </td>
                <td className="px-4 py-2 flex items-center gap-1 truncate">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  {sale.paymentMethod}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
