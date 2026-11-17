-- Replace the placeholder "Managing Partner" profile with the firm's real
-- team (inserted by the seed that runs after this migration). Only removes
-- the placeholder if nobody has edited it yet.
DELETE FROM team_members WHERE slug = 'managing-partner' AND biography LIKE '%Profile to be completed%';
