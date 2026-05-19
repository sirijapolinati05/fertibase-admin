import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    preview: {
        type: String,
        default: ''
    },
    desc: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: ''
    },
    responsibilities: {
        type: [String],
        default: []
    },
    requirements: {
        type: [String],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    tools: {
        type: [String],
        default: []
    },
    experience: {
        type: String,
        default: ''
    },
    salary: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    mode: {
        type: String,
        enum: ['On-site', 'Hybrid', 'Remote', 'Field'],
        default: 'On-site'
    },
    type: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship'],
        default: 'Full-Time'
    },
    positions: {
        type: Number,
        default: 1,
        min: 1
    },
    daysLeft: {
        type: Number,
        default: 30,
        min: 0
    },
    niceToHave: {
        type: [String],
        default: []
    },
    applyNote: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Modern export for ES Modules
export default mongoose.model('Career', careerSchema);