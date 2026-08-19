import { useEffect, useState } from "react";
import {
  fetchUpdates,
  createUpdate,
  updateUpdate,
  toggleUpdateStatus,
  deleteUpdate,
} from "../services/latestUpdateService";
import { Plus, X, Search, Trash2, Edit3 } from "lucide-react";

export default function LatestUpdates() {
  const [updates, setUpdates] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    action_text: "",
    action_link: "",
  });

  /* ---------------- LOAD ---------------- */

  const loadUpdates = async () => {
    const { data, error } = await fetchUpdates();
    if (!error) setUpdates(data || []);
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  /* ---------------- OPEN EDIT ---------------- */

  const handleEdit = (update) => {
    setForm({
      title: update.title || "",
      message: update.message || "",
      action_text: update.action_text || "",
      action_link: update.action_link || "",
    });

    setEditingId(update.id);
    setIsEditing(true);
    setModalOpen(true);
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.message) {
      setErrorMessage("Title and message are required.");
      setErrorOpen(true);
      return;
    }

    let result;

    if (isEditing) {
      result = await updateUpdate(editingId, form);
    } else {
      result = await createUpdate(form);
    }

    if (result.error) {
      setErrorMessage(result.error.message || "Failed to save update.");
      setErrorOpen(true);
    } else {
      setSuccessMessage(
        isEditing
          ? "Update edited successfully."
          : "Update published successfully."
      );
      setSuccessOpen(true);

      setForm({
        title: "",
        message: "",
        action_text: "",
        action_link: "",
      });

      setIsEditing(false);
      setEditingId(null);
      setModalOpen(false);
      loadUpdates();
    }
  };

  /* ---------------- DELETE ---------------- */

  const confirmDelete = async () => {
    if (!deleteId) return;

    const { error } = await deleteUpdate(deleteId);

    if (error) {
      setErrorMessage("Failed to delete update.");
      setErrorOpen(true);
    } else {
      setSuccessMessage("Update deleted successfully.");
      setSuccessOpen(true);
      loadUpdates();
    }

    setDeleteId(null);
  };

  /* ---------------- FILTER ---------------- */

  const filteredUpdates = updates.filter((u) => {
    const matchesSearch =
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.message.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && u.is_active) ||
      (filter === "Inactive" && !u.is_active);

    return matchesSearch && matchesFilter;
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Latest Updates
          </h1>
          <p className="text-slate-500 mt-1">
            Manage announcements shown on the website
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(false);
            setEditingId(null);
            setForm({
              title: "",
              message: "",
              action_text: "",
              action_link: "",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow hover:scale-[1.02] transition hover:bg-emerald-700"
        >
          <Plus size={18} /> Publish Update
        </button>
      </div>

      {/* UPDATES LIST */}
      <div className="space-y-4">
        {filteredUpdates.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-2xl border shadow-sm p-6 flex justify-between items-center hover:shadow-md transition"
          >
            <div className="space-y-1">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${u.is_active
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                  }`}
              >
                {u.is_active ? "Active" : "Inactive"}
              </span>

              <h3 className="text-lg font-bold text-slate-900">
                {u.title}
              </h3>
              <p className="text-slate-600">{u.message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  toggleUpdateStatus(u.id, u.is_active).then(loadUpdates)
                }
                className={`px-5 py-2 rounded-xl font-bold text-white ${u.is_active
                    ? "bg-red-600"
                    : "bg-emerald-600"
                  }`}
              >
                {u.is_active ? "Disable" : "Activate"}
              </button>

              {/* EDIT */}
              <button
                onClick={() => handleEdit(u)}
                className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Edit3 size={18} />
              </button>

              {/* DELETE */}
              <button
                onClick={() => setDeleteId(u.id)}
                className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredUpdates.length === 0 && (
          <div className="text-center text-slate-400 py-16">
            <p className="font-semibold">No updates found</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6"
            >
              <X />
            </button>

            <h2 className="text-2xl font-black">
              {isEditing ? "Edit Update" : "Publish Update"}
            </h2>

            <input
              placeholder="Title"
              className="w-full p-4 bg-slate-50 rounded-xl"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Message"
              className="w-full p-4 bg-slate-50 rounded-xl h-28"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              required
            />

            <input
              placeholder="Button Text (optional)"
              className="w-full p-4 bg-slate-50 rounded-xl"
              value={form.action_text}
              onChange={(e) =>
                setForm({ ...form, action_text: e.target.value })
              }
            />

            <input
              placeholder="Button Link (optional)"
              className="w-full p-4 bg-slate-50 rounded-xl"
              value={form.action_link}
              onChange={(e) =>
                setForm({ ...form, action_link: e.target.value })
              }
            />

            <button className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-bold">
              {isEditing ? "Save Changes" : "Publish Update"}
            </button>
          </form>
        </div>
      )}
      {/* SUCCESS MODAL */}
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

      {/* ERROR MODAL */}
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-fadeIn">

            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="text-red-600" size={28} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Delete Update?
              </h3>
              <p className="text-slate-500 mt-2 text-sm">
                Are you sure you want to delete this update?
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
