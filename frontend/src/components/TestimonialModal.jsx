import React from 'react';
import { X, Video, Image as ImageIcon, Loader2 } from 'lucide-react';

export function TestimonialModal({ 
    isOpen, 
    onClose, 
    onSubmit, // Changed from onSave to onSubmit to match Testimonials.jsx
    form, 
    setForm, 
    isEditing, 
    isViewMode,
    onFileChange,
    isLoading 
}) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // This was the error: calling onSave() when it should be onSubmit()
        onSubmit(e); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isViewMode ? 'View Story' : isEditing ? 'Edit Story' : 'Add New Story'}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            {isViewMode ? 'Details of the success story' : 'Share a new success story with the community'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Success Story Title</label>
                            <input
                                required
                                disabled={isViewMode}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 disabled:opacity-60"
                                placeholder="e.g. Bumper Harvest in Punjab"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Farmer Name</label>
                            <input
                                required
                                disabled={isViewMode}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 disabled:opacity-60"
                                placeholder="Enter name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        {/* Area */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Location / Area</label>
                            <input
                                required
                                disabled={isViewMode}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 disabled:opacity-60"
                                placeholder="City, State"
                                value={form.area}
                                onChange={(e) => setForm({ ...form, area: e.target.value })}
                            />
                        </div>

                        {/* Season */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Crop Season</label>
                            <select
                                required
                                disabled={isViewMode}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 disabled:opacity-60 appearance-none"
                                value={form.season}
                                onChange={(e) => setForm({ ...form, season: e.target.value })}
                            >
                                <option value="">Select Season</option>
                                <option value="Kharif">Kharif</option>
                                <option value="Rabi">Rabi</option>
                                <option value="Zaid">Zaid</option>
                            </select>
                        </div>

                        {/* Platform */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Platform</label>
                            <select
                                required
                                disabled={isViewMode}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 disabled:opacity-60 appearance-none"
                                value={form.platform}
                                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                            >
                                <option value="youtube">YouTube</option>
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                            </select>
                        </div>

                        {/* Video URL */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                <Video size={16} className="text-emerald-600" /> Video URL
                            </label>
                            <input
                                required
                                disabled={isViewMode}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 disabled:opacity-60"
                                placeholder="Paste YouTube or Video link"
                                value={form.videoUrl}
                                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                            />
                        </div>

                        {/* Image Upload */}
                        {!isViewMode && (
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-emerald-600" /> Cover Image
                                </label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onFileChange(e, 'imageSrc')}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                                    >
                                        {form.imageSrc ? (
                                            <img src={form.imageSrc} alt="Preview" className="h-32 rounded-lg shadow-sm" />
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon className="mx-auto text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" size={32} />
                                                <p className="text-sm text-slate-500 font-medium">Click to upload photo</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            Cancel
                        </button>
                        {!isViewMode && (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    'Save Story'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}