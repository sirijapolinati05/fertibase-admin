import React, { useState, useEffect } from "react";
import { Plus, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import productService from "../services/productService";

export default function Products() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emptyForm = {
    name: "",
    category: "",
    sub_category: "",
    description: "",
    key_highlights: [],
    crop_benefits: [],
    product_advantages: [],
    recommended_crops: [],
    application_timing: "",
    recommended_dosage: "",
    application_details: "",
    image: null,
  };

  const CATEGORIES = [
    "Biofertilizer",
    "Organic Biofertilizer",
    "Liquid Fertilizer",
    "Straight Micronutrient",
    "Beneficial Element Fertilizer",
  ];

  const [form, setForm] = useState(emptyForm);

  const addItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const updateItem = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const removeItem = (field, index) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getProducts();
      const cleaned = data.map(p => ({
        ...p,
        category: (p.category || "").trim(),
      }));
      setProducts(cleaned);
      console.log('Fetched products:', cleaned);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoadingProducts(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);


    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fd.append(key, value.join("\n"));
        } else if (value !== null) {
          fd.append(key, value);
        }
      });

      await productService.addProduct(fd);

      // Refresh product list
      await fetchProducts();

      setModalOpen(false);
      setForm(emptyForm);
      setSuccessOpen(true);

    } catch (err) {
      setErrorMessage(err.message || "Failed to save product.");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const DynamicSection = ({ title, field, placeholder }) => (
    <div className="bg-slate-50 p-5 rounded-2xl space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">{title}</h4>
        <button type="button" onClick={() => addItem(field)}>
          <Plus size={16} />
        </button>
      </div>

      {form[field].map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded-lg"
            placeholder={placeholder}
            value={item}
            onChange={(e) => updateItem(field, i, e.target.value)}
          />
          <button type="button" onClick={() => removeItem(field, i)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-10">
      <button
        className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        onClick={() => setModalOpen(true)}
      >
        <Plus size={18} /> Add Product
      </button>

      {/* Product List */}
      {loadingProducts ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={24} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {products.map((product) => (
            <div key={product.id} className="p-4 border rounded shadow">
              <h3 className="font-bold">{product.name}</h3>
              <p>{product.category}</p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>

            <div>
              <label className="font-medium">Product Name</label>
              <input
                className="w-full mt-2 p-3 border rounded-xl"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Category</label>
                <select
                  className="w-full mt-2 p-3 border rounded-xl"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Sub Category</label>
                <input
                  className="w-full mt-2 p-3 border rounded-xl"
                  value={form.sub_category}
                  onChange={(e) =>
                    setForm({ ...form, sub_category: e.target.value })
                  }
                />
              </div>
            </div>

            <DynamicSection
              title="Key Highlights"
              field="key_highlights"
              placeholder="Add highlight..."
            />

            <DynamicSection
              title="Crop Benefits"
              field="crop_benefits"
              placeholder="Add benefit..."
            />

            <DynamicSection
              title="Product Advantages"
              field="product_advantages"
              placeholder="Add advantage..."
            />

            <DynamicSection
              title="Recommended Crops"
              field="recommended_crops"
              placeholder="Add crop..."
            />

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                "SAVE PRODUCT"
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================= SUCCESS DIALOG ================= */}
      {successOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-4 w-full max-w-md">
            <CheckCircle className="mx-auto text-emerald-600" size={48} />
            <h3 className="text-xl font-bold">Product Added</h3>
            <p className="text-slate-500">
              The product was saved successfully.
            </p>
            <button
              onClick={() => setSuccessOpen(false)}
              className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= ERROR DIALOG ================= */}
      {errorOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-4 w-full max-w-md">
            <AlertCircle className="mx-auto text-red-600" size={48} />
            <h3 className="text-xl font-bold">Something went wrong</h3>
            <p className="text-slate-500">{errorMessage}</p>
            <button
              onClick={() => setErrorOpen(false)}
              className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
