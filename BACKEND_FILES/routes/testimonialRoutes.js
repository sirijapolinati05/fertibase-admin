import express from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabaseClient.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // ✅ 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

/* ================= GET ALL ================= */
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

/* ================= CREATE ================= */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      name,
      state,
      description,
      video_url,
    } = req.body;

    let image_url = null;

    // ✅ Extra safety (optional)
    if (req.file && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: "Image size should be less than 5MB",
      });
    }

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${uuid()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("testimonials")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("testimonials")
        .getPublicUrl(fileName);

      image_url = data.publicUrl;
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert([
        {
          title,
          name,
          state,
          description,
          video_url,
          image_url,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Create testimonial error:", err);

    // ✅ Multer file-size error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Image size should be less than 5MB",
      });
    }

    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: "Image size should be less than 5MB",
      });
    }

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${uuid()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("testimonials")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("testimonials")
        .getPublicUrl(fileName);

      updates.image_url = data.publicUrl;
    }

    const { data, error } = await supabase
      .from("testimonials")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Update testimonial error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Image size should be less than 5MB",
      });
    }

    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  await supabase.from("testimonials").delete().eq("id", req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
