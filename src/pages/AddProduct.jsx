// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";

// const API = "https://admin-backend.fertibase.in/api/products/create";

// export default function AddProduct() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

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
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formData = new FormData();

//       formData.append("name", form.name);
//       formData.append("category", form.category);
//       formData.append("sub_category", form.sub_category);
//       formData.append("description", form.description);

//       // Arrays → JSON
//       formData.append("key_highlights", JSON.stringify(form.key_highlights.split("\n")));
//       formData.append("crop_benefits", JSON.stringify(form.crop_benefits.split("\n")));
//       formData.append("product_advantages", JSON.stringify(form.product_advantages.split("\n")));
//       formData.append("recommended_crops", JSON.stringify(form.recommended_crops.split("\n")));

//       formData.append("application_timing", form.application_timing);
//       formData.append("recommended_dosage", form.recommended_dosage);
//       formData.append("application_details", form.application_details);

//       if (form.image) formData.append("image", form.image);

//       const res = await fetch(API, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Failed to save product");

//       alert("✅ Product added successfully");
//       navigate("/admin/products");
//     } catch (err) {
//       alert("❌ " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-10 bg-[#f8fafc] min-h-screen">
//       <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-xs font-bold text-slate-400">
//         <ArrowLeft size={16} /> Back
//       </button>

//       <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] max-w-4xl mx-auto space-y-4 shadow-xl">
//         <h1 className="text-3xl font-black uppercase">Add Product</h1>

//         <input placeholder="Product Name" required className="input" value={form.name}
//           onChange={e => setForm({ ...form, name: e.target.value })} />

//         <input placeholder="Category" className="input"
//           onChange={e => setForm({ ...form, category: e.target.value })} />

//         <input placeholder="Sub Category" className="input"
//           onChange={e => setForm({ ...form, sub_category: e.target.value })} />

//         <textarea placeholder="Description" className="input h-24"
//           onChange={e => setForm({ ...form, description: e.target.value })} />

//         <textarea placeholder="Key Highlights (one per line)" className="input h-24"
//           onChange={e => setForm({ ...form, key_highlights: e.target.value })} />

//         <textarea placeholder="Crop Benefits (one per line)" className="input h-24"
//           onChange={e => setForm({ ...form, crop_benefits: e.target.value })} />

//         <textarea placeholder="Product Advantages (one per line)" className="input h-24"
//           onChange={e => setForm({ ...form, product_advantages: e.target.value })} />

//         <textarea placeholder="Recommended Crops (one per line)" className="input h-24"
//           onChange={e => setForm({ ...form, recommended_crops: e.target.value })} />

//         <input placeholder="Application Timing" className="input"
//           onChange={e => setForm({ ...form, application_timing: e.target.value })} />

//         <input placeholder="Recommended Dosage" className="input"
//           onChange={e => setForm({ ...form, recommended_dosage: e.target.value })} />

//         <textarea placeholder="Application Details" className="input h-24"
//           onChange={e => setForm({ ...form, application_details: e.target.value })} />

//         <label className="flex items-center gap-2 font-bold text-sm">
//           <ImageIcon size={16} /> Product Image
//         </label>
//         <input type="file" accept="image/*"
//           onChange={e => setForm({ ...form, image: e.target.files[0] })} />

//         <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">
//           {loading ? "Saving..." : "SAVE PRODUCT"}
//         </button>
//       </form>
//     </div>
//   );
// }
