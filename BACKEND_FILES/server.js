import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Crucial for reading form data

app.use(cors({
    origin: [
        "http://localhost:5173",        // local admin
        "http://localhost:5174",        // local admin (alternate port)
        "https://admin.fertibase.in",   // deployed admin
        "https://fertibase.in",
        "https://admin-backend.fertibase.in",
        "https://fertibase-admin.onrender.com"        // main site
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());


// Routes - These MUST match your frontend fetch calls exactly
app.use('/api/products', productRoutes);
app.use("/api/jobs", jobRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Dashboard Stats logic
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: jCount } = await supabase.from('Careers').select('*', { count: 'exact', head: true });
        const { count: tCount } = await supabase.from('testimonials').select('*', { count: 'exact', head: true });

        res.json({
            totalProducts: pCount || 0,
            totalJobs: jCount || 0,
            totalTestimonials: tCount || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));