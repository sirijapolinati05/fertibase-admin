import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import productService from "../services/productService";
import { Eye } from "lucide-react";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [viewing, setViewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [imagePreview, setImagePreview] = useState(null);

  const initialForm = {
    id: "",
    name: "",
    category: "",
    description: "",
    key_highlights: [],
    crop_benefits: [],
    product_advantages: [],
    recommended_crops: [],
    application_timing: "",
    recommended_dosage: "",
    application_details: "",
    image_url: null,
    image: null,
  };

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const resetForm = () => {
    setForm(initialForm);
    setImagePreview(null);
  };

  const CATEGORIES = [
    "Biofertilizer",
    "Organic Biofertilizer",
    "Liquid Fertilizer",
    "Straight Micronutrient",
    "Beneficial Element Fertilizer",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  // const resetForm = () => {
  //   setForm(initialForm);
  // };

  const handleImageChange = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setForm({ ...form, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  /* ------------------ Dynamic list helpers ------------------ */
  const addItem = (key) =>
    setForm({ ...form, [key]: [...form[key], ""] });

  const updateItem = (key, index, value) => {
    const updated = [...form[key]];
    updated[index] = value;
    setForm({ ...form, [key]: updated });
  };

  const removeItem = (key, index) =>
    setForm({
      ...form,
      [key]: form[key].filter((_, i) => i !== index),
    });

  /* ------------------ Submit ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("description", form.description);

      fd.append("key_highlights", form.key_highlights.join("\n"));
      fd.append("crop_benefits", form.crop_benefits.join("\n"));
      fd.append("product_advantages", form.product_advantages.join("\n"));
      fd.append("recommended_crops", form.recommended_crops.join("\n"));

      fd.append("application_timing", form.application_timing);
      fd.append("recommended_dosage", form.recommended_dosage);
      fd.append("application_details", form.application_details);

      if (form.image) {
        fd.append("image", form.image);
      } else if (editing && form.image_url) {
        fd.append("image_url", form.image_url);
      }

      if (editing) {
        await productService.updateProduct(form.id, fd);
        setSuccessMessage("Product updated successfully.");
      } else {
        await productService.addProduct(fd);
        setSuccessMessage("Product added successfully.");
      }

      setSuccessOpen(true);
      setModalOpen(false);
      resetForm();
      setEditing(false);
      fetchProducts();

    } catch (err) {
      setErrorMessage("Failed to save product. Please try again.");
      setErrorOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name ?? "",
      category: product.category ?? "",
      // sub_category: product.sub_category ?? "",
      description: product.description ?? "",

      key_highlights: product.key_highlights ?? [],
      crop_benefits: product.crop_benefits ?? [],
      product_advantages: product.product_advantages ?? [],
      recommended_crops: product.recommended_crops ?? [],

      application_timing: product.application_timing ?? "",
      recommended_dosage: product.recommended_dosage ?? "",
      application_details: product.application_details ?? "",

      image_url: product.image_url || null,
      image: null,
    });
    setImagePreview(product.image_url || null);
    setEditing(true);
    setViewing(false);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await productService.deleteProduct(deletingId);
      setProducts(prev => prev.filter(p => p.id !== deletingId));
      setSuccessMessage("Product deleted successfully.");
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage("Failed to delete product.");
      setErrorOpen(true);
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleView = (product) => {
    setForm({
      id: product.id,
      name: product.name ?? "",
      category: product.category ?? "",
      // sub_category: product.sub_category ?? "",
      description: product.description ?? "",

      key_highlights: product.key_highlights ?? [],
      crop_benefits: product.crop_benefits ?? [],
      product_advantages: product.product_advantages ?? [],
      recommended_crops: product.recommended_crops ?? [],

      application_timing: product.application_timing ?? "",
      recommended_dosage: product.recommended_dosage ?? "",
      application_details: product.application_details ?? "",
      image_url: product.image_url || null,
      image: null,
    });
    setImagePreview(product.image_url || null);
    setViewing(true);
    setEditing(false);
    setModalOpen(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || p.category === filterCategory;

    return matchesSearch && matchesCategory;
  });



  if (loading) return <div className="p-10">Loading products…</div>;

  return (
    <div className="p-10 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800">Products</h1>
          <p className="text-slate-500 mt-2">
            Manage, view and update your product catalog
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditing(false);
            setViewing(false);
            setModalOpen(true);
          }}
          className="bg-slate-900 hover:bg-emerald-700 text-white px-7 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 rounded-xl border w-full sm:w-1/2"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border w-full sm:w-1/4"
        >
          <option value="All">All Categories</option>
          {[...new Set(products.map(p => p.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 gap-5">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex justify-between items-center"
          >
            <div className="flex items-center gap-5">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  className="w-16 h-16 rounded-2xl object-cover shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ImageIcon />
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
              </div>
            </div>

            <div className="flex gap-2">
              <IconBtn onClick={() => handleView(p)} color="slate">
                <Eye size={18} />
              </IconBtn>

              <IconBtn onClick={() => handleEdit(p)} color="blue">
                <Pencil size={18} />
              </IconBtn>

              <IconBtn onClick={() => handleDelete(p.id)} color="red">
                <Trash2 size={18} />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-10 py-7 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800">
                  {viewing ? "Product Details" : editing ? "Edit Product" : "New Product"}
                </h2>
                <p className="text-slate-500 mt-1">
                  {viewing
                    ? "View complete product information"
                    : "Fill all details carefully before saving"}
                </p>
              </div>

              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                  setViewing(false);
                  setEditing(false);
                }}
                className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-slate-50 to-slate-100">
              <form
                id="product-form"
                onSubmit={handleSubmit}
                className="space-y-8 max-w-4xl mx-auto"
              >
                <Card title="Product Overview">
                  <Input
                    label="Product Name"
                    value={form.name}
                    disabled={viewing}
                    onChange={v => setForm({ ...form, name: v })}
                    required
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Category <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={form.category}
                      disabled={viewing}
                      required
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-xl outline-none disabled:bg-slate-100"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>



                  <Textarea
                    label="Description"
                    value={form.description}
                    disabled={viewing}
                    onChange={v => setForm({ ...form, description: v })}
                  />
                </Card>
                {viewing ? (
                  <ListCard title="Key Highlights" items={form.key_highlights} />
                ) : (
                  <EditableListCard
                    title="Key Highlights"
                    items={form.key_highlights}
                    onAdd={() => addItem("key_highlights")}
                    onUpdate={(i, v) => updateItem("key_highlights", i, v)}
                    onRemove={(i) => removeItem("key_highlights", i)}
                  />
                )}
                {viewing ? (
                  <ListCard title="Crop Benefits" items={form.crop_benefits} />
                ) : (
                  <EditableListCard
                    title="Crop Benefits"
                    items={form.crop_benefits}
                    onAdd={() => addItem("crop_benefits")}
                    onUpdate={(i, v) => updateItem("crop_benefits", i, v)}
                    onRemove={(i) => removeItem("crop_benefits", i)}
                  />
                )}

                {viewing ? (
                  <ListCard title="Product Advantages" items={form.product_advantages} />
                ) : (
                  <EditableListCard
                    title="Product Advantages"
                    items={form.product_advantages}
                    onAdd={() => addItem("product_advantages")}
                    onUpdate={(i, v) => updateItem("product_advantages", i, v)}
                    onRemove={(i) => removeItem("product_advantages", i)}
                  />
                )}

                {viewing ? (
                  <ListCard title="Recommended Crops" items={form.recommended_crops} />
                ) : (
                  <EditableListCard
                    title="Recommended Crops"
                    items={form.recommended_crops}
                    onAdd={() => addItem("recommended_crops")}
                    onUpdate={(i, v) => updateItem("recommended_crops", i, v)}
                    onRemove={(i) => removeItem("recommended_crops", i)}
                  />
                )}

                <Card title="Application">
                  <Input
                    label="Application Timing"
                    value={form.application_timing}
                    disabled={viewing}
                    onChange={v => setForm({ ...form, application_timing: v })}
                  />

                  <Input
                    label="Recommended Dosage"
                    value={form.recommended_dosage}
                    disabled={viewing}
                    onChange={v => setForm({ ...form, recommended_dosage: v })}
                  />

                  <Textarea
                    label="Application Details"
                    value={form.application_details}
                    disabled={viewing}
                    onChange={v => setForm({ ...form, application_details: v })}
                  />
                </Card>

                <Card title="Product Image">
                  {/* IMAGE PREVIEW */}
                  {(editing && (imagePreview || form.image_url)) || imagePreview ? (
                    <img
                      src={imagePreview || form.image_url}
                      alt="Product"
                      className="w-40 h-40 object-cover rounded-2xl border shadow"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      No Image
                    </div>
                  )}

                  {/* UPLOAD — only for add/edit */}
                  {!viewing && (
                    <div className="mt-4">
                      <label
                        htmlFor="product-image-upload"
                        className="inline-flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700 hover:text-emerald-600 transition"
                      >
                        <ImageIcon size={18} />
                        {editing ? "Change Image" : "Add Image"}
                      </label>
                      <input
                        id="product-image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files[0])}
                      />
                    </div>
                  )}
                </Card>

              </form>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t bg-white flex justify-end gap-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setViewing(false);
                  setEditing(false);
                  resetForm();
                }}
                className="px-7 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              {!viewing && (
                <button
                  form="product-form"
                  type="submit"
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-9 py-3 rounded-xl font-semibold flex items-center gap-2 shadow"
                >
                  <Save size={18} />
                  {editing ? "Save Changes" : "Save Product"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
      {successOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <Save className="text-emerald-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              Success
            </h3>

            <p className="text-slate-500">
              {successMessage}
            </p>

            <button
              onClick={() => setSuccessOpen(false)}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {errorOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <X className="text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              Something went wrong
            </h3>

            <p className="text-slate-500">
              {errorMessage}
            </p>

            <button
              onClick={() => setErrorOpen(false)}
              className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-5">

            <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              Delete Product?
            </h3>

            <p className="text-slate-500">
              Are you sure want to delete this Product?
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-6 py-3 rounded-xl bg-slate-100 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, color }) {
  const colors = {
    slate: "text-slate-500 hover:bg-slate-100",
    blue: "text-blue-600 hover:bg-blue-50",
    red: "text-red-600 hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl transition ${colors[color]}`}
    >
      {children}
    </button>
  );
}

/* ================= SMALL UI HELPERS ================= */

function Card({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl border space-y-4">
      <h3 className="font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, required, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      <input
        required={required}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-3 border rounded-xl outline-none disabled:bg-slate-100"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      <textarea
        rows={3}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-3 border rounded-xl outline-none disabled:bg-slate-100"
      />
    </div>
  );
}


function ListCard({ title, items }) {
  return (
    <div className="bg-white p-6 rounded-2xl border space-y-4">
      <h3 className="font-bold">{title}</h3>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 w-2 h-2 bg-emerald-600 rounded-full" />
            <span className="text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditableListCard({ title, items, onAdd, onUpdate, onRemove }) {
  return (
    <div className="bg-white p-6 rounded-2xl border space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{title}</h3>
        <button type="button" onClick={onAdd}>
          <Plus size={16} />
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => onUpdate(i, e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button type="button" onClick={() => onRemove(i)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

