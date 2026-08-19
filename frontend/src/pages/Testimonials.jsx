import React, { useState, useEffect } from "react";
import { Trash2, Plus, X, Edit3, PlayCircle, Search, Image } from "lucide-react";

const API = `${import.meta.env.VITE_API_BASE_URL}/testimonials`;
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/static")) {
    const baseUrl = API_BASE.replace("/api", "");
    return `${baseUrl}${url}`;
  }
  return url;
};

const STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Maharashtra",
  "Gujarat",
];

export default function Testimonials() {
  const [list, setList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("All");
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);

  const [successOpen, setSuccessOpen] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

const [errorOpen, setErrorOpen] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [deletingId, setDeletingId] = useState(null);

  const emptyForm = {
    title: "",
    name: "",
    state: "",
    description: "",
    video_url: "",
    image_url: "", // 👈 keep existing image
    image: null,   // 👈 new image file
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|embed\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const filteredStories = list.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());

    const matchesState =
      filterState === "All" || item.state === filterState;

    return matchesSearch && matchesState;
  });

  const selectedStateLabel =
    filterState === "All" ? "all states" : filterState;

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleImageChange = (file) => {
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert("Image size should be less than 5MB");
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };


  const handleSubmit = async (e) => {
  e.preventDefault();

  const url = isEditing ? `${API}/${selectedId}` : API;
  const method = isEditing ? "PUT" : "POST";

  try {
    const fd = new FormData();

    fd.append("title", form.title);
    fd.append("name", form.name);
    fd.append("state", form.state);
    fd.append("description", form.description);
    fd.append("video_url", form.video_url);

    if (form.image) {
      fd.append("image", form.image);
    }

    const res = await fetch(url, {
      method,
      body: fd,
    });

    if (!res.ok) throw new Error("Failed to save story");

    setSuccessMessage(
      isEditing
        ? "Story updated successfully."
        : "Story published successfully."
    );
    setSuccessOpen(true);

    setModalOpen(false);
    setForm(emptyForm);
    setImagePreview(null);
    setIsEditing(false);
    setSelectedId(null);
    fetchStories();
  } catch (err) {
    setErrorMessage("Failed to save story. Please try again.");
    setErrorOpen(true);
  }
};

  const handleEdit = (item) => {
    setForm({
      title: item.title || "",
      name: item.name || "",
      state: item.state || "",
      description: item.description || "",
      video_url: item.video_url || "",
      image_url: item.image_url || "", // keep old image
      image: null, // no new image yet
    });

    setImagePreview(item.image_url || null);
    setSelectedId(item.id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
  setDeletingId(id);
  setDeleteConfirmOpen(true);
};

const confirmDelete = async () => {
  try {
    const res = await fetch(`${API}/${deletingId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error();

    setSuccessMessage("Story deleted successfully.");
    setSuccessOpen(true);

    fetchStories();
  } catch (err) {
    setErrorMessage("Failed to delete story.");
    setErrorOpen(true);
  } finally {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  }
};

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Farmer Stories
          </h1>
          <p className="text-slate-500 mt-2">
            Real experiences shared by farmers across states
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(false);
            setForm(emptyForm);
            setImagePreview(null);
            setModalOpen(true);
          }}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] transition hover:bg-emerald-700"
        >
          <Plus size={20} /> Add Story
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-5 mb-10 shadow-lg flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by title or farmer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-slate-900/20 outline-none"
          />
        </div>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="px-4 py-3 rounded-xl border bg-white"
        >
          <option value="All">All States</option>
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>


      {/* CARDS */}
      {/* CARDS */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-slate-500 font-semibold animate-pulse">
            Loading testimonials…
          </div>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="flex justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-3xl text-center max-w-xl">
            <h3 className="text-xl font-bold">
              No testimonials found
            </h3>
            <p className="mt-2 text-sm">
              There are no testimonials available in{" "}
              <span className="font-semibold">{selectedStateLabel}</span>.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredStories.map((item) => {
            const videoEmbed = getYouTubeEmbedUrl(item.video_url);

            return (
              <div
                key={item.id}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-xl transition group relative"
              >
                <div className="aspect-video relative">
                  <img
                    src={getImageUrl(item.image_url)}
                    className="w-full h-full object-cover"
                    alt=""
                  />

                  {videoEmbed && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <iframe
                        src={videoEmbed}
                        className="w-full h-full absolute inset-0"
                        allowFullScreen
                      />
                      <PlayCircle size={48} className="text-white z-10" />
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-3">
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    {item.state}
                  </span>

                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.name}</p>

                  <p className="italic text-slate-600 line-clamp-3">
                    “{item.description}”
                  </p>
                </div>

                <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-white rounded-xl shadow text-amber-500"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white rounded-xl shadow text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-[3rem] w-full max-w-xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setForm(emptyForm);
                setImagePreview(null);
                setIsEditing(false);
                setSelectedId(null);
              }}
              className="absolute top-6 right-6"
            >
              <X />
            </button>

            <h2 className="text-2xl font-black">
              {isEditing ? "Edit Story" : "New Story"}
            </h2>

            {/* IMAGE PREVIEW */}
            <div className="flex flex-col items-center gap-3">
              {(isEditing && (imagePreview || form.image_url)) || imagePreview ? (
                <img
                  src={imagePreview || getImageUrl(form.image_url)}
                  className="w-48 h-32 object-cover rounded-2xl border shadow"
                  alt="Preview"
                />
              ) : (
                <div className="w-48 h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Image />
                </div>
              )}

              <label className="cursor-pointer text-sm font-semibold text-slate-600">
                {isEditing ? "Change Image" : "Add Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                />
              </label>
            </div>

            <input
              placeholder="Title"
              className="w-full p-4 bg-slate-50 rounded-xl"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Farmer Name"
                className="p-4 bg-slate-50 rounded-xl"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <select
                className="p-4 bg-slate-50 rounded-xl"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              >
                <option value="">Select State</option>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <input
              placeholder="YouTube Video URL"
              className="w-full p-4 bg-slate-50 rounded-xl"
              value={form.video_url}
              onChange={(e) =>
                setForm({ ...form, video_url: e.target.value })
              }
            />

            <textarea
              placeholder="Story Description"
              className="w-full p-4 bg-slate-50 rounded-xl h-28"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-bold">
              {isEditing ? "SAVE CHANGES" : "PUBLISH STORY"}
            </button>
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
        Delete Story?
      </h3>

      <p className="text-slate-500">
        Are you sure want to delete this Testimonial?
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
