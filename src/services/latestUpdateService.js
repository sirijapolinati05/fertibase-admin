import supabase from "../lib/supabaseClient";

export const fetchUpdates = async () => {
  return supabase
    .from("latest_updates")
    .select("*")
    .order("created_at", { ascending: false });
};

export const createUpdate = async (data) => {
  return supabase.from("latest_updates").insert(data);
};

export const toggleUpdateStatus = async (id, is_active) => {
  return supabase
    .from("latest_updates")
    .update({ is_active: !is_active })
    .eq("id", id);
};

export const deleteUpdate = async (id) => {
  return supabase
    .from("latest_updates")
    .delete()        // ⛔ permanent delete
    .eq("id", id);
};

export const updateUpdate = async (id, payload) => {
  const { data, error } = await supabase
    .from("latest_updates")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

