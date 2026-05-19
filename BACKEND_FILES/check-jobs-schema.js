import { supabase } from "./supabaseClient.js";

async function run() {
  const { data, error } = await supabase
    .from("jobs")
    .update({ status: "Open" })
    .eq("id", 2)
    .select();

  if (error) {
    console.error("Error trying to update status:", error);
  } else {
    console.log("Success:", data);
  }
}
run();
