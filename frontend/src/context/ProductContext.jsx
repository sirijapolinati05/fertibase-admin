import { createContext, useContext, useState, useEffect } from "react";
import productService from "../services/productService";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  // START WITH AN EMPTY ARRAY - removes the Nitrobase placeholder
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to sync with Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  const deleteProduct = async (id) => {
    try {
      // 1. Tell the backend to delete from Supabase
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        // 2. Remove from the screen only if the database delete worked
        setProducts((prev) => prev.filter((p) => (p.id || p._id) !== id));
        alert("Product removed from inventory.");
      } else {
        alert("Failed to delete from database.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, deleteProduct, fetchLiveProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}