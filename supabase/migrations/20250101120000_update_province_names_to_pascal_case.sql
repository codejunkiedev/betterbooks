-- Update province names to Pascal case
UPDATE public.province_codes 
SET state_province_desc = CASE 
    WHEN state_province_code = 2 THEN 'Balochistan'
    WHEN state_province_code = 4 THEN 'Azad Jammu And Kashmir'
    WHEN state_province_code = 5 THEN 'Capital Territory'
    WHEN state_province_code = 6 THEN 'Khyber Pakhtunkhwa'
    WHEN state_province_code = 7 THEN 'Punjab'
    WHEN state_province_code = 8 THEN 'Sindh'
    WHEN state_province_code = 9 THEN 'Gilgit Baltistan'
    ELSE state_province_desc
END
WHERE state_province_code IN (2, 4, 5, 6, 7, 8, 9);
