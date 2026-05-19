import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/* ================= GET ALL JOBS ================= */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Fetch Jobs Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET SINGLE JOB ================= */
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch {
    res.status(404).json({ message: "Job not found" });
  }
});

/* ================= CREATE JOB ================= */
router.post("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("Create Job Error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

/* ================= UPDATE JOB ================= */
router.put("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Update Job Error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

/* ================= DELETE JOB ================= */
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Delete Job Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
