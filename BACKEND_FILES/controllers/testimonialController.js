import { supabase } from '../server.js';

// Get all testimonials
export const getTestimonials = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new testimonial
export const createTestimonial = async (req, res) => {
    try {
        const { title, name, videoUrl, imageSrc, area, season } = req.body;
        const { data, error } = await supabase
            .from('testimonials')
            .insert([{ 
                title, 
                name, 
                video_url: videoUrl, 
                image_src: imageSrc, 
                area, 
                season 
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a testimonial
export const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('testimonials')
            .update(req.body)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};