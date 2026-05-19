// 1. Change 'require' to 'import' and add the .js extension
import Career from '../models/Career.js';

// 2. Change 'exports.name' to 'export const name' for all functions
export const getCareers = async (req, res) => {
    try {
        const careers = await Career.find().sort({ createdAt: -1 });
        res.status(200).json(careers);
    } catch (error) {
        console.error('Error fetching careers:', error);
        res.status(500).json({ message: 'Server error while fetching careers', error: error.message });
    }
};

export const getCareer = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) {
            return res.status(404).json({ message: 'Career not found' });
        }
        res.status(200).json(career);
    } catch (error) {
        console.error('Error fetching career:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Career not found' });
        }   
        res.status(500).json({ message: 'Server error while fetching career', error: error.message });
    }
};

export const createCareer = async (req, res) => {
    try {
        const careerData = req.body;

        // Simplified validation: Check if essential fields exist
        if (!careerData.category || !careerData.title || !careerData.location) {
            return res.status(400).json({ message: 'Category, Title, and Location are required' });
        }

        const career = new Career(careerData);
        const savedCareer = await career.save();
        res.status(201).json(savedCareer);
    } catch (error) {
        console.error('Error creating career:', error);
        res.status(500).json({ message: 'Server error while creating career', error: error.message });
    }
};

export const updateCareer = async (req, res) => {
    try {
        const data = req.body;
        const career = await Career.findById(req.params.id);
        
        if (!career) {
            return res.status(404).json({ message: 'Career not found' });
        }

        // Object.assign updates all fields provided in the request body
        Object.assign(career, data);

        const updatedCareer = await career.save();
        res.status(200).json(updatedCareer);
    } catch (error) {
        console.error('Error updating career:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Career not found' });
        }
        res.status(500).json({ message: 'Server error while updating career', error: error.message });
    }
};

export const deleteCareer = async (req, res) => {
    try {
        const career = await Career.findByIdAndDelete(req.params.id);
        if (!career) {
            return res.status(404).json({ message: 'Career not found' });
        }
        res.status(200).json({ message: 'Career deleted successfully', id: req.params.id });
    } catch (error) {
        console.error('Error deleting career:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Career not found' });
        }
        res.status(500).json({ message: 'Server error while deleting career', error: error.message });
    }
};