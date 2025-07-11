// src/app/Productos.jsx
"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getTaxes,
  getSuppliers,
} from "../services/api";
import { Plus, Search, Edit, Trash2, Box, DollarSign } from "lucide-react";

export default function Productos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [availableTaxes, setAvailableTaxes] = useState([]);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Cambia este valor si quieres más/menos productos por página

  const initialFormState = {
    productName: "",
    productDescription: "",
    unitaryProductPrice: "",
    productStock: 0,
    taxes: [],
    suppliers: [],
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    cargarProductos();
    cargarImpuestosDisponibles();
    cargarProveedoresDisponibles();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reinicia a la página 1 al buscar o cambiar productos
  }, [searchTerm, products]);

  const cargarProductos = async () => {
    try {
      const res = await getProducts();
      const processedProducts = res.data.map((prod) => ({
        ...prod,
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

  const cargarProveedoresDisponibles = async () => {
    try {
      const res = await getSuppliers();
      setAvailableSuppliers(res.data);
    } catch (error) {
      console.error("Error cargando proveedores disponibles:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "unitaryProductPrice" || name === "productStock"
        ? parseFloat(value) || ""
        : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleGuardar = async () => {
    if (!form.productName.trim()) {
      alert("El nombre del producto es obligatorio.");
      return;
    }
    if (form.unitaryProductPrice <= 0) {
      alert("El precio unitario debe ser mayor a 0.");
      return;
    }
    if (form.productStock < 0) {
      alert("El stock no puede ser negativo.");
      return;
    }
    if (form.taxes.length === 0) {
      alert("Debes seleccionar al menos un impuesto.");
      return;
    }
    if (form.suppliers.length === 0) {
      alert("Debes seleccionar al menos un proveedor.");
      return;
    }
    try {
      const taxesForApi = form.taxes.map((taxId) => ({ taxId }));
      const suppliersForApi = form.suppliers.map((supplierId) => ({
        supplierId,
      }));
      const productDataToSave = {
        ...form,
        taxes: taxesForApi,
        suppliers: suppliersForApi,
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
      setMensajeExito("✅ Producto guardado correctamente");
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (error) {
      console.error("Error guardando producto:", error);
    }
  };

  const handleEditar = (prod) => {
    setEditingProduct(prod);
    setForm({
      productName: prod.productName,
      productDescription: prod.productDescription,
      unitaryProductPrice: parseFloat(prod.unitaryProductPrice) || 0,
      productStock: parseInt(prod.productStock, 10) || 0,
      taxes: prod.taxes ? prod.taxes.map((tax) => tax.taxId) : [],
      suppliers: prod.suppliers
        ? prod.suppliers.map((supplier) => supplier.supplierId)
        : [],
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
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

  // Filtro de búsqueda
  const filteredProducts = products.filter(
    (prod) =>
      prod.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.productDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-gray-600">
            Gestiona la información de tus productos
          </p>
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
              <th className="px-4 py-2 text-left">Proveedores</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  No hay productos para mostrar.
                </td>
              </tr>
            ) : (
              currentProducts.map((prod) => (
                <tr key={prod.productId}>
                  <td className="px-4 py-2 flex items-center gap-2 truncate">
                    <Box className="h-5 w-5 text-gray-500" />
                    <div className="font-medium">{prod.productName}</div>
                  </td>
                  <td className="px-4 py-2">{prod.productDescription}</td>
                  <td className="px-4 py-2 flex items-center gap-2 truncate">
                    <DollarSign className=" h-5 w-5 text-gray-500" />
                    {typeof prod.unitaryProductPrice === "number"
                      ? new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(prod.unitaryProductPrice)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2">{prod.productStock}</td>
                  <td className="px-4 py-2">
                    {prod.taxes && prod.taxes.length > 0
                      ? prod.taxes.map((tax) => tax.taxName).join(", ")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {prod.suppliers && prod.suppliers.length > 0
                      ? prod.suppliers
                          .map((supplier) => supplier.supplierName)
                          .join(", ")
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal para agregar/editar producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del producto */}
              <div>
                <label
                  htmlFor="productName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre del Producto
                </label>
                <input
                  id="productName"
                  name="productName"
                  value={form.productName}
                  onChange={handleInputChange}
                  placeholder="Ej: Arroz Diana 1kg"
                  className="w-full border p-2 rounded"
                />
              </div>
              {/* Precio unitario */}
              <div>
                <label
                  htmlFor="unitaryProductPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Precio Unitario
                </label>
                <input
                  id="unitaryProductPrice"
                  name="unitaryProductPrice"
                  value={form.unitaryProductPrice}
                  onChange={handleInputChange}
                  placeholder="Ej: $3.200"
                  type="number"
                  step="0.01"
                  className="w-full border p-2 rounded"
                />
              </div>
              {/* Descripción del producto */}
              <div className="md:col-span-2">
                <label
                  htmlFor="productDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={form.productDescription}
                  onChange={handleInputChange}
                  placeholder="Ej: Paquete de arroz blanco tradicional de 1 kilogramo"
                  className="w-full border p-2 rounded resize-y"
                  rows="2"
                ></textarea>
              </div>
              {/* Stock */}
              <div>
                <label
                  htmlFor="productStock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock
                </label>
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
              {/* Impuestos */}
              <div>
                <label
                  htmlFor="taxes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Impuestos Aplicables
                </label>
                <Select
                  isMulti
                  id="taxes"
                  name="taxes"
                  className="text-sm"
                  options={availableTaxes.map((tax) => ({
                    value: tax.taxId,
                    label: `${tax.taxName} (${tax.taxPercentage}%)`,
                  }))}
                  value={availableTaxes
                    .filter((tax) => form.taxes.includes(tax.taxId))
                    .map((tax) => ({
                      value: tax.taxId,
                      label: `${tax.taxName} (${tax.taxPercentage}%)`,
                    }))}
                  onChange={(selectedOptions) => {
                    const selectedTaxIds = selectedOptions.map(
                      (option) => option.value
                    );
                    setForm({ ...form, taxes: selectedTaxIds });
                  }}
                />
              </div>
              {/* Proveedores */}
              <div className="md:col-span-2">
                <label
                  htmlFor="suppliers"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Proveedores
                </label>
                <Select
                  isMulti
                  id="suppliers"
                  name="suppliers"
                  className="text-sm"
                  options={availableSuppliers.map((supplier) => ({
                    value: supplier.supplierId,
                    label: `${supplier.supplierName} (${supplier.supplierNit})`,
                  }))}
                  value={availableSuppliers
                    .filter((sup) => form.suppliers.includes(sup.supplierId))
                    .map((sup) => ({
                      value: sup.supplierId,
                      label: `${sup.supplierName} (${sup.supplierNit})`,
                    }))}
                  onChange={(selectedOptions) => {
                    const selectedSupplierIds = selectedOptions.map(
                      (option) => option.value
                    );
                    setForm({ ...form, suppliers: selectedSupplierIds });
                  }}
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
      {mensajeExito && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm animate-fade-in">
          {mensajeExito}
        </div>
      )}
    </div>
  );
}
