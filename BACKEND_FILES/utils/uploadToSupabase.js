import { supabase } from "../config/supabase.js";

export const uploadProductImage = async (file) => {
  const ext = file.originalname.split(".").pop();
  const fileName = `products/${Date.now()}.${ext}`;

  try {
    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.warn("⚠️ Supabase Storage upload failed. Falling back to Base64:", err.message);
    const base64Data = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64Data}`;
  }
};
