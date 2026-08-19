import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

const API = `${import.meta.env.VITE_API_BASE_URL}/testimonials`;

export default function EditTestimonial() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  const [form, setForm] = useState({
    title: "",
    name: "",
    state: "",
    description: "",
    video_url: "",
    image_url: "",
    image: null,
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const res = await fetch(`${API}/${id}`);
        const data = await res.json();

        setForm({
          title: data.title ?? "",
          name: data.name ?? "",
          state: data.state ?? "",
          description: data.description ?? "",
          video_url: data.video_url ?? "",
          image_url: data.image_url ?? "",
          image: null,
        });
      } catch (err) {
        console.error("Failed to load testimonial", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonial();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("name", form.name);
      formData.append("state", form.state);
      formData.append("description", form.description);
      formData.append("video_url", form.video_url);

      if (form.image) {
        formData.append("image", form.image);
      }

      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      // ✅ Show popup ONLY
      setSuccessPopup(true);

    } catch (err) {
      alert("Failed to update testimonial");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin inline" />
      </div>
    );
  }

  //   useEffect(() => {
  //   if (successPopup) {
  //     const timer = setTimeout(() => {
  //       navigate("/admin/testimonials");
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [successPopup]);

  return (
    <>
      <div className="p-10 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-slate-400 font-bold uppercase text-[10px]"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <h1 className="text-3xl font-black uppercase mb-8">
            Edit Testimonial
          </h1>

          {/* IMAGE PREVIEW */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-lg">
                {form.image ? (
                  <img
                    src={URL.createObjectURL(form.image)}
                    className="w-full h-full object-cover"
                  />
                ) : form.image_url ? (
                  <img
                    src={form.image_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-6 text-slate-300" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                <ImageIcon size={14} />
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-600">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full mt-1 p-4 bg-slate-50 border rounded-2xl font-bold"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="p-4 bg-slate-50 border rounded-2xl"
                placeholder="Farmer Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="p-4 bg-slate-50 border rounded-2xl"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>

            <textarea
              className="w-full mt-1 p-4 bg-slate-50 border rounded-2xl h-32 resize-none"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {saving ? "Updating..." : "Update Testimonial"}
            </button>
          </form>
        </div>
      </div>

      {/* ✅ SUCCESS POPUP */}
      {successPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white px-10 py-8 rounded-3xl shadow-2xl text-center space-y-5 animate-scaleIn">

            <CheckCircle className="text-emerald-500 mx-auto" size={60} />

            <h2 className="text-2xl font-bold text-slate-800">
              Edit Successful!
            </h2>

            <p className="text-slate-500">
              Testimonial updated successfully.
            </p>

            <button
              onClick={() => navigate("/admin/testimonials")}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Back to Testimonials
            </button>

          </div>
        </div>
      )}
    </>
  );
}
