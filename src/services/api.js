import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://192.168.0.173:3000"
})

// LOGIN..Autenticación
export const login = (userEmail, userPassword) =>
  API.post("/auth/login", { userEmail, userPassword })

// HEADQUARTER..Sedes
export const createHeadquarter = (data) => API.post("/headquarter", data);
export const getHeadquarters = () => API.get("/headquarter");
export const getHeadquarterById = (id) => API.get(`/headquarter/${id}`);
export const updateHeadquarter = (id, data) => API.patch(`/headquarter/${id}`, data);
export const deleteHeadquarter = (id) => API.delete(`/headquarter/${id}`);

// EMPLOYEE...Empleados
export const createEmployee = (data) => API.post("/employee", data);
export const getEmployees = () => API.get("/employee");
export const getEmployeeById = (id) => API.get(`/employee/${id}`);
export const updateEmployee = (id, data) => API.patch(`/employee/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/employee/${id}`);

//COMPANY...Empresa
export const createCompany = (data) => API.post("/company", data);
export const getCompanies = () => API.get("/company");
export const getCompanyById = (id) => API.get(`/company/${id}`);
export const updateCompany = (id, data) => API.patch(`/company/${id}`, data);
export const deleteCompany = (id) => API.delete(`/company/${id}`);

// Tax...Impuestos
export const createTax = (data) => API.post("/tax", data);
export const getTaxes = () => API.get("/tax");
export const getTaxById = (id) => API.get(`/tax/${id}`);
export const updateTax = (id, data) => API.patch(`/tax/${id}`, data);
export const deleteTax = (id) => API.delete(`/tax/${id}`);

// PRODUCT...Productos
export const createProduct = (data) => API.post("/product", data);
export const getProducts = () => API.get("/product");
export const getProductById = (id) => API.get(`/product/${id}`);
export const updateProduct = (id, data) => API.patch(`/product/${id}`, data);
export const deleteProduct = (id) => API.delete(`/product/${id}`);

//supplier...Proveedores
export const createSupplier = (data) => API.post("/supplier", data);
export const getSuppliers = () => API.get("/supplier");
export const getSupplierById = (id) => API.get(`/supplier/${id}`);
export const updateSupplier = (id, data) => API.patch(`/supplier/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/supplier/${id}`);

//Customer...Clientes
export const createCustomer = (data) => API.post("/customer", data);
export const getCustomers = () => API.get("/customer");
export const getCustomerById = (id) => API.get(`/customer/${id}`);
export const updateCustomer = (id, data) => API.patch(`/customer/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/customer/${id}`);

//SaleDetail...Detalle de Ventas
export const createSaleDetail = (data) => API.post("/sale-detail", data);
export const getSaleDetails = () => API.get("/sale-detail");
export const getSaleDetailById = (id) => API.get(`/sale-detail/${id}`);
export const updateSaleDetail = (id, data) => API.patch(`/sale-detail/${id}`, data);
export const deleteSaleDetail = (id) => API.delete(`/sale-detail/${id}`);

// Sale...Ventas
export const createSale = (data) => API.post("/sale", data);
export const getSales = () => API.get("/sale");
export const getSaleById = (id) => API.get(`/sale/${id}`);
export const updateSale = (id, data) => API.patch(`/sale/${id}`, data);
export const deleteSale = (id) => API.delete(`/sale/${id}`);

export default API
