// src/app/DetallesVenta.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  createSaleDetail,
  getSaleDetails,
  updateSaleDetail,
  deleteSaleDetail,
  getProducts, // To select products for the detail
} from "../services/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingCart, // For sale details
  Tag,          // For taxes
  DollarSign,   // For price
  Package,      // For product
} from "lucide-react";

export default function DetallesVenta() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saleDetails, setSaleDetails] = useState([]);
  const [editingSaleDetail, setEditingSaleDetail] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductData, setSelectedProductData] = useState(null); // Stores full product object for calculations

  const initialFormState = {
    amount: 0,
    unitaryPrice: 0,
    subtotal: 0,
    subtotalTaxes: 0,
    total: 0,
    productId: "", // Stores the ID of the selected product
    saleId: "defaultSaleId", // Placeholder: In a real app, this would come from a parent Sale component or a selection
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    cargarDetallesVenta();
    cargarProductosDisponibles();
  }, []);

  // --- Data Loading ---
  const cargarDetallesVenta = async () => {
    try {
      const res = await getSaleDetails();
      const customers = res.data.map((detail) => detail.sale?.customer.customerName || "Cliente Desconocido");
    
      setSaleDetails(res.data, customers);
    
    } catch (error) {
      console.error("Error cargando detalles de venta:", error);
    }
  };

  const cargarProductosDisponibles = async () => {
    try {
      const res = await getProducts();
      setAvailableProducts(res.data);
    } catch (error) {
      console.error("Error cargando productos disponibles:", error);
    }
  };

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For amount, ensure it's a number
    setForm({ ...form, [name]: name === "amount" ? parseInt(value, 10) || 0 : value });
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = availableProducts.find(p => p.productId === parseInt(productId, 10));

    setSelectedProductData(product); // Store the full product data
    setForm(prevForm => ({
      ...prevForm,
      productId: productId,
      unitaryPrice: product ? product.unitaryProductPrice : 0, // Update unitaryPrice from selected product
    }));
  };

  // --- Calculation Logic (Memoized for performance) ---
  const { subtotal, subtotalTaxes, total } = useMemo(() => {
    const amount = form.amount || 0;
    const unitaryPrice = form.unitaryPrice || 0;
    const currentProductTaxes = selectedProductData?.taxes || [];

    const calculatedSubtotal = amount * unitaryPrice;

    let calculatedSubtotalTaxes = 0;
    currentProductTaxes.forEach(tax => {
      calculatedSubtotalTaxes += calculatedSubtotal * (tax.taxPercentage / 100);
    });

    const calculatedTotal = calculatedSubtotal + calculatedSubtotalTaxes;

    return {
      subtotal: calculatedSubtotal,
      subtotalTaxes: calculatedSubtotalTaxes,
      total: calculatedTotal,
    };
  }, [form.amount, form.unitaryPrice, selectedProductData]);

  useEffect(() => {
    // Update form's calculated fields when dependencies change
    setForm(prevForm => ({
      ...prevForm,
      subtotal: subtotal,
      subtotalTaxes: subtotalTaxes,
      total: total,
    }));
  }, [subtotal, subtotalTaxes, total]);

  // --- CRUD Operations ---
  const handleGuardar = async () => {
    try {
      // Data to send to API, ensuring product and sale are linked by ID
      const dataToSave = {
        amount: form.amount,
        unitaryPrice: form.unitaryPrice,
        subtotal: subtotal,         // Use calculated values
        subtotalTaxes: subtotalTaxes,
        total: total,
        productId: parseInt(form.productId, 10), // Send only the product ID
        saleId: form.saleId,                     // Use saleId from form (placeholder)
      };

      if (editingSaleDetail) {
        await updateSaleDetail(editingSaleDetail.saleDetailId, dataToSave);
      } else {
        await createSaleDetail(dataToSave);
      }
      setShowModal(false);
      setEditingSaleDetail(null);
      setForm(initialFormState);
      setSelectedProductData(null); // Clear selected product data
      cargarDetallesVenta();
    } catch (error) {
      console.error("Error guardando detalle de venta:", error);
    }
  };

  const handleEditar = (detail) => {
    setEditingSaleDetail(detail);
    // Find the full product data for calculations when editing
    const product = availableProducts.find(p => p.productId === detail.product.productId);
    setSelectedProductData(product);

    setForm({
      amount: detail.amount,
      unitaryPrice: detail.unitaryPrice, // This should come from the product at the time of sale, or from the detail itself
      // The subtotal, subtotalTaxes, total fields might be re-calculated or pre-filled from detail.
      // For editing, it's safer to use the values saved with the detail, unless business logic dictates recalculation.
      subtotal: detail.subtotal,
      subtotalTaxes: detail.subtotalTaxes,
      total: detail.total,
      productId: detail.product ? detail.product.productId.toString() : "",
      saleId: detail.sale, // Assuming 'sale' in your schema is a string for the sale ID
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este detalle de venta?")) {
      try {
        await deleteSaleDetail(id);
        cargarDetallesVenta();
      } catch (error) {
        console.error("Error eliminando detalle de venta:", error);
      }
    }
  };

  const handleAddSaleDetailClick = () => {
    setEditingSaleDetail(null);
    setForm(initialFormState);
    setSelectedProductData(null); // Clear selected product data for new entry
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingSaleDetail(null);
    setForm(initialFormState);
    setSelectedProductData(null);
  };

  const filteredSaleDetails = saleDetails.filter(
    (detail) =>
      detail.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.sale?.toLowerCase().includes(searchTerm.toLowerCase()) || // Assuming sale is searchable
      detail.unitaryPrice.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detalles de Venta</h1>
          <p className="text-gray-600">Gestiona los ítems de tus ventas</p>
        </div>
        <button
          onClick={handleAddSaleDetailClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Detalle
        </button>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por producto o venta..."
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
              <th className="px-4 py-2 text-left w-[180px]">Producto</th>
              <th className="px-4 py-2 text-left w-[100px]">Cantidad</th>
              <th className="px-4 py-2 text-left w-[120px]">Precio Unitario</th>
              <th className="px-4 py-2 text-left w-[120px]">Subtotal</th>
              <th className="px-4 py-2 text-left w-[120px]">Impuestos</th>
              <th className="px-4 py-2 text-left w-[120px]">Total</th>
              <th className="px-4 py-2 text-left w-[120px]">Cliente</th>
              <th className="px-4 py-2 text-left w-[120px]">Venta ID</th>
              <th className="px-4 py-2 text-left w-[100px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSaleDetails.map((detail) => (
              <tr key={detail.saleDetailId}>
                <td className="px-4 py-2 flex items-center gap-2 truncate">
                  <Package className="h-5 w-5 text-gray-500" />
                  <div className="font-medium truncate">{detail.product?.productName || "Producto Desconocido"}</div>
                </td>
                <td className="px-4 py-2">{detail.amount}</td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {parseFloat(detail.unitaryPrice).toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {parseFloat(detail.subtotal).toFixed(2)}
                </td>
                
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {parseFloat(detail.subtotalTaxes).toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {parseFloat(detail.total).toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {detail.sale?.customer.customerIdentification || "Cliente Desconocido"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {parseInt(detail.sale?.saleId, 10) || "Venta Desconocida"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEditar(detail)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(detail.saleDetailId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding/editing a sale detail */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingSaleDetail ? "Editar Detalle de Venta" : "Nuevo Detalle de Venta"}
            </h3>

            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                <select
                  id="productId"
                  name="productId"
                  value={form.productId}
                  onChange={handleProductChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Selecciona un producto</option>
                  {availableProducts.map(product => (
                    <option key={product.productId} value={product.productId}>
                      {product.productName} (Stock: {product.productStock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  id="amount"
                  name="amount"
                  value={form.amount}
                  onChange={handleInputChange}
                  placeholder="Ej: 2"
                  type="number"
                  min="0"
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Unitary Price (Read-only, derived from product) */}
              <div>
                <label htmlFor="unitaryPrice" className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label>
                <input
                  id="unitaryPrice"
                  name="unitaryPrice"
                  value={form.unitaryPrice || (selectedProductData ? selectedProductData.unitaryProductPrice : 0)}
                  readOnly // This field is derived
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Calculated Fields (Display Only) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                  <input
                    value={subtotal.toFixed(2)}
                    readOnly
                    className="w-full border p-2 rounded bg-gray-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impuestos (Subtotal)</label>
                  <input
                    value={subtotalTaxes.toFixed(2)}
                    readOnly
                    className="w-full border p-2 rounded bg-gray-100 font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input
                    value={total.toFixed(2)}
                    readOnly
                    className="w-full border p-2 rounded bg-green-100 font-bold text-green-700 text-lg"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="saleId" className="block text-sm font-medium text-gray-700 mb-1">ID de Venta</label>
                <input
                  id="saleId"
                  name="saleId"
                  value={form.saleId}
                  onChange={handleInputChange}
                  placeholder="Ej: VENTA-001"
                  className="w-full border p-2 rounded"
                />
              </div>

            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
