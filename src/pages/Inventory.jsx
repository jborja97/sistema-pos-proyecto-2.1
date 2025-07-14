"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Select from "react-select";

import {
  getInventory,
  createInventoryDetail,
  getProducts,
  getEmployees,
} from "../services/api";
import { PlusCircle, Trash2, Search } from "lucide-react";

import { jwtDecode } from "jwt-decode";

const CURRENCY_OPTIONS = {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
};

export default function InventoryView() {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [inventoryInputs, setInventoryInputs] = useState([
    {
      initialAmount: 0,
      entryAmount: 0,
      outputAmount: 0,
      finalAmount: 0,
      consumedAmount: 0,
      productId: "",
    },
  ]);
  

  const filteredInventories = useMemo(() => {
    if (!searchTerm.trim()) return inventories;

    return inventories
      .map((inv) => ({
        ...inv,
        inventoryDetails: inv.inventoryDetails.filter((detail) => {
          const inventoryId = detail.inventoryId
          const productName = detail.product?.productName?.toLowerCase() || "";
          const description = detail.product?.productDescription?.toLowerCase() || "";
          return (
            productName.includes(searchTerm.toLowerCase()) ||
            description.includes(searchTerm.toLowerCase()) ||
            inv.inventoryId.toString().includes(searchTerm)
          );
        }),
      }))
      .filter((inv) => inv.inventoryDetails.length > 0);
  }, [inventories, searchTerm]);

  const fetchInventories = async () => {
    try {
      const res = await getInventory();
      setInventories(res.data);
    } catch (err) {
      console.error("Error al cargar inventarios", err);
    }
  };

  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.productId,
      label: `${p.productName} - ${p.unitaryProductPrice.toLocaleString(
        "es-CO",
        CURRENCY_OPTIONS
      )}`,
    }));
  }, [products]);

  const decodedToken = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token) : null;
  }, []);

  useEffect(() => {
    fetchInventories();
    fetchProducts();
    fetchCurrentEmployee();
  }, []);

  const handleAddDetail = () => {
    setInventoryInputs([
      ...inventoryInputs,
      {
        initialAmount: 0,
        entryAmount: 0,
        outputAmount: 0,
        finalAmount: 0,
        consumedAmount: 0,
        productId: "",
      },
    ]);
    console.log("Enviando detalles:", inventoryInputs);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  const fetchCurrentEmployee = useCallback(async () => {
    try {
      if (decodedToken?.employeeId) {
        const res = await getEmployees();
        const employee = res.data.find(
          (e) => e.employeeId === decodedToken.employeeId
        );
        if (employee) {
          setCurrentEmployee(employee);
          setEmployeeId(employee.employeeId); // ✅ importante para enviar al backend
        }
      }
    } catch (error) {
      console.error("Error fetching current employee:", error);
    }
  }, [decodedToken]);

  const handleRemoveDetail = (index) => {
    const newInputs = [...inventoryInputs];
    newInputs.splice(index, 1);
    setInventoryInputs(newInputs);
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inventoryInputs];
    newInputs[index][field] = Number(value);
    if (field === "initialAmount") {
    }
    setInventoryInputs(newInputs);
  };

  const handleCreateInventory = async () => {
    if (!employeeId) {
      alert("Debes ingresar un ID de empleado");
      return;
    }

    try {
      console.log("Enviando al backend:", inventoryInputs);

      // Enviamos directamente el array
      await createInventoryDetail(employeeId, inventoryInputs);

      setInventoryInputs([
        {
          initialAmount: 0,
          entryAmount: 0,
          outputAmount: 0,
          finalAmount: 0,
          consumedAmount: 0,
          productId: "",
        },
      ]);

      alert("Inventario creado exitosamente");
    } catch (err) {
      console.error("Error al crear inventario", err);
      alert("Ocurrió un error al crear el inventario");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventarios</h1>

      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Crear nuevos detalles de inventario
        </h2>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Employee
        </label>
        <input
          disabled
          type="text"
          readOnly
          className="w-full p-3  rounded-md bg-gray-50 text-gray-600 mb-4 border-b-2"
          value={`${currentEmployee?.employeeName || ""} ${
            currentEmployee?.employeeLastName || ""
          }`}
        />

        {inventoryInputs.map((input, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <select
              value={input.productId}
              onChange={(e) =>
                handleInputChange(index, "productId", e.target.value)
              }
              className="border px-2 py-1 rounded w-64"
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.productName}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={input.initialAmount}
              onChange={(e) =>
                handleInputChange(index, "initialAmount", e.target.value)
              }
              placeholder="Cantidad inicial"
              className="border px-2 py-1 rounded w-40"
            />
            <input
              type="number"
              value={input.entryAmount}
              onChange={(e) =>
                handleInputChange(index, "entryAmount", e.target.value)
              }
              placeholder="Entrada"
              className="border px-2 py-1 rounded w-32"
            />
            <input
              type="number"
              value={input.outputAmount}
              onChange={(e) =>
                handleInputChange(index, "outputAmount", e.target.value)
              }
              placeholder="Salida"
              className="border px-2 py-1 rounded w-32"
            />
            <input
              type="number"
              value={input.finalAmount}
              onChange={(e) =>
                handleInputChange(index, "finalAmount", e.target.value)
              }
              className="border px-2 py-1 rounded w-32 bg-gray-50"
            />

            {inventoryInputs.length > 1 && (
              <button
                onClick={() => handleRemoveDetail(index)}
                className="text-red-600"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleAddDetail}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <PlusCircle className="mr-2" size={18} />
            Agregar Detalle
          </button>
          <button
            onClick={handleCreateInventory}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Crear Inventario
          </button>
        </div>
      </div>

      <div className="bg-white border p-4 rounded-xl shadow-sm flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar Numero inventario..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6 mt-10">
        {filteredInventories.map((inv) => (
          <div key={inv.inventoryId} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">
              Inventario #{inv.inventoryId}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Creado: {new Date(inv.createdAt).toLocaleString()}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <input
                  disabled
                  type="text"
                  readOnly
                  className="w-full p-3 border border-gray-100 bg-slate-100 rounded-md  text-gray-700"
                  value={`${currentEmployee?.employeeName || ""} ${
                    currentEmployee?.employeeLastName || ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headquarter
                </label>
                <input
                  disabled
                  type="text"
                  readOnly
                  className="w-full p-3 border border-gray-100 bg-slate-100 rounded-md  text-gray-700"
                  value={currentEmployee?.headquarter?.headquarterName || ""}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-100 truncate">
                  <tr>
                    <th className="px-4 py-2"># Detalle</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Descripción</th>
                    <th className="px-4 py-2">Inicial</th>
                    <th className="px-4 py-2">Entrada</th>
                    <th className="px-4 py-2">Salida</th>
                    <th className="px-4 py-2">Consumido</th>
                    <th className="px-4 py-2">Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inv.inventoryDetails.map((detail) => (
                    <tr key={detail.inventoryDetailId}>
                      <td className="px-4 py-2">{detail.inventoryDetailId}</td>
                      <td className="px-4 py-2">
                        {detail.product?.productName || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {detail.product?.productDescription || "—"}
                      </td>

                      <td className="px-4 py-2">{detail.initialAmount}</td>
                      <td className="px-4 py-2">{detail.entryAmount}</td>
                      <td className="px-4 py-2">{detail.outputAmount}</td>
                      <td className="px-4 py-2">{detail.consumedAmount}</td>
                      <td className="px-4 py-2">{detail.finalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
