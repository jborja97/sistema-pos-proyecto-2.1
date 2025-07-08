"use client";

import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/api"; 
import { Plus, Search, Edit, Trash2, User } from "lucide-react";

export default function Empleados() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const initialFormState = {
    employeeName: "",
    employeeLastName: "",
    employeeIdentification: "",
    employeeEmail: "",
  };

  const [form, setForm] = useState(initialFormState); 

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const res = await getEmployees();
      setEmpleados(res.data);
    } catch (error) {
      console.error("Error cargando empleados:", error);
      
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.employeeId, form);
      } else {
        await createEmployee(form);
      }
      setShowModal(false);
      setEditingEmployee(null);
      setForm(initialFormState); 
      cargarEmpleados();
    } catch (error) {
      console.error("Error guardando empleado:", error);
      
    }
  };

  const handleEditar = (emp) => {
    setEditingEmployee(emp);
    setForm({
      employeeName: emp.employeeName,
      employeeLastName: emp.employeeLastName,
      employeeIdentification: emp.employeeIdentification,
      employeeEmail: emp.employeeEmail,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar a este empleado?")) {
      try {
        await deleteEmployee(id);
        cargarEmpleados();
      } catch (error) {
        console.error("Error eliminando empleado:", error);
        
      }
    }
  };

  const handleAddEmployeeClick = () => {
    setEditingEmployee(null); 
    setForm(initialFormState); 
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setForm(initialFormState); 
  };

  const filteredEmpleados = empleados.filter(
    (emp) =>
      emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeIdentification
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empleados</h1>
          <p className="text-gray-600">
            Gestiona la información de tus empleados
          </p>
        </div>
        <button
          onClick={handleAddEmployeeClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Empleado
        </button>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar empleados..."
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
              <th className="px-4 py-2 text-left">Empleado</th>
              <th className="px-4 py-2 text-left">Correo</th>
              <th className="px-4 py-2 text-left">Identificación</th>
              <th className="px-4 py-2 text-left">Sede</th> 
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredEmpleados.map((emp) => (
              <tr key={emp.employeeId}>
                <td className="px-4 py-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">
                      {emp.employeeName} {emp.employeeLastName}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">{emp.employeeEmail}</td>
                <td className="px-4 py-2">{emp.employeeIdentification}</td>
                <td className="px-4 py-2">{emp.headquarter?.headquarterName}</td>

                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEditar(emp)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(emp.employeeId)}
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

     {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  id="employeeName"
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label htmlFor="employeeLastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  id="employeeLastName"
                  name="employeeLastName"
                  value={form.employeeLastName}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label htmlFor="employeeIdentification" className="block text-sm font-medium text-gray-700 mb-1">Identificación</label>
                <input
                  id="employeeIdentification"
                  name="employeeIdentification"
                  value={form.employeeIdentification}
                  onChange={handleInputChange}
                  placeholder="Identificación"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label htmlFor="employeeEmail" className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input
                  id="employeeEmail"
                  name="employeeEmail"
                  value={form.employeeEmail}
                  onChange={handleInputChange}
                  placeholder="Correo"
                  type="email"
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