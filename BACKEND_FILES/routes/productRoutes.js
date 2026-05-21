import express from "express";
import { upload } from "../middlewares/upload.js";
import { uploadProductImage } from "../utils/uploadToSupabase.js";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/* =======================
   HELPER: SAFE ARRAY PARSE
======================= */
const safeParseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  return value
    .split("\n")
    .map(v => v.trim())
    .filter(Boolean);
};

/* =======================
   GET ALL PRODUCTS
======================= */
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const start = offset;
  const end = offset + limit - 1;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .range(start, end);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

/* =======================
   GET ONE PRODUCT
======================= */
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Product not found" });
  res.json(data);
});

/* =======================
   CREATE PRODUCT
======================= */
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = null;

    // ✅ Extra safety check (optional but good)
    if (req.file && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: "Image size should be less than 5MB",
      });
    }

    if (req.file) {
      imageUrl = await uploadProductImage(req.file);
    }

    const payload = {
      name: req.body.name,
      category: req.body.category,
      sub_category: req.body.sub_category,
      description: req.body.description,

      key_highlights: safeParseArray(req.body.key_highlights),
      crop_benefits: safeParseArray(req.body.crop_benefits),
      product_advantages: safeParseArray(req.body.product_advantages),
      recommended_crops: safeParseArray(req.body.recommended_crops),

      application_timing: req.body.application_timing,
      recommended_dosage: req.body.recommended_dosage,
      application_details: req.body.application_details,

      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Create Product Error:", err);

    // ✅ Multer file-size error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Image size should be less than 5MB",
      });
    }

    res.status(500).json({ error: err.message });
  }
});


/* =======================
   UPDATE PRODUCT
======================= */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = req.body.image_url || null;

    if (req.file) {
      imageUrl = await uploadProductImage(req.file);
    }

    const payload = {
      name: req.body.name,
      category: req.body.category,
      sub_category: req.body.sub_category,
      description: req.body.description,

      key_highlights: safeParseArray(req.body.key_highlights),
      crop_benefits: safeParseArray(req.body.crop_benefits),
      product_advantages: safeParseArray(req.body.product_advantages),
      recommended_crops: safeParseArray(req.body.recommended_crops),

      application_timing: req.body.application_timing,
      recommended_dosage: req.body.recommended_dosage,
      application_details: req.body.application_details,

      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   DELETE PRODUCT
======================= */
router.delete("/:id", async (req, res) => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Deleted" });
});

export default router;
