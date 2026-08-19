// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, Save, Loader2 } from "lucide-react";

// const API = "https://admin-backend.fertibase.in/api/products";

// export default function EditProduct() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     sub_category: "",
//     description: "",
//     key_highlights: "",
//     crop_benefits: "",
//     product_advantages: "",
//     recommended_crops: "",
//     application_timing: "",
//     recommended_dosage: "",
//     application_details: "",
//     image: null,
//     image_url: "",
//   });

//   useEffect(() => {
//     fetch(`${API}/${id}`)
//       .then(res => res.json())
//       .then(data => {
//         setForm({
//           ...data,
//           key_highlights: (data.key_highlights || []).join("\n"),
//           crop_benefits: (data.crop_benefits || []).join("\n"),
//           product_advantages: (data.product_advantages || []).join("\n"),
//           recommended_crops: (data.recommended_crops || []).join("\n"),
//           image: null,
//         });
//         setLoading(false);
//       });
//   }, [id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     const formData = new FormData();
//     Object.entries(form).forEach(([k, v]) => {
//       if (v && k !== "image_url") formData.append(k, v);
//     });

//     formData.set("key_highlights", JSON.stringify(form.key_highlights.split("\n")));
//     formData.set("crop_benefits", JSON.stringify(form.crop_benefits.split("\n")));
//     formData.set("product_advantages", JSON.stringify(form.product_advantages.split("\n")));
//     formData.set("recommended_crops", JSON.stringify(form.recommended_crops.split("\n")));

//     const res = await fetch(`${API}/${id}`, {
//       method: "PUT",
//       body: formData,
//     });

//     if (res.ok) {
//       alert("✅ Product updated");
//       navigate("/admin/products");
//     } else {
//       alert("❌ Update failed");
//     }
//     setSaving(false);
//   };

//   if (loading) return <Loader2 className="animate-spin mx-auto mt-40" />;

//   return (
//     <div className="p-10 bg-[#f8fafc] min-h-screen">
//       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold mb-6">
//         <ArrowLeft size={16} /> Back
//       </button>

//       <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] max-w-4xl mx-auto space-y-4 shadow-xl">
//         <h1 className="text-3xl font-black">Edit Product</h1>

//         {form.image_url && (
//           <img src={form.image_url} className="w-40 rounded-xl" />
//         )}

//         <input type="file" onChange={e => setForm({ ...form, image: e.target.files[0] })} />

//         {/* Same inputs as AddProduct (omitted here for brevity but identical) */}

//         <button disabled={saving} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">
//           {saving ? "Updating..." : "SAVE CHANGES"}
//         </button>
//       </form>
//     </div>
//   );
// }
