import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
    videoUrl: { // Field 5: Video
        type: String,
        required: [true, 'Video URL is required'],
        trim: true
    },
    imageSrc: { // Field 1: Image
        type: String,
        default: ''
    },
    title: { // Field 3: Title
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    name: { 
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    area: { // Field 4: State
        type: String,
        default: '',
        trim: true
    },
    platform: {
        type: String,
        enum: ['youtube', 'facebook', 'instagram', 'twitter'],
        default: 'youtube',
        lowercase: true
    },
    season: { // Field 2: Description
        type: String,
        default: '',
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Modern ES Module export
export default mongoose.model('Testimonial', testimonialSchema);