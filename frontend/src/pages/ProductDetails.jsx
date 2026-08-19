// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, Loader2 } from "lucide-react";
// import productService from "../services/productService";

// export default function ProductDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const data = await productService.getProductById(id);
//         setProduct(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProduct();
//   }, [id]);

//   if (loading)
//     return (
//       <div className="p-20 text-center">
//         <Loader2 className="animate-spin inline" /> Loading...
//       </div>
//     );

//   if (!product)
//     return <div className="p-10 text-center text-red-500">Product not found</div>;

//   const renderList = (arr) =>
//     Array.isArray(arr) && arr.length > 0 ? (
//       <ul className="list-disc ml-6 space-y-1">
//         {arr.map((item, i) => (
//           <li key={i}>{item}</li>
//         ))}
//       </ul>
//     ) : (
//       <p className="text-slate-400">Not specified</p>
//     );

//   return (
//     <div className="p-8 max-w-5xl mx-auto">
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center gap-2 mb-6 text-slate-500 font-bold"
//       >
//         <ArrowLeft size={18} /> BACK
//       </button>

//       <div className="bg-white rounded-3xl p-8 shadow border space-y-6">
//         {/* IMAGE */}
//         {product.image_url && (
//           <img
//             src={product.image_url}
//             alt={product.name}
//             className="w-full max-h-[350px] object-cover rounded-2xl"
//           />
//         )}

//         <div>
//           <p className="text-xs font-black text-emerald-600 uppercase">
//             Product Details
//           </p>
//           <h1 className="text-3xl font-bold uppercase">{product.name}</h1>
//           <p className="text-slate-500">
//             {product.category} · {product.sub_category}
//           </p>
//         </div>

//         {/* DESCRIPTION */}
//         <div>
//           <p className="section-title">Description</p>
//           <p>{product.description || "No description available"}</p>
//         </div>

//         <div>
//           <p className="section-title">Key Highlights</p>
//           {renderList(product.key_highlights)}
//         </div>

//         <div>
//           <p className="section-title">Crop Benefits</p>
//           {renderList(product.crop_benefits)}
//         </div>

//         <div>
//           <p className="section-title">Product Advantages</p>
//           {renderList(product.product_advantages)}
//         </div>

//         <div>
//           <p className="section-title">Recommended Crops</p>
//           {renderList(product.recommended_crops)}
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <p className="section-title">Application Timing</p>
//             <p>{product.application_timing || "Not specified"}</p>
//           </div>
//           <div>
//             <p className="section-title">Recommended Dosage</p>
//             <p>{product.recommended_dosage || "Not specified"}</p>
//           </div>
//         </div>

//         <div>
//           <p className="section-title">Application Details</p>
//           <p>{product.application_details || "Not specified"}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* helper tailwind class */
// const sectionTitle = "text-[10px] font-bold text-slate-400 uppercase mb-1";
