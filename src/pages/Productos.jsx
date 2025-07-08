// src/app/Productos.jsx
"use client";

import { useEffect, useState } from "react";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getTaxes,
  getSuppliers, // Import getSuppliers
} from "../services/api";
import { Plus, Search, Edit, Trash2, Box, DollarSign, Truck } from "lucide-react"; // Added Truck icon for suppliers

export default function Productos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [availableTaxes, setAvailableTaxes] = useState([]);
  const [availableSuppliers, setAvailableSuppliers] = useState([]); // New state for available suppliers

  const initialFormState = {
    productName: "",
    productDescription: "",
    unitaryProductPrice: 0,
    productStock: 0,
    taxes: [], // Array of selected tax IDs (numbers)
    suppliers: [], // New: Array of selected supplier IDs (numbers)
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    cargarProductos();
    cargarImpuestosDisponibles();
    cargarProveedoresDisponibles(); // New: Load available suppliers
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await getProducts();
      const processedProducts = res.data.map(prod => ({
        ...prod,
        // Ensure numerical fields are parsed correctly, default to 0 if invalid
        unitaryProductPrice: parseFloat(prod.unitaryProductPrice) || 0,
        productStock: parseInt(prod.productStock, 10) || 0,
      }));
      setProducts(processedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const cargarImpuestosDisponibles = async () => {
    try {
      const res = await getTaxes();
      setAvailableTaxes(res.data);
    } catch (error) {
      console.error("Error cargando impuestos disponibles:", error);
    }
  };

  // New function to load available suppliers
  const cargarProveedoresDisponibles = async () => {
    try {
      const res = await getSuppliers(); // Call your getSuppliers API
      setAvailableSuppliers(res.data);
    } catch (error) {
      console.error("Error cargando proveedores disponibles:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For number inputs, convert value to a number. Use parseFloat for prices.
    const newValue = (name === "unitaryProductPrice" || name === "productStock")
      ? parseFloat(value) || 0 // Default to 0 if parsing fails
      : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleTaxSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.options).filter(option => option.selected);
    const selectedTaxIds = selectedOptions.map(option => parseInt(option.value, 10));
    setForm({ ...form, taxes: selectedTaxIds });
  };

  // New handler for supplier selection
  const handleSupplierSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.options).filter(option => option.selected);
    const selectedSupplierIds = selectedOptions.map(option => parseInt(option.value, 10));
    setForm({ ...form, suppliers: selectedSupplierIds });
  };

  const handleGuardar = async () => {
    try {
      const taxesForApi = form.taxes.map(taxId => ({ taxId }));
      // New: Transform the `suppliers` array from [id1, id2] to [{ supplierId: id1 }, { supplierId: id2 }]
      const suppliersForApi = form.suppliers.map(supplierId => ({ supplierId }));

      const productDataToSave = {
        ...form,
        taxes: taxesForApi,
        suppliers: suppliersForApi, // Add suppliers to the data sent to API
      };

      if (editingProduct) {
        await updateProduct(editingProduct.productId, productDataToSave);
      } else {
        await createProduct(productDataToSave);
      }
      setShowModal(false);
      setEditingProduct(null);
      setForm(initialFormState);
      cargarProductos();
    } catch (error) {
      console.error("Error guardando producto:", error);
      // More specific error handling could be implemented here
    }
  };

  const handleEditar = (prod) => {
    setEditingProduct(prod);
    setForm({
      productName: prod.productName,
      productDescription: prod.productDescription,
      unitaryProductPrice: parseFloat(prod.unitaryProductPrice) || 0, // Ensure number for editing
      productStock: parseInt(prod.productStock, 10) || 0, // Ensure number for editing
      taxes: prod.taxes ? prod.taxes.map(tax => tax.taxId) : [],
      // New: Map supplier objects back to just an array of IDs for the form's select
      suppliers: prod.suppliers ? prod.suppliers.map(supplier => supplier.supplierId) : [],
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteProduct(id);
        cargarProductos();
      } catch (error) {
        console.error("Error eliminando producto:", error);
      }
    }
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(initialFormState);
  };

  const filteredProducts = products.filter(
    (prod) =>
      prod.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.productDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-gray-600">Gestiona la información de tus productos</p>
        </div>
        <button
          onClick={handleAddProductClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-left">Precio Unitario</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Impuestos</th>
              <th className="px-4 py-2 text-left">Proveedores</th> {/* New Column */}
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((prod) => (
              <tr key={prod.productId}>
                <td className="px-4 py-2 flex items-center gap-2">
                  <Box className="h-5 w-5 text-gray-500" />
                  <div className="font-medium">{prod.productName}</div>
                </td>
                <td className="px-4 py-2">{prod.productDescription}</td>
                <td className="px-4 py-2">
                  <DollarSign className="inline-block h-4 w-4 text-gray-500 mr-1" />
                  {/* Safely display price, ensuring it's a number */}
                  {typeof prod.unitaryProductPrice === 'number'
                    ? prod.unitaryProductPrice.toFixed(2)
                    : parseFloat(prod.unitaryProductPrice)?.toFixed(2) || 'N/A'}
                </td>
                <td className="px-4 py-2">{prod.productStock}</td>
                <td className="px-4 py-2">
                  {prod.taxes && prod.taxes.length > 0
                    ? prod.taxes.map(tax => tax.taxName).join(", ")
                    : "N/A"}
                </td>
                <td className="px-4 py-2"> {/* New: Display Suppliers */}
                  {prod.suppliers && prod.suppliers.length > 0
                    ? prod.suppliers.map(supplier => supplier.supplierName).join(", ")
                    : "N/A"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEditar(prod)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(prod.productId)}
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

      {/* Modal for adding/editing a product */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h3>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input
                  id="productName"
                  name="productName"
                  value={form.productName}
                  onChange={handleInputChange}
                  placeholder="Ej: Arroz Diana 1kg"
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Product Description */}
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={form.productDescription}
                  onChange={handleInputChange}
                  placeholder="Ej: Paquete de arroz blanco tradicional de 1 kilogramo"
                  className="w-full border p-2 rounded resize-y"
                  rows="3"
                ></textarea>
              </div>

              {/* Unitary Product Price */}
              <div>
                <label htmlFor="unitaryProductPrice" className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label>
                <input
                  id="unitaryProductPrice"
                  name="unitaryProductPrice"
                  value={form.unitaryProductPrice}
                  onChange={handleInputChange}
                  placeholder="Ej: 3200.00"
                  type="number"
                  step="0.01"
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Product Stock */}
              <div>
                <label htmlFor="productStock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  id="productStock"
                  name="productStock"
                  value={form.productStock}
                  onChange={handleInputChange}
                  placeholder="Ej: 100"
                  type="number"
                  step="1"
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Taxes Selection */}
              <div>
                <label htmlFor="taxes" className="block text-sm font-medium text-gray-700 mb-1">Impuestos Aplicables</label>
                <select
                  id="taxes"
                  name="taxes"
                  multiple
                  value={form.taxes}
                  onChange={handleTaxSelectionChange}
                  className="w-full border p-2 rounded h-32"
                >
                  {availableTaxes.map(tax => (
                    <option key={tax.taxId} value={tax.taxId}>
                      {tax.taxName} ({tax.taxPercentage}%)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Mantén "Ctrl" (Windows) o "Cmd" (Mac) presionado para seleccionar múltiples impuestos.</p>
              </div>

              {/* New: Suppliers Selection */}
              <div>
                <label htmlFor="suppliers" className="block text-sm font-medium text-gray-700 mb-1">Proveedores</label>
                <select
                  id="suppliers"
                  name="suppliers"
                  multiple
                  value={form.suppliers}
                  onChange={handleSupplierSelectionChange}
                  className="w-full border p-2 rounded h-32"
                >
                  {availableSuppliers.map(supplier => (
                    <option key={supplier.supplierId} value={supplier.supplierId}>
                      {supplier.supplierName} ({supplier.supplierNit})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Mantén "Ctrl" (Windows) o "Cmd" (Mac) presionado para seleccionar múltiples proveedores.</p>
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