import { Link, Outlet } from "react-router-dom";
import { Package, PlusCircle, Home } from "lucide-react";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold text-[#741A1C] mb-8">
          Fertibase Admin
        </h1>

        <nav className="space-y-3">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-gray-700 hover:text-[#741A1C] font-medium"
          >
            <Home size={18} /> Dashboard
          </Link>

          <Link
            to="/admin/products"
            className="flex items-center gap-2 text-gray-700 hover:text-[#741A1C] font-medium"
          >
            <Package size={18} /> Products
          </Link>

          <Link
            to="/admin/add-product"
            className="flex items-center gap-2 text-gray-700 hover:text-[#741A1C] font-medium"
          >
            <PlusCircle size={18} /> Add Product
          </Link>
        </nav>
      </aside>

      {/* Right Section */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-16 bg-[#741A1C] flex items-center px-8 shadow-md">
          <h2 className="text-white text-xl font-semibold">
            Admin Panel
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
