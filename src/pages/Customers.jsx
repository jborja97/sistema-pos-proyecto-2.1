"use client";

import { useEffect, useState } from "react";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../services/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileDown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const initialFormState = {
    customerName: "",
    customerIdentification: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (error) {
      toast.error("Error cargando clientes");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.customerId, form);
        toast.success("Cliente actualizado");
      } else {
        await createCustomer(form);
        toast.success("Cliente creado");
      }
      setShowModal(false);
      setEditingCustomer(null);
      setForm(initialFormState);
      cargarClientes();
    } catch (error) {
      toast.error("Error guardando cliente");
    }
  };

  const handleEditar = (customer) => {
    setEditingCustomer(customer);
    setForm({
      customerName: customer.customerName,
      customerIdentification: customer.customerIdentification,
      customerEmail: customer.customerEmail,
      customerPhone: customer.customerPhone,
      customerAddress: customer.customerAddress,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await deleteCustomer(id);
        toast.success("Cliente eliminado");
        cargarClientes();
      } catch (error) {
        toast.error("Error eliminando cliente");
      }
    }
  };

  const handleAddCustomerClick = () => {
    setEditingCustomer(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setForm(initialFormState);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCustomers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "clientes.xlsx");
  };

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.customerName,
      customer.customerIdentification,
      customer.customerEmail,
      customer.customerPhone,
      customer.customerAddress,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-600">
            Gestiona la información de tus clientes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <FileDown className="h-4 w-4" />
            Exportar Excel
          </button>
          <button
            onClick={handleAddCustomerClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset page when searching
            }}
          />
        </div>
      </div>

      <div className="bg-white max-w-full max-h-[500px] overflow-auto border rounded-lg shadow" >
        <table className="min-w-[800px] table-auto border-collapse w-full">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="border p-2">Cliente</th>
              <th className="border p-2">Identificación</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Teléfono</th>
              <th className="border p-2">Dirección</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              currentCustomers.map((customer, index) => (
                <tr
                  key={customer.customerId}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="border p-2">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-500 w-4 h-4" />
                      {customer.customerName}
                    </div>
                  </td>

                  <td className="border  p-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-gray-500 w-4 h-4" />
                      {customer.customerIdentification}
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-500 w-4 h-4" />
                      {customer.customerEmail}
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-500 w-4 h-4" />
                      {customer.customerPhone}
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-gray-500 w-4 h-4" />
                      {customer.customerAddress}
                    </div>
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEditar(customer)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(customer.customerId)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>

            <div className="space-y-4">
              {[
                {
                  label: "Nombre Completo",
                  name: "customerName",
                  placeholder: "Ej: María Ríos",
                },
                {
                  label: "Identificación",
                  name: "customerIdentification",
                  placeholder: "Ej: 12345678",
                },
                {
                  label: "Email",
                  name: "customerEmail",
                  placeholder: "Ej: maria@gmail.com",
                  type: "email",
                },
                {
                  label: "Teléfono",
                  name: "customerPhone",
                  placeholder: "Ej: +57 300 4567890",
                  type: "tel",
                },
              ].map(({ label, name, placeholder, type = "text" }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    type={type}
                    className="w-full border p-2 rounded"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  name="customerAddress"
                  value={form.customerAddress}
                  onChange={handleInputChange}
                  placeholder="Ej: Cra 10 #45-23"
                  className="w-full border p-2 rounded resize-y"
                  rows="2"
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
