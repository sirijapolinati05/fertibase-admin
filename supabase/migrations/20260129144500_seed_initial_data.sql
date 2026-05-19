insert into public.latest_updates
(id, title, message, action_text, action_link, is_active, created_at)
values
('4f449529-6745-4013-a4df-d7f415ec0e7d', 'Latest update', 'our website is releasing soon', 'learn more', 'http://localhost:5174/fertibaseadmin/', false, '2026-01-22 14:27:23.986859+00'),
('6dbc4099-7751-4cf6-b257-48072280a75a', 'Latest update', 'this is the latest update', 'Learn more', 'http://localhost:5174/fertibaseadmin/', false, '2026-01-19 11:52:48.294349+00');

insert into public.jobs
(id, created_at, title, category, type, mode, location, experience, description,
 responsibilities, requirements, skills, tools, short_preview, application_note,
 nice_to_have, days_left, salary_range, positions)
values
(5, '2026-01-13 07:04:40+00', 'Agricultural Research Scientist', 'Research & Development',
 'Full-Time', 'On-site', 'Bangalore,India', '3+ years', '',
 '[""]', '["Good communication skills"]',
 '["Microbiology","Research Methodology","Data Analysis"]', '[]',
 '', '', '[]', 30, '4-8', 15);

