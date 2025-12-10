-- Migration: Fix broken lordicon URLs in categories table
-- This updates any invalid/broken lordicon URLs to working ones

-- First, fix specific broken URLs that are known to cause 404 errors
UPDATE categories SET icon = 'https://cdn.lordicon.com/hvueufdo.json' 
WHERE icon LIKE '%hvueufoo%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/ghhwiltn.json' 
WHERE icon LIKE '%tosheef%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/ofwpzftr.json' 
WHERE icon LIKE '%nveuefoo%';

-- Update categories with known category names to appropriate icons
UPDATE categories SET icon = 'https://cdn.lordicon.com/qhviklyi.json' 
WHERE LOWER(name) LIKE '%keuangan%' OR LOWER(name) LIKE '%budget%' OR LOWER(name) LIKE '%finance%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/fjvfsqea.json' 
WHERE LOWER(name) LIKE '%bisnis%' OR LOWER(name) LIKE '%business%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/vduvxizq.json' 
WHERE LOWER(name) LIKE '%produktivitas%' OR LOWER(name) LIKE '%productivity%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/oegrrprk.json' 
WHERE LOWER(name) LIKE '%lifestyle%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/kipaqhoz.json' 
WHERE LOWER(name) LIKE '%pendidikan%' OR LOWER(name) LIKE '%education%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/vfzqittk.json' 
WHERE LOWER(name) LIKE '%kesehatan%' OR LOWER(name) LIKE '%health%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/gqdnbnwt.json' 
WHERE LOWER(name) LIKE '%proyek%' OR LOWER(name) LIKE '%project%' OR LOWER(name) LIKE '%analitik%' OR LOWER(name) LIKE '%analytics%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/nlzvfogq.json' 
WHERE LOWER(name) LIKE '%inventory%' OR LOWER(name) LIKE '%stok%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/yxyampao.json' 
WHERE LOWER(name) LIKE '%penjualan%' OR LOWER(name) LIKE '%sales%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/uvqnvwbl.json' 
WHERE LOWER(name) LIKE '%marketing%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/hrjifpbq.json' 
WHERE LOWER(name) LIKE '%hr%' OR LOWER(name) LIKE '%sdm%';

UPDATE categories SET icon = 'https://cdn.lordicon.com/wcjauznf.json' 
WHERE LOWER(name) LIKE '%gratis%' OR LOWER(name) LIKE '%free%';

-- Set default icon for any remaining categories with NULL or broken icons
-- Default icon is a grid/category icon
UPDATE categories SET icon = 'https://cdn.lordicon.com/ofwpzftr.json' 
WHERE icon IS NULL 
   OR icon = '' 
   OR icon NOT LIKE 'https://cdn.lordicon.com/%.json';

-- List of valid lordicon URLs that are known to work (for reference):
-- https://cdn.lordicon.com/ofwpzftr.json (grid/default)
-- https://cdn.lordicon.com/qhviklyi.json (finance/budgeting)
-- https://cdn.lordicon.com/fjvfsqea.json (business)
-- https://cdn.lordicon.com/vduvxizq.json (productivity)
-- https://cdn.lordicon.com/oegrrprk.json (lifestyle)
-- https://cdn.lordicon.com/ghhwiltn.json (spreadsheet)
-- https://cdn.lordicon.com/hvueufdo.json (sparkles)
-- https://cdn.lordicon.com/wcjauznf.json (gift/free)
