const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

/* ================= GET ALL JOBS ================= */
export const getJobs = async () => {
  const res = await fetch(`${API_BASE_URL}/jobs`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
};

/* ================= GET SINGLE JOB ================= */
export const getJobById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
  if (!res.ok) throw new Error("Failed to fetch job");
  return res.json();
};

/* ================= CREATE JOB ================= */
export const createJob = async (jobData) => {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create job");
  return data;
};

/* ================= UPDATE JOB ================= */
export const updateJob = async (id, jobData) => {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update job");
  return data;
};

/* ================= DELETE JOB ================= */
export const deleteJob = async (id) => {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete job");
};
