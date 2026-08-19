const API_URL = `${import.meta.env.VITE_API_BASE_URL}/products`;

const productService = {
  getProducts: async () => {
    const res = await fetch(`${API_URL}?limit=1000`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fetch failed");
    }
    return res.json();
  },

  getProductById: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Product not found");
    }
    return res.json();
  },

  addProduct: async (formData) => {
    const res = await fetch(`${API_URL}/create`, {
      method: "POST",
      body: formData, // ✅ FormData, DO NOT set headers
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add product");
    }

    return res.json();
  },

  updateProduct: async (id, formData) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update product");
    }

    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Delete failed");
    }

    return true;
  },
};

export default productService;