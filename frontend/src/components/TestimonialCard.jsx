import React from 'react';
import { MapPin, PlayCircle, Trash2 } from "lucide-react";

export const TestimonialCard = ({ testimonial, onDelete }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full text-left">
            <div className="relative aspect-video w-full bg-slate-900">
                <div className="absolute top-3 right-3 z-10 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-green-700 uppercase">
                    {testimonial.area}
                </div>
                <img src={testimonial.imageSrc} className="w-full h-full object-cover" alt="Farmer" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{testimonial.title}</h3>
                <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase flex items-center gap-1">
                    <MapPin size={12}/> {testimonial.area}
                </p>
                <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">"{testimonial.season}"</p>
                <div className="pt-3 border-t flex justify-between items-center">
                    <a href={testimonial.videoUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-black flex items-center gap-2 uppercase hover:text-green-600">
                        <PlayCircle size={16}/> Watch Video
                    </a>
                    <button onClick={() => onDelete(testimonial.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                        <Trash2 size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );
};