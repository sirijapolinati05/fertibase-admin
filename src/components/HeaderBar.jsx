import { Bell, UserCircle } from "lucide-react";

export default function HeaderBar() {
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <UserCircle className="text-gray-600" size={28} />
        </button>
      </div>
    </header>
  );
}
