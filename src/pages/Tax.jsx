"use client";

import { useEffect, useState } from "react";
import {
  createTax,
  getTaxes,
  updateTax,
  deleteTax,
} from "../services/api"; // Make sure the path is correct
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react"; // Using Tag icon for taxes

export default function Impuestos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [taxes, setTaxes] = useState([]); // State to hold the list of taxes
  const [editingTax, setEditingTax] = useState(null); // State to hold the tax being edited

  // Initial state for the tax form
  const initialFormState = {
    taxName: "",
    taxPercentage: "",
    taxDescription: "",
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    cargarImpuestos();
  }, []);

  const cargarImpuestos = async () => {
    try {
      const res = await getTaxes();
      setTaxes(res.data);
    } catch (error) {
      console.error("Error cargando impuestos:", error);
      // Handle error, e.g., show a toast message
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      if (editingTax) {
        await updateTax(editingTax.taxId, form);
      } else {
        await createTax(form);
      }
      setShowModal(false);
      setEditingTax(null);
      setForm(initialFormState); // Reset form after saving
      cargarImpuestos(); // Reload taxes to show updates
    } catch (error) {
      console.error("Error guardando impuesto:", error);
      // Handle error, e.g., show a toast message
    }
  };

  const handleEditar = (tax) => {
    setEditingTax(tax);
    setForm({
      taxName: tax.taxName,
      taxPercentage: tax.taxPercentage,
      taxDescription: tax.taxDescription,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este impuesto?")) {
      try {
        await deleteTax(id);
        cargarImpuestos();
      } catch (error) {
        console.error("Error eliminando impuesto:", error);
        // Handle error, e.g., show a toast message
      }
    }
  };

  // Function to open modal for adding a new tax
  const handleAddTaxClick = () => {
    setEditingTax(null); // Ensure no tax is being edited
    setForm(initialFormState); // Clear the form for a new entry
    setShowModal(true);
  };

  // Function to close modal and reset states
  const handleCancel = () => {
    setShowModal(false);
    setEditingTax(null);
    setForm(initialFormState); // Reset form on cancel
  };

  const filteredTaxes = taxes.filter(
    (tax) =>
      tax.taxName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.taxDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.taxPercentage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Impuestos</h1>
          <p className="text-gray-600">Gestiona la información de tus impuestos</p>
        </div>
        <button
          onClick={handleAddTaxClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Impuesto
        </button>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar impuestos..."
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
              <th className="px-4 py-2 text-left">Nombre del Impuesto</th>
              <th className="px-4 py-2 text-left">Porcentaje</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTaxes.map((tax) => (
              <tr key={tax.taxId}>
                <td className="px-4 py-2 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                  <div className="font-medium">{tax.taxName}</div>
                </td>
                <td className="px-4 py-2">{tax.taxPercentage}%</td>
                <td className="px-4 py-2">{tax.taxDescription}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEditar(tax)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(tax.taxId)}
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

      {/* Modal for adding/editing a tax */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingTax ? "Editar Impuesto" : "Nuevo Impuesto"}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="taxName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Impuesto</label>
                <input
                  id="taxName"
                  name="taxName"
                  value={form.taxName}
                  onChange={handleInputChange}
                  placeholder="Ej: IVA"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label htmlFor="taxPercentage" className="block text-sm font-medium text-gray-700 mb-1">Porcentaje</label>
                <input
                  id="taxPercentage"
                  name="taxPercentage"
                  value={form.taxPercentage}
                  onChange={handleInputChange}
                  placeholder="Ej: 19.00"
                  type="number" // Use type="number" for percentages
                  step="0.01" // Allow decimal values
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label htmlFor="taxDescription" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  id="taxDescription"
                  name="taxDescription"
                  value={form.taxDescription}
                  onChange={handleInputChange}
                  placeholder="Ej: Impuesto al Valor Agregado estándar"
                  className="w-full border p-2 rounded resize-y" // Add resize-y for vertical resizing
                  rows="3"
                ></textarea>
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