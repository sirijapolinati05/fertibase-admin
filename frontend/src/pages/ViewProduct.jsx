import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Package, Droplets, Box, MapPin, IndianRupee } from "lucide-react";
import productService from "../services/productService";

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // Fetches the specific product you clicked on
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Product Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 font-bold">Product not found in database.</p>
        <button onClick={() => navigate("/admin/productlist")} className="mt-4 text-blue-600 underline">Return to List</button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] mb-8 hover:text-slate-900 transition-all"
        >
          <ArrowLeft size={16} /> Back to Management
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Left Side: Image */}
            <div className="w-full md:w-2/5 bg-slate-100 flex items-center justify-center p-12 border-r border-slate-50">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-auto rounded-3xl shadow-lg object-cover aspect-square"
                  onError={(e) => { e.target.src = "https://placehold.co/600x600?text=No+Image"; }}
                />
              ) : (
                <Package size={120} className="text-slate-300" />
              )}
            </div>

            {/* Right Side: Data */}
            <div className="flex-1 p-8 md:p-12 space-y-8">
              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {product.category || "Fertilizer"}
                </span>
                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mt-4">
                  {product.name}
                </h1>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <IndianRupee size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Price</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">₹{product.price}</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Origin</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">{product.state_origin || "Not Set"}</p>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100/50">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <Box size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pack Size</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">{product.pack_size || "Not Set"}</p>
                </div>

                <div className="bg-amber-50/50 p-5 rounded-[2rem] border border-amber-100/50">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Droplets size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dosage</span>
                  </div>
                  <p className="text-lg font-bold text-amber-900">{product.dosage || "Not Set"}</p>
                </div>
              </div>

              {/* Text Areas */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">How it works</h3>
                  <p className="text-slate-600 leading-relaxed font-medium italic">
                    {product.how_it_works || "No description provided."}
                  </p>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Benefits</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {product.key_benefits || "No benefits listed."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}