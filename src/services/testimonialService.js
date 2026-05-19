const API = `${import.meta.env.VITE_API_BASE_URL}/testimonials`;

export const getTestimonials = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createTestimonial = async (form) => {
  const fd = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (value !== null) fd.append(key, value);
  });

  const res = await fetch(API, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

export const updateTestimonial = async (id, form) => {
  const fd = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (value !== null) fd.append(key, value);
  });

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    body: fd,
  });

  return res.json();
};

export const deleteTestimonial = async (id) => {
  await fetch(`${API}/${id}`, { method: "DELETE" });
};
