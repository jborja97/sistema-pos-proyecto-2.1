import React, { useEffect, useState } from "react";
import { getHeadquarters, createHeadquarter, getCompanies } from "../services/api";

export const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaSede, setNuevaSede] = useState({
    headquarterName: "",
    headquarterCity: "",
    headquarterAddress: "",
    headquarterPhone: "",
    company: { companyId: 0 },
  });

  useEffect(() => {
    cargarSedes();
    cargarEmpresas();
  }, []);

  const cargarSedes = async () => {
    try {
      const response = await getHeadquarters();
      setSedes(response.data);
    } catch (error) {
      console.error("Error al obtener sedes", error);
    }
  };

  const cargarEmpresas = async () => {
    try {
      const response = await getCompanies();
      setCompanies(response.data);
    } catch (error) {
      console.error("Error al obtener empresas", error);
    }
  };

  const getCompanyNameById = (id) => {
    const company = companies.find((c) => c.companyId === id);
    return company ? company.companyName : "Desconocida";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "companyId") {
      setNuevaSede({ ...nuevaSede, company: { companyId: Number(value) } });
    } else {
      setNuevaSede({ ...nuevaSede, [name]: value });
    }
  };

  const guardarSede = async () => {
    try {
      await createHeadquarter(nuevaSede);
      setModalVisible(false);
      setNuevaSede({
        headquarterName: "",
        headquarterCity: "",
        headquarterAddress: "",
        headquarterPhone: "",
        company: { companyId: 0 },
      });
      cargarSedes();
    } catch (error) {
      console.error("Error al crear sede", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Lista de Sedes</h2>

      <button
        onClick={() => setModalVisible(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Agregar Sede
      </button>

      <table className="w-full table-auto border">
       <thead>
  <tr className="bg-gray-200 text-center">
    <th className="p-2 border">ID Sede</th>
    <th className="p-2 border">Nombre</th>
    <th className="p-2 border">Ciudad</th>
    <th className="p-2 border">Dirección</th>
    <th className="p-2 border">Teléfono</th>
    <th className="p-2 border">Empresa</th>
  </tr>
</thead>

        <tbody>
          {sedes.map((sede, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">{sede.headquarterId}</td>
              <td className="border p-2">{sede.headquarterName}</td>
              <td className="border p-2">{sede.headquarterCity}</td>
              <td className="border p-2">{sede.headquarterAddress}</td>
              <td className="border p-2">{sede.headquarterPhone}</td>
              <td className="border p-2">
                {getCompanyNameById(sede.company?.companyId)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Agregar Sede</h3>

            <input
              type="text"
              name="headquarterName"
              placeholder="Nombre"
              value={nuevaSede.headquarterName}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              type="text"
              name="headquarterCity"
              placeholder="Ciudad"
              value={nuevaSede.headquarterCity}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              type="text"
              name="headquarterAddress"
              placeholder="Dirección"
              value={nuevaSede.headquarterAddress}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              type="text"
              name="headquarterPhone"
              placeholder="Teléfono"
              value={nuevaSede.headquarterPhone}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
            <input
              type="number"
              name="companyId"
              placeholder="ID de Empresa"
              value={nuevaSede.company.companyId}
              onChange={handleInputChange}
              className="w-full border p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={guardarSede}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Sedes;