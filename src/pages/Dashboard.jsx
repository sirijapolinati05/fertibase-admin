import React, { useState, useEffect } from "react";
import {
  Package,
  MessageSquare,
  Briefcase,
  Megaphone,
  BookOpen,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

export default function Dashboard() {
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [counts, setCounts] = useState({
    products: 0,
    stories: 0,
    jobs: 0,
    updates: 0,
    resources: 0,
  });

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [pRes, tRes, jRes] = await Promise.all([
        fetch(`${API_BASE}/products?limit=1000`),
        fetch(`${API_BASE}/testimonials`),
        fetch(`${API_BASE}/jobs`),
      ]);

      if (!pRes.ok || !tRes.ok || !jRes.ok) {
        throw new Error("API fetch failed");
      }

      const [p, t, j] = await Promise.all([
        pRes.json(),
        tRes.json(),
        jRes.json(),
      ]);

      const [{ count: updates }, { count: resources }] = await Promise.all([
        supabase.from("latest_updates").select("*", { count: "exact", head: true }),
        supabase.from("resources").select("*", { count: "exact", head: true }),
      ]);

      setCounts({
        products: p?.length || 0,
        stories: t?.length || 0,
        jobs: j?.length || 0,
        updates: updates || 0,
        resources: resources || 0,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  fetchData();
}, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-800">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Control, monitor and manage everything from one place.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-8 mb-16">
        <StatCard
          label="Products"
          value={counts.products}
          icon={<Package />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          label="Stories"
          value={counts.stories}
          icon={<MessageSquare />}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          label="Jobs"
          value={counts.jobs}
          icon={<Briefcase />}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          label="Updates"
          value={counts.updates}
          icon={<Megaphone />}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          label="Resources"
          value={counts.resources}
          icon={<BookOpen />}
          gradient="from-indigo-500 to-indigo-600"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-8">
          🚀 Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <ActionCard
            label="Add Product"
            icon={<Package />}
            onClick={() => navigate("/admin/productlist")}
          />
          <ActionCard
            label="Add Job"
            icon={<Briefcase />}
            onClick={() => navigate("/admin/jobs")}
          />
          <ActionCard
            label="Add Testimonial"
            icon={<MessageSquare />}
            onClick={() => navigate("/admin/testimonials")}
          />
          <ActionCard
            label="Add Update"
            icon={<Megaphone />}
            onClick={() => navigate("/admin/latest-updates")}
          />
          <ActionCard
            label="Add Resource"
            icon={<BookOpen />}
            onClick={() => navigate("/admin/resources")}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ label, value, icon, gradient }) {
  return (
    <div
      className={`
        bg-gradient-to-br ${gradient}
        text-white rounded-3xl p-6 shadow-lg
        hover:scale-[1.03] transition-transform
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 tracking-wider uppercase">
            {label}
          </p>
          <h2 className="text-4xl font-black mt-2">{value}</h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          {React.cloneElement(icon, { size: 26 })}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        group bg-white rounded-3xl p-6 shadow-sm
        border border-slate-100
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        flex flex-col items-center justify-center gap-4
      "
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-slate-900 flex items-center justify-center transition">
        {React.cloneElement(icon, {
          size: 26,
          className: "group-hover:text-white text-slate-700 transition",
        })}
      </div>

      <span className="font-semibold text-slate-700 group-hover:text-slate-900">
        {label}
      </span>

      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Plus size={14} /> Create
      </div>
    </button>
  );
}