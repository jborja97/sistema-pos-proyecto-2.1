import { useEffect, useState } from "react";
import {
  getCompanies,
  createCompany,
} from "../services/api";

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState({
    companyName: "",
    companyNit: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
  });

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      const { data } = await getCompanies();
      setEmpresas(data);
    } catch (error) {
      console.error("Error al cargar empresas", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaEmpresa({ ...nuevaEmpresa, [name]: value });
  };

  const guardarEmpresa = async () => {
    try {
      await createCompany(nuevaEmpresa);
      setModalVisible(false);
      setNuevaEmpresa({
        companyName: "",
        companyNit: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
      });
      cargarEmpresas();
    } catch (error) {
      console.error("Error al crear empresa", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Empresas</h2>

      <button
        onClick={() => setModalVisible(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
      >
        Agregar Empresa
      </button>

      <table className="w-full border table-auto">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">NIT</th>
            <th className="border p-2">Dirección</th>
            <th className="border p-2">Teléfono</th>
            <th className="border p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((empresa, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">{empresa.companyId}</td>
              <td className="border p-2">{empresa.companyName}</td>
              <td className="border p-2">{empresa.companyNit}</td>
              <td className="border p-2">{empresa.companyAddress}</td>
              <td className="border p-2">{empresa.companyPhone}</td>
              <td className="border p-2">{empresa.companyEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Agregar Empresa</h3>

            <input
              name="companyName"
              placeholder="Nombre"
              value={nuevaEmpresa.companyName}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              name="companyNit"
              placeholder="NIT"
              value={nuevaEmpresa.companyNit}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              name="companyAddress"
              placeholder="Dirección"
              value={nuevaEmpresa.companyAddress}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              name="companyPhone"
              placeholder="Teléfono"
              value={nuevaEmpresa.companyPhone}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              name="companyEmail"
              placeholder="Correo electrónico"
              type="email"
              value={nuevaEmpresa.companyEmail}
              onChange={handleInputChange}
              className="w-full border p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEmpresa}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

