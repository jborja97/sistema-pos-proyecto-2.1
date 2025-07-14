"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Select from "react-select";

import {
  getInventory,
  createInventoryDetail,
  getProducts,
  getEmployees,
} from "../services/api";
import { PlusCircle, Trash2 } from "lucide-react";

import { jwtDecode } from "jwt-decode";

const CURRENCY_OPTIONS = {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
};

export default function InventoryView() {
  const [currentEmployee, setCurrentEmployee] = useState(null);
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
      <h1 className="text-2xl font-bold mb-4"> Detalle de Inventarios</h1>

     

      <div className="space-y-4">
        {inventories.map((inv) => (
          <div key={inv.inventoryId} className="bg-gray-100 p-4 rounded shadow">
            <h3 className="text-lg font-semibold">
              Inventario #{inv.inventoryId}
            </h3>
            <p className="text-sm text-gray-500">
              Creado: {new Date(inv.createdAt).toLocaleString()}
            </p>
            <ul className="mt-2 pl-4 list-disc">
              {inv.inventoryDetails.map((detail) => (
                <li key={detail.inventoryDetailId}>
                  ID Detalle: {detail.inventoryDetailId} | Inicial:{" "}
                  {detail.initialAmount} | Entrada: {detail.entryAmount} |
                  Salida: {detail.outputAmount} | Final: {detail.finalAmount}  | Consunido: {detail.consumedAmount}  | Producto: {detail.product?.productName || "N/A"} 
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
