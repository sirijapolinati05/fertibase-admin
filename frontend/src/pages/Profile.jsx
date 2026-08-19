import { useState } from "react";
import { User, Mail, Phone, Save } from "lucide-react";

export default function Profile() {
    const [form, setForm] = useState({
        name: "Fertibase Admin",
        email: "admin@fertibase.com",
        phone: "+91 8977729535",
        role: "Super Admin",
    });

    const handleSave = () => {
        // Later connect with API
        alert("Profile updated successfully!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Profile</h1>
                <p className="text-gray-500 mt-1">
                    Manage your personal account information
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border p-8 space-y-6">

                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
                        FA
                    </div>

                    <div>
                        <h2 className="text-xl font-bold">{form.name}</h2>
                        <p className="text-gray-500">{form.role}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className="w-full px-4 py-3 border rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Email</label>
                        <input
                            value={form.email}
                            disabled
                            className="w-full px-4 py-3 border rounded-xl bg-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Phone</label>
                        <input
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                            className="w-full px-4 py-3 border rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Role</label>
                        <input
                            value={form.role}
                            disabled
                            className="w-full px-4 py-3 border rounded-xl bg-gray-100"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
