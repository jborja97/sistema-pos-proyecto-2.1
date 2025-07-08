// src/app/Proveedores.jsx
"use client";

import { useEffect, useState } from "react";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  getHeadquarters,
  getProducts,
} from "../services/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Truck,
  Building,
  Box,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";

export default function Proveedores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [availableHeadquarters, setAvailableHeadquarters] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  const initialFormState = {
    supplierName: "",
    supplierNit: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierAddress: "",
    headquarters: [],
    products: [],
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    cargarProveedores();
    cargarSedesDisponibles();
    cargarProductosDisponibles();
  }, []);

  const cargarProveedores = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      // Handle error, e.g., show a toast message
    }
  };

  const cargarSedesDisponibles = async () => {
    try {
      const res = await getHeadquarters();
      setAvailableHeadquarters(res.data);
    } catch (error) {
      console.error("Error cargando sedes disponibles:", error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleHeadquarterSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.options).filter(option => option.selected);
    const selectedHeadquarterIds = selectedOptions.map(option => parseInt(option.value, 10));
    setForm({ ...form, headquarters: selectedHeadquarterIds });
  };

  const handleProductSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.options).filter(option => option.selected);
    const selectedProductIds = selectedOptions.map(option => parseInt(option.value, 10));
    setForm({ ...form, products: selectedProductIds });
  };

  const handleGuardar = async () => {
    try {
      // Transform selected IDs into the API's expected object format
      const headquartersForApi = form.headquarters.map(headquarterId => ({ headquarterId }));
      const productsForApi = form.products.map(productId => ({ productId }));

      const supplierDataToSave = {
        ...form,
        headquarters: headquartersForApi,
        products: productsForApi,
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.supplierId, supplierDataToSave);
      } else {
        await createSupplier(supplierDataToSave);
      }
      setShowModal(false);
      setEditingSupplier(null);
      setForm(initialFormState); // Reset form after saving
      cargarProveedores(); // Reload suppliers to show updates
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      // More specific error handling could be implemented here
    }
  };

  const handleEditar = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      supplierName: supplier.supplierName,
      supplierNit: supplier.supplierNit,
      supplierPhone: supplier.supplierPhone,
      supplierEmail: supplier.supplierEmail,
      supplierAddress: supplier.supplierAddress,
      // Map relationship objects back to arrays of IDs for form pre-selection
      headquarters: supplier.headquarters ? supplier.headquarters.map(hq => hq.headquarterId) : [],
      products: supplier.products ? supplier.products.map(prod => prod.productId) : [],
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
      try {
        await deleteSupplier(id);
        cargarProveedores();
      } catch (error) {
        console.error("Error eliminando proveedor:", error);
      }
    }
  };

  const handleAddSupplierClick = () => {
    setEditingSupplier(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setForm(initialFormState);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplierNit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplierEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplierPhone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-gray-600">Gestiona la información de tus proveedores</p>
        </div>
        <button
          onClick={handleAddSupplierClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Added overflow-x-auto to this div to make the table scroll horizontally */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-100">
            <tr>
              {/* Assign fixed or proportional widths. The total width will dictate scroll. */}
              <th className="px-4 py-2 text-left w-[180px]">Proveedor</th> {/* Example: Fixed width */}
              <th className="px-4 py-2 text-left w-[120px]">NIT</th>
              <th className="px-4 py-2 text-left w-[140px]">Teléfono</th>
              <th className="px-4 py-2 text-left w-[200px]">Email</th>
              <th className="px-4 py-2 text-left w-[250px]">Dirección</th>
              <th className="px-4 py-2 text-left w-[180px]">Sedes Asociadas</th>
              <th className="px-4 py-2 text-left w-[220px]">Productos Suministrados</th>
              <th className="px-4 py-2 text-left w-[100px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.supplierId}>
                <td className="px-4 py-2 flex items-center gap-2 truncate">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <div className="font-medium truncate">{supplier.supplierName}</div>
                </td>
                <td className="px-4 py-2 truncate">{supplier.supplierNit}</td>
                <td className="px-4 py-2 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {supplier.supplierPhone}
                </td>
                <td className="px-4 py-2 flex items-center gap-1 truncate">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {supplier.supplierEmail}
                </td>
                <td className="px-4 py-2 flex items-center gap-1 truncate">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {supplier.supplierAddress}
                </td>
                <td className="px-4 py-2 truncate">
                  {supplier.headquarters && supplier.headquarters.length > 0
                    ? supplier.headquarters.map(hq => hq.headquarterName).join(", ")
                    : "N/A"}
                </td>
                <td className="px-4 py-2 truncate">
                  {supplier.products && supplier.products.length > 0
                    ? supplier.products.map(prod => prod.productName).join(", ")
                    : "N/A"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEditar(supplier)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(supplier.supplierId)}
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

      {/* Modal for adding/editing a supplier (remains the same) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor</label>
                <input
                  id="supplierName"
                  name="supplierName"
                  value={form.supplierName}
                  onChange={handleInputChange}
                  placeholder="Ej: Distribuidora ABC"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label htmlFor="supplierNit" className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                <input
                  id="supplierNit"
                  name="supplierNit"
                  value={form.supplierNit}
                  onChange={handleInputChange}
                  placeholder="Ej: 900123456-7"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label htmlFor="supplierPhone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  id="supplierPhone"
                  name="supplierPhone"
                  value={form.supplierPhone}
                  onChange={handleInputChange}
                  placeholder="Ej: +57 310 1234567"
                  type="tel"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label htmlFor="supplierEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="supplierEmail"
                  name="supplierEmail"
                  value={form.supplierEmail}
                  onChange={handleInputChange}
                  placeholder="Ej: info@ejemplo.com"
                  type="email"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label htmlFor="supplierAddress" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea
                  id="supplierAddress"
                  name="supplierAddress"
                  value={form.supplierAddress}
                  onChange={handleInputChange}
                  placeholder="Ej: Calle 10 #20-30, Ciudad"
                  className="w-full border p-2 rounded resize-y"
                  rows="2"
                ></textarea>
              </div>

              <div>
                <label htmlFor="headquarters" className="block text-sm font-medium text-gray-700 mb-1">Sedes Asociadas</label>
                <select
                  id="headquarters"
                  name="headquarters"
                  multiple
                  value={form.headquarters}
                  onChange={handleHeadquarterSelectionChange}
                  className="w-full border p-2 rounded h-32"
                >
                  {availableHeadquarters.map(hq => (
                    <option key={hq.headquarterId} value={hq.headquarterId}>
                      {hq.headquarterName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Mantén "Ctrl" (Windows) o "Cmd" (Mac) presionado para seleccionar múltiples sedes.</p>
              </div>

              <div>
                <label htmlFor="products" className="block text-sm font-medium text-gray-700 mb-1">Productos Suministrados</label>
                <select
                  id="products"
                  name="products"
                  multiple
                  value={form.products}
                  onChange={handleProductSelectionChange}
                  className="w-full border p-2 rounded h-32"
                >
                  {availableProducts.map(prod => (
                    <option key={prod.productId} value={prod.productId}>
                      {prod.productName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Mantén "Ctrl" (Windows) o "Cmd" (Mac) presionado para seleccionar múltiples productos.</p>
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