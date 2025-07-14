"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import { Plus, Search, Receipt, Eye, X, Trash, CreditCard, Calendar } from "lucide-react";
import { jwtDecode } from "jwt-decode";

import {
  getSales,
  getProducts,
  createSaleDetail,
  getCustomers,
  getEmployees,
} from "../services/api"; 

const CURRENCY_OPTIONS = {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
};

export default function Ventas() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddSaleModalVisible, setIsAddSaleModalVisible] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState([]); // Initialize as an empty array
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); 

  const [newSaleForm, setNewSaleForm] = useState({
    employeeId: 0,
    headquarterId: 0,
    customerId: 0,
    saleDate: new Date().toISOString().split("T")[0],
    products: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const decodedToken = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token) : null;
  }, []);

  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.productId,
      label: `${p.productName} - ${p.unitaryProductPrice.toLocaleString("es-CO", CURRENCY_OPTIONS)}`,
    }));
  }, [products]);

  const customerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.customerId,
      label: c.customerName,
    }));
  }, [customers]);

  const calculateSaleTotals = useMemo(() => {
    let subtotal = 0;
    let totalTaxes = 0;

    newSaleForm.products.forEach(({ productId, quantity }) => {
      const product = products.find((p) => p.productId === parseInt(productId));
      if (!product) return;

      const unitaryPrice = product.unitaryProductPrice || 0;
      const base = quantity * unitaryPrice;
      subtotal += base;

      const taxes = product.taxes || [];
      taxes.forEach((tax) => {
        totalTaxes += base * (tax.taxPercentage / 100);
      });
    });

    const total = subtotal + totalTaxes;
    return { subtotal, totalTaxes, total };
  }, [newSaleForm.products, products]);

  // --- Effects ---
  useEffect(() => {
    setNewSaleForm((prev) => ({
      ...prev,
      subtotal: calculateSaleTotals.subtotal,
      tax: calculateSaleTotals.totalTaxes,
      total: calculateSaleTotals.total,
    }));
  }, [calculateSaleTotals]);

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
    fetchCurrentEmployee();
  }, []); 

  // --- Data Fetching Functions ---
  const fetchSales = useCallback(async () => {
    try {
      const res = await getSales();
      const processedSales = res.data.map((sale) => ({
        ...sale,
        subtotalSale: parseFloat(sale.subtotalSale) || 0,
        totalTaxesSale: parseFloat(sale.totalTaxesSale) || 0,
        totalSale: parseFloat(sale.totalSale) || 0,
        saleDate: new Date(sale.saleDate).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      }));
      setSales(processedSales);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, []);

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
        const employee = res.data.find((e) => e.employeeId === decodedToken.employeeId);
        setCurrentEmployee(employee);
        setNewSaleForm((prev) => ({
          ...prev,
          employeeId: employee.employeeId,
          headquarterId: employee.headquarter?.headquarterId || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching current employee:", error);
    }
  }, [decodedToken]);

  // --- Handlers for New Sale Form ---
  const handleAddProduct = () => {
    setNewSaleForm((prev) => ({
      ...prev,
      products: [...prev.products, { productId: 0, quantity: 1 }],
    }));
  };

  const handleRemoveProduct = (index) => {
    setNewSaleForm((prev) => {
      const updatedProducts = [...prev.products];
      updatedProducts.splice(index, 1);
      return { ...prev, products: updatedProducts };
    });
  };

  const handleUpdateProduct = (index, field, value) => {
    setNewSaleForm((prev) => {
      const updatedProducts = [...prev.products];
      updatedProducts[index][field] = parseInt(value);
      return { ...prev, products: updatedProducts };
    });
  };

  const handleSaveNewSale = async () => {
    const { customerId, employeeId, headquarterId, saleDate, products: saleProducts } = newSaleForm;

    if (!customerId || saleProducts.length === 0) {
      return alert("Please complete all required fields and add at least one product.");
    }

    const totals = calculateSaleTotals;

    try {
      await createSaleDetail({
        customerId,
        employeeId,
        headquarterId,
        saleDate,
        paymentMethods: [{ paymentMethodId: 1 }], 
        products: saleProducts.map((p) => ({
          productId: p.productId,
          amount: p.quantity,
        })),
        subtotalSale: totals.subtotal,
        totalTaxesSale: totals.totalTaxes,
        totalSale: totals.total,
      });

      setNewSaleForm({
        employeeId: currentEmployee?.employeeId || 0,
        headquarterId: currentEmployee?.headquarter?.headquarterId || 0,
        customerId: 0,
        saleDate: new Date().toISOString().split("T")[0],
        products: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      });
      setIsAddSaleModalVisible(false);
      fetchSales(); 
    } catch (error) {
      console.error("Error saving new sale:", error);
      alert("Failed to save sale. Please try again.");
    }
  };

  // --- MODIFIED showSaleDetails function ---
  const showSaleDetails = async (sale) => {
    setSelectedSale(sale);
    setIsDetailModalVisible(true);
    
    setSaleDetails(Array.isArray(sale.saleDetails) ? sale.saleDetails : []);
    setIsLoadingDetails(false); 
  };

  const printSaleDetails = () => {
    const content = document.getElementById("sale-detail-to-print")?.innerHTML;
    if (!content) {
      console.error("Print content not found.");
      return;
    }
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${selectedSale?.saleId || ""}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h3 { margin-bottom: 10px; }
            p, ul, table { margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // --- Render Logic ---
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
        <button
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out shadow-md"
          onClick={() => setIsAddSaleModalVisible(true)}
        >
          <Plus size={20} /> Register New Sale
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No sales found.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.saleId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.saleId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.saleDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.subtotalSale.toLocaleString("es-CO", CURRENCY_OPTIONS)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.totalTaxesSale.toLocaleString("es-CO", CURRENCY_OPTIONS)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.totalSale.toLocaleString("es-CO", CURRENCY_OPTIONS)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => showSaleDetails(sale)}
                      className="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out"
                    >
                      <Eye size={18} className="inline-block mr-1" /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Add New Sale Modal --- */}
      {isAddSaleModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Register New Sale</h2>
              <button
                onClick={() => setIsAddSaleModalVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <Select
                  id="customer-select"
                  options={customerOptions}
                  value={customerOptions.find((opt) => opt.value === newSaleForm.customerId)}
                  onChange={(selected) =>
                    setNewSaleForm((prev) => ({ ...prev, customerId: selected?.value || 0 }))
                  }
                  placeholder="Select a customer"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Employee and Headquarter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    value={`${currentEmployee?.employeeName || ""} ${currentEmployee?.employeeLastName || ""}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headquarter</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    value={currentEmployee?.headquarter?.headquarterName || ""}
                  />
                </div>
              </div>

              {/* Sale Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                  value={newSaleForm.saleDate}
                  readOnly // Sale date is pre-filled and not editable for new sales
                />
              </div>

              {/* Products Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Products</h3>
                {newSaleForm.products.map((product, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3 items-center">
                    <div className="col-span-4">
                      <Select
                        options={productOptions}
                        value={productOptions.find((opt) => opt.value === product.productId)}
                        onChange={(selected) =>
                          handleUpdateProduct(index, "productId", selected?.value || 0)
                        }
                        placeholder="Select a product"
                        className="text-sm"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-md text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        value={product.quantity}
                        onChange={(e) => handleUpdateProduct(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-150 ease-in-out flex items-center justify-center"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddProduct}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out flex items-center gap-2"
                >
                  <Plus size={18} /> Add Product
                </button>
              </div>

              {/* Totals Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md text-right text-gray-800">
                <p className="mb-1">
                  <strong>Subtotal:</strong> {calculateSaleTotals.subtotal?.toLocaleString("es-CO", CURRENCY_OPTIONS) || "$0"}
                </p>
                <p className="mb-1">
                  <strong>Taxes:</strong> {calculateSaleTotals.totalTaxes?.toLocaleString("es-CO", CURRENCY_OPTIONS) || "$0"}
                </p>
                <p className="text-lg font-bold">
                  <strong>Total:</strong> {calculateSaleTotals.total?.toLocaleString("es-CO", CURRENCY_OPTIONS) || "$0"}
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveNewSale}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out text-lg font-semibold shadow-md"
              >
                Save Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Sale Detail Modal --- */}
      {isDetailModalVisible && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Sale Invoice #{selectedSale.saleId}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={printSaleDetails}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out flex items-center gap-2"
                >
                  <Receipt size={18} /> Print
                </button>
                <button
                  onClick={() => setIsDetailModalVisible(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div id="sale-detail-to-print" className="text-gray-800">
              {/* Header for Invoice */}
              <header className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-2">Company Name</h2>
                <p className="text-sm mb-1">Headquarter: {currentEmployee?.headquarter?.headquarterName || "N/A"}</p>
                <p className="text-sm mb-1">Employee: {currentEmployee?.employeeName} {currentEmployee?.employeeLastName}</p>
                <p className="text-sm mb-1">Date: {selectedSale?.saleDate || "N/A"}</p>
              </header>

              {/* Customer Information */}
              <section className="mb-6">
                <p className="text-lg font-semibold mb-2">Customer Details:</p>
                <p><strong>Name:</strong> {selectedSale.customer?.customerName || "N/A"}</p>
              </section>

              {/* Products Table */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Products Purchased</h3>
                {isLoadingDetails ? (
                  <p className="text-center text-gray-600">Loading details...</p>
                ) : Array.isArray(saleDetails) && saleDetails.length > 0 ? (
                  <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Product Name</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleDetails.map((detail) => (
                        <tr key={detail.saleDetailId} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-900">{detail.amount}</td>
                          {/* Access product name from nested product object */}
                          <td className="px-4 py-2 text-sm text-gray-900">{detail?.product?.productName || "N/A"}</td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900">
                            {(parseFloat(detail.unitaryPrice) || 0).toLocaleString("es-CO", CURRENCY_OPTIONS)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900">
                            {(parseFloat(detail.total) || 0).toLocaleString("es-CO", CURRENCY_OPTIONS)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-600">No products found for this sale.</p>
                )}
              </section>

              {/* Totals Summary */}
              <section className="mt-8 text-right bg-gray-50 p-4 rounded-md">
                <p className="mb-2">
                  <strong>Subtotal:</strong>{" "}
                  {selectedSale?.subtotalSale?.toLocaleString("es-CO", CURRENCY_OPTIONS) || "$0"}
                </p>
                <p className="mb-2">
                  <strong>Taxes:</strong>{" "}
                  {selectedSale?.totalTaxesSale?.toLocaleString("es-CO", CURRENCY_OPTIONS) || "$0"}
                </p>
                <p className="text-xl font-bold text-blue-700">
                  <strong>Total:</strong>{" "}
                  {selectedSale?.totalSale?.toLocaleString("es-CO", CURRENCY_OPTIONS) || "$0"}
                </p>
              </section>

              {/* Payment Methods */}
              <section className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {(selectedSale?.paymentMethods || []).map((method) => (
                    <li key={method.paymentMethodId}>{method.paymentMethodName}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}