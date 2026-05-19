import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Fetch all jobs from Supabase
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('careers') // <--- MUST match your Supabase table name exactly
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: Create a new career/job
router.post('/create', async (req, res) => {
    try {
        if (!req.body.title || !req.body.category) {
            return res.status(400).json({ success: false, message: 'Title and Category are required' });
        }

        const jobData = {
            title: req.body.title,
            category: req.body.category,
            type: req.body.type || 'Full-Time',
            mode: req.body.mode || 'On-site',
            location: req.body.location || '',
            experience: req.body.experience || '',

            description: req.body.description || '',
            short_preview: req.body.short_preview || '',
            application_note: req.body.application_note || '',

            responsibilities: Array.isArray(req.body.responsibilities) ? req.body.responsibilities : [],
            requirements: Array.isArray(req.body.requirements) ? req.body.requirements : [],
            skills: Array.isArray(req.body.skills) ? req.body.skills : [],
            tools: Array.isArray(req.body.tools) ? req.body.tools : [],
            nice_to_have: Array.isArray(req.body.nice_to_have) ? req.body.nice_to_have : [],

            salary_range: req.body.salary_range || '',
            days_left: Number(req.body.days_left) || 30,
            positions: Number(req.body.positions) || 1,
        };

        const { data, error } = await supabase
            .from('careers')
            .insert([jobData])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, message: 'Career posted successfully', data });
    } catch (err) {
        console.error('Create Career Error:', err.message || err);
        res.status(500).json({ success: false, message: err.message || 'Failed to create career' });
    }
});

export default router;