
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
} from "lucide-react";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]); 
  const [editingCustomer, setEditingCustomer] = useState(null); 

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
      console.error("Error cargando clientes:", error);
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
      } else {
        await createCustomer(form);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setForm(initialFormState);
      cargarClientes(); 
    } catch (error) {
      console.error("Error guardando cliente:", error);
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
        cargarClientes();
      } catch (error) {
        console.error("Error eliminando cliente:", error);
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

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerIdentification
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.customerEmail
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.customerPhone
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-600">
            Gestiona la información de tus clientes
          </p>
        </div>
        <button
          onClick={handleAddCustomerClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="min-w-full ">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left w-[120px]">Cliente</th>
              <th className="px-4 py-2 text-left w-[120px]">Identificación</th>
              <th className="px-4 py-2 text-left w-[120px]">Email</th>
              <th className="px-4 py-2 text-left w-[120px]">Teléfono</th>
              <th className="px-4 py-2 text-left w-[120px]">Dirección</th>
              <th className="px-4 py-2 text-left w-[120px]">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y ">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.customerId}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    <User className="h-5 w-5 text-gray-500" />
                    {customer.customerName}
                  </td>

                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    {customer.customerIdentification}
                  </td>

                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {customer.customerEmail}
                  </td>

                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {customer.customerPhone}
                  </td>

                <td className="px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {customer.customerAddress}
                  </td>

                  <td className="px-4 py-2 space-x-2">
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre Completo
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleInputChange}
                  placeholder="Ej: María Fernanda Ríos"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label
                  htmlFor="customerIdentification"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Identificación
                </label>
                <input
                  id="customerIdentification"
                  name="customerIdentification"
                  value={form.customerIdentification}
                  onChange={handleInputChange}
                  placeholder="Ej: 1032456789"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label
                  htmlFor="customerEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleInputChange}
                  placeholder="Ej: maria.rios@gmail.com"
                  type="email"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label
                  htmlFor="customerPhone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Teléfono
                </label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Ej: +57 300 4567890"
                  type="tel"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label
                  htmlFor="customerAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Dirección
                </label>
                <textarea
                  id="customerAddress"
                  name="customerAddress"
                  value={form.customerAddress}
                  onChange={handleInputChange}
                  placeholder="Ej: Cra 10 #45-23, Bogotá"
                  className="w-full border p-2 rounded resize-y"
                  rows="2"
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
