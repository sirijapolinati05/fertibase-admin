import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/static")) {
    const baseUrl = API_BASE.replace("/api", "");
    return `${baseUrl}${url}`;
  }
  return url;
};

/* ---------------- CONSTANTS ---------------- */

const RESOURCE_CATEGORIES = [
  "Webinars",
  "Technical Guides",
  "Marketing Materials",
  "Posters",
  "PPTs",
];

const MARKETING_TYPES = [
  "Banners",
  "Brochures",
  "Flyers",
  "Standees",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  detailed_description: "",
  material_type: "",
  video_url: "",
};

/* ---------------- COMPONENT ---------------- */

export default function Resources() {
  const [filterSubCategory, setFilterSubCategory] = useState("All");
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [viewing, setViewing] = useState(null); // for Read More modal

  const [files, setFiles] = useState({
    telugu: null,
    marathi: null,
    kannada: null,
    gujarati: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    telugu: null,
    marathi: null,
    kannada: null,
    gujarati: null,
  });

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    fetchResources();
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchResources = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/resources/`);
      setResources(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setFiles({
      telugu: null,
      marathi: null,
      kannada: null,
      gujarati: null,
    });
    setImagePreviews({
      telugu: null,
      marathi: null,
      kannada: null,
      gujarati: null,
    });
    setCategory("");
    setIsEditing(false);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setCategory(item.category);

    setForm({
      title: item.title || "",
      description: item.description || "",
      detailed_description: item.detailed_description || "",
      material_type: item.material_type || "",
      video_url: item.video_url || "",
    });

    // 👇 set previews from DB
    setImagePreviews({
      telugu: item.image_url_telugu || null,
      marathi: item.image_url_marathi || null,
      kannada: item.image_url_kannada || null,
      gujarati: item.image_url_gujarati || null,
    });

    setFiles({
      telugu: null,
      marathi: null,
      kannada: null,
      gujarati: null,
    });

    setEditingId(item.id);
    setIsEditing(true);
    setModalOpen(true);
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        category !== "PPTs" &&
        !isEditing &&
        !files.telugu &&
        !files.marathi &&
        !files.kannada &&
        !files.gujarati
      ) {
        alert("Please upload at least one language image");
        return;
      }

      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", form.title);
      if (form.description) formData.append("description", form.description);
      if (form.detailed_description) formData.append("detailed_description", form.detailed_description);
      if (form.material_type) formData.append("material_type", form.material_type);
      if (form.video_url) formData.append("video_url", form.video_url);

      if (category === "PPTs" && file) {
        formData.append("file", file);
      } else {
        if (files.telugu) formData.append("image_telugu", files.telugu);
        if (files.marathi) formData.append("image_marathi", files.marathi);
        if (files.kannada) formData.append("image_kannada", files.kannada);
        if (files.gujarati) formData.append("image_gujarati", files.gujarati);
      }

      if (isEditing) {
        // Our python backend doesn't have a PUT for resources yet in my previous task, but if they want to edit we can implement it or just rely on add/delete for now.
        // I will add a PUT route in resources.py shortly, or just use axios.put
        await axios.put(`${API_BASE}/resources/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_BASE}/resources/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccessMessage(isEditing ? "Resource updated successfully." : "Resource added successfully.");
      setSuccessOpen(true);
      setModalOpen(false);
      resetForm();
      fetchResources();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save resource. Please try again.");
      setErrorOpen(true);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = (id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/resources/${deletingId}`);

      setSuccessMessage("Resource deleted successfully.");
      setSuccessOpen(true);
      fetchResources();
    } catch (err) {
      setErrorMessage("Failed to delete resource.");
      setErrorOpen(true);
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredResources = resources.filter((item) => {
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase());

    const matchesSubCategory =
      filterCategory !== "Marketing Materials" ||
      filterSubCategory === "All" ||
      item.material_type === filterSubCategory;

    return matchesCategory && matchesSearch && matchesSubCategory;
  });

  const marketingMaterialsCount = resources.filter(
    (r) => r.category === "Marketing Materials"
  ).length;

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resources</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700"
        >
          <Plus size={18} /> Add Resource
        </button>
      </div>

      {/* LIST */}
      {/* FILTER BAR */}
      <div className="flex flex-col gap-4">

        {/* Search + Category */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 bg-white border rounded-xl w-full sm:w-1/2"
          />

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setFilterSubCategory("All");
            }}
            className="p-3 bg-white border rounded-xl w-full sm:w-1/4"
          >
            <option value="All">All Categories</option>
            {RESOURCE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* ✅ SUB CATEGORY FILTER — ONLY FOR MARKETING MATERIALS */}
        {filterCategory === "Marketing Materials" &&
          marketingMaterialsCount > 0 && (
            <div className="flex flex-wrap gap-3">
              {["All", ...MARKETING_TYPES].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterSubCategory(type)}
                  className={`px-5 py-2 rounded-full border text-sm font-semibold transition
            ${filterSubCategory === type
                      ? "bg-[#741A1C] text-white border-[#741A1C]"
                      : "bg-white text-[#741A1C] border-[#741A1C]/30 hover:bg-[#741A1C]/10"
                    }`}
                >
                  {type} (
                  {
                    resources.filter(
                      (r) =>
                        r.category === "Marketing Materials" &&
                        (type === "All" || r.material_type === type)
                    ).length
                  }
                  )
                </button>
              ))}
            </div>
          )}
        {/* EMPTY STATE — NO RESULTS */}
        {filterCategory === "Marketing Materials" &&
          filteredResources.length === 0 && (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
              <p className="text-red-700 font-semibold text-lg">
                There are no {filterSubCategory !== "All" ? filterSubCategory : "Marketing Materials"} available
              </p>
              <p className="text-sm text-red-600 mt-1">
                Please add {filterSubCategory !== "All" ? filterSubCategory : "resources"}.
              </p>
            </div>
          )}
      </div>

      {/* RESOURCE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredResources.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow overflow-hidden relative"
          >
            {/* IMAGE */}
            {/* {item.image_url ? (
        <img
          src={getImageUrl(item.image_url)}
          alt={item.title}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="h-44 bg-gray-100 flex items-center justify-center text-gray-400">
          {item.category === "PPTs" ? "PPT FILE" : "NO IMAGE"}
        </div>
      )} */}

            {/* CONTENT */}
            <div className="p-5 space-y-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {item.category}
              </span>

              <h3 className="font-bold text-lg">{item.title}</h3>

              {item.material_type && (
                <p className="text-xs text-gray-500">{item.material_type}</p>
              )}

              <p className="text-sm text-gray-600 line-clamp-3">
                {item.description || item.detailed_description}
              </p>

              <div className="flex gap-3 pt-3">
                {item.video_url && (
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold text-sm"
                  >
                    ▶ Watch Now
                  </a>
                )}

                {/* <button
            onClick={() => setViewing(item)}
            className="text-slate-900 font-semibold text-sm"
          >
            Read More
          </button> */}
              </div>
            </div>

            {/* EDIT / DELETE */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 bg-white rounded-lg shadow text-amber-600"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-white rounded-lg shadow text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="
    bg-white w-full max-w-xl
    mt-10 mb-10
    rounded-3xl
  "
          >
            {/* HEADER */}
            <div className="p-8 border-b relative">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5"
              >
                <X />
              </button>

              <h2 className="text-xl font-bold">
                {isEditing ? "Edit Resource" : "Add Resource"}
              </h2>
            </div>

            {/* BODY — normal flow, NO internal scroll */}
            <div className="p-8 space-y-4">
              {!isEditing && (
                <select
                  className="w-full p-4 bg-gray-50 rounded-xl"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {RESOURCE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}

              {category && (
                <>
                  <Input
                    value={form.title}
                    label="Title"
                    onChange={(v) => setForm({ ...form, title: v })}
                  />

                  {(category !== "Posters" && category !== "PPTs") && (
                    <Textarea
                      label="Description"
                      value={form.description}
                      onChange={(v) => setForm({ ...form, description: v })}
                    />
                  )}

                  {category === "Marketing Materials" && (
                    <select
                      className="w-full p-4 bg-gray-50 rounded-xl"
                      value={form.material_type}
                      onChange={(e) =>
                        setForm({ ...form, material_type: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Material Type</option>
                      {MARKETING_TYPES.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  )}

                  {(category === "Technical Guides" ||
                    category === "Marketing Materials") && (
                      <Textarea
                        label="Detailed Description"
                        value={form.detailed_description}
                        onChange={(v) =>
                          setForm({ ...form, detailed_description: v })
                        }
                      />
                    )}

                  {category === "Webinars" && (
                    <Input
                      label="Video URL"
                      value={form.video_url}
                      onChange={(v) =>
                        setForm({ ...form, video_url: v })
                      }
                    />
                  )}

                  {/* FILE UPLOAD */}
                  {category === "PPTs" ? (
                    <FileInput
                      label="Upload PPT"
                      accept=".ppt,.pptx"
                      onFile={setFile}
                    />
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-700">
                        Upload Images (Language-wise)
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LanguageFileInput
                          label="Telugu Image"
                          preview={imagePreviews.telugu}
                          onFile={(f) => {
                            setFiles((p) => ({ ...p, telugu: f }));
                            setImagePreviews((p) => ({
                              ...p,
                              telugu: URL.createObjectURL(f),
                            }));
                          }}
                        />

                        <LanguageFileInput
                          label="Marathi Image"
                          preview={imagePreviews.marathi}
                          onFile={(f) => {
                            setFiles((p) => ({ ...p, marathi: f }));
                            setImagePreviews((p) => ({
                              ...p,
                              marathi: URL.createObjectURL(f),
                            }));
                          }}
                        />

                        <LanguageFileInput
                          label="Kannada Image"
                          preview={imagePreviews.kannada}
                          onFile={(f) => {
                            setFiles((p) => ({ ...p, kannada: f }));
                            setImagePreviews((p) => ({
                              ...p,
                              kannada: URL.createObjectURL(f),
                            }));
                          }}
                        />

                        <LanguageFileInput
                          label="Gujarati Image"
                          preview={imagePreviews.gujarati}
                          onFile={(f) => {
                            setFiles((p) => ({ ...p, gujarati: f }));
                            setImagePreviews((p) => ({
                              ...p,
                              gujarati: URL.createObjectURL(f),
                            }));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div class="text-center">
              <button className="p-4 py-4 mb-2 bg-slate-900 text-white rounded-xl font-bold">
                {isEditing ? "SAVE CHANGES" : "ADD RESOURCE"}
              </button>
            </div>
          </form>
        </div>
      )}

      {successOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <Plus className="text-emerald-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              Success
            </h3>

            <p className="text-slate-500">
              {successMessage}
            </p>

            <button
              onClick={() => setSuccessOpen(false)}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
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
              Delete Resource?
            </h3>

            <p className="text-slate-500">
              Are you sure want to delete this Resource?
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

      {/* READ MORE MODAL */}
      {viewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white max-w-lg w-full rounded-3xl p-8 relative">
            <button
              onClick={() => setViewing(null)}
              className="absolute top-5 right-5"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-1">{viewing.title}</h2>

            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {viewing.category}
            </span>

            {viewing.material_type && (
              <p className="text-sm text-gray-500 mt-2">
                {viewing.material_type}
              </p>
            )}

            <p className="mt-4 text-gray-700 whitespace-pre-line">
              {viewing.detailed_description || viewing.description}
            </p>

            {/* ACTIONS */}
            <div className="mt-6 flex gap-4">
              {viewing.video_url && (
                <a
                  href={viewing.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  ▶ Watch Now
                </a>
              )}

              {viewing.file_url && (
                <a
                  href={viewing.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- REUSABLE ---------------- */

function Input({ label, value, onChange }) {
  return (
    <input
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-gray-50 rounded-xl"
      required
    />
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <textarea
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-gray-50 rounded-xl h-28"
      required
    />
  );
}

function FileInput({ label, accept, onFile }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;

          if (file.size > MAX_IMAGE_SIZE) {
            alert("❌ Image size must be less than 5 MB");
            e.target.value = "";
            return;
          }

          onFile(file);
        }}
        className="w-full mt-2"
      />
    </div>
  );
}

function LanguageFileInput({ label, onFile, preview }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-600">
        {label}
      </label>

      {preview && (
        <img
          src={preview}
          alt={label}
          className="h-32 w-full object-cover rounded-xl border"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFile(e.target.files[0])}
        className="w-full"
      />
    </div>
  );
}


