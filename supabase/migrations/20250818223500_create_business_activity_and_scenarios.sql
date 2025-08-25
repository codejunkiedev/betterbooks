-- Create business_activity table
CREATE TABLE IF NOT EXISTS public.business_activity (
    id SERIAL PRIMARY KEY,
    sr INT UNIQUE NOT NULL,
    business_activity VARCHAR(100) NOT NULL,
    sector VARCHAR(200) NOT NULL
);

-- Create scenario table
CREATE TABLE IF NOT EXISTS public.scenario (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.business_activity_scenario (
    business_activity_id INT NOT NULL REFERENCES public.business_activity(id) ON DELETE CASCADE,
    scenario_id INT NOT NULL REFERENCES public.scenario(id) ON DELETE CASCADE,
    PRIMARY KEY (business_activity_id, scenario_id)
);

-- Seed scenarios (idempotent)
INSERT INTO public.scenario (code) VALUES
('SN001'),
('SN002'),
('SN003'),
('SN004'),
('SN005'),
('SN006'),
('SN007'),
('SN008'),
('SN009'),
('SN010'),
('SN011'),
('SN012'),
('SN013'),
('SN014'),
('SN015'),
('SN016'),
('SN017'),
('SN018'),
('SN019'),
('SN020'),
('SN021'),
('SN022'),
('SN023'),
('SN024'),
('SN025'),
('SN026'),
('SN027'),
('SN028')
ON CONFLICT (code) DO NOTHING;

-- Seed business activities (idempotent via unique sr)
INSERT INTO public.business_activity (sr, business_activity, sector) VALUES
(1, 'Manufacturer', 'All Other Sectors'),
(2, 'Manufacturer', 'Steel'),
(3, 'Manufacturer', 'FMCG'),
(4, 'Manufacturer', 'Textile'),
(5, 'Manufacturer', 'Telecom'),
(6, 'Manufacturer', 'Petroleum'),
(7, 'Manufacturer', 'Electricity Distribution'),
(8, 'Manufacturer', 'Gas Distribution'),
(9, 'Manufacturer', 'Services'),
(10, 'Manufacturer', 'Automobile'),
(11, 'Manufacturer', 'CNG Stations'),
(12, 'Manufacturer', 'Pharmaceuticals'),
(13, 'Manufacturer', 'Wholesale / Retails'),
(16, 'Importer', 'All Other Sectors'),
(17, 'Importer', 'Steel'),
(18, 'Importer', 'FMCG'),
(19, 'Importer', 'Textile'),
(20, 'Importer', 'Telecom'),
(21, 'Importer', 'Petroleum'),
(22, 'Importer', 'Electricity Distribution'),
(23, 'Importer', 'Gas Distribution'),
(24, 'Importer', 'Services'),
(25, 'Importer', 'Automobile'),
(26, 'Importer', 'CNG Stations'),
(27, 'Importer', 'Pharmaceuticals'),
(28, 'Importer', 'Wholesale / Retails'),
(31, 'Distributor', 'All Other Sectors'),
(32, 'Distributor', 'Steel'),
(33, 'Distributor', 'FMCG'),
(34, 'Distributor', 'Textile'),
(35, 'Distributor', 'Telecom'),
(36, 'Distributor', 'Petroleum'),
(37, 'Distributor', 'Electricity Distribution'),
(38, 'Distributor', 'Gas Distribution'),
(39, 'Distributor', 'Services'),
(40, 'Distributor', 'Automobile'),
(41, 'Distributor', 'CNG Stations'),
(42, 'Distributor', 'Pharmaceuticals'),
(43, 'Distributor', 'Wholesale / Retails'),
(46, 'Wholesaler', 'All Other Sectors'),
(47, 'Wholesaler', 'Steel'),
(48, 'Wholesaler', 'FMCG'),
(49, 'Wholesaler', 'Textile'),
(50, 'Wholesaler', 'Telecom'),
(51, 'Wholesaler', 'Petroleum'),
(52, 'Wholesaler', 'Electricity Distribution'),
(53, 'Wholesaler', 'Gas Distribution'),
(54, 'Wholesaler', 'Services'),
(55, 'Wholesaler', 'Automobile'),
(56, 'Wholesaler', 'CNG Stations'),
(57, 'Wholesaler', 'Pharmaceuticals'),
(58, 'Wholesaler', 'Wholesale / Retails'),
(61, 'Exporter', 'All Other Sectors'),
(62, 'Exporter', 'Steel'),
(63, 'Exporter', 'FMCG'),
(64, 'Exporter', 'Textile'),
(65, 'Exporter', 'Telecom'),
(66, 'Exporter', 'Petroleum'),
(67, 'Exporter', 'Electricity Distribution'),
(68, 'Exporter', 'Gas Distribution'),
(69, 'Exporter', 'Services'),
(70, 'Exporter', 'Automobile'),
(71, 'Exporter', 'CNG Stations'),
(72, 'Exporter', 'Pharmaceuticals'),
(73, 'Exporter', 'Wholesale / Retails'),
(76, 'Retailer', 'All Other Sectors'),
(77, 'Retailer', 'Steel'),
(78, 'Retailer', 'FMCG'),
(79, 'Retailer', 'Textile'),
(80, 'Retailer', 'Telecom'),
(81, 'Retailer', 'Petroleum'),
(82, 'Retailer', 'Electricity Distribution'),
(83, 'Retailer', 'Gas Distribution'),
(84, 'Retailer', 'Services'),
(85, 'Retailer', 'Automobile'),
(86, 'Retailer', 'CNG Stations'),
(87, 'Retailer', 'Pharmaceuticals'),
(88, 'Retailer', 'Wholesale / Retails'),
(91, 'Service Provider', 'All Other Sectors'),
(92, 'Service Provider', 'Steel'),
(93, 'Service Provider', 'FMCG'),
(94, 'Service Provider', 'Textile'),
(95, 'Service Provider', 'Telecom'),
(96, 'Service Provider', 'Petroleum'),
(97, 'Service Provider', 'Electricity Distribution'),
(98, 'Service Provider', 'Gas Distribution'),
(99, 'Service Provider', 'Services'),
(100, 'Service Provider', 'Automobile'),
(101, 'Service Provider', 'CNG Stations'),
(102, 'Service Provider', 'Pharmaceuticals'),
(103, 'Service Provider', 'Wholesale / Retails'),
(106, 'Other', 'All Other Sectors'),
(107, 'Other', 'Steel'),
(108, 'Other', 'FMCG'),
(109, 'Other', 'Textile'),
(110, 'Other', 'Telecom'),
(111, 'Other', 'Petroleum'),
(112, 'Other', 'Electricity Distribution'),
(113, 'Other', 'Gas Distribution'),
(114, 'Other', 'Services'),
(115, 'Other', 'Automobile'),
(116, 'Other', 'CNG Stations'),
(117, 'Other', 'Pharmaceuticals'),
(118, 'Other', 'Wholesale / Retails')
ON CONFLICT (sr) DO NOTHING;

-- Seed relationships (idempotent)
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 1 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 2 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 2 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 2 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 3 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 4 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 5 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 6 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 7 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 8 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 9 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 10 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 11 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 12 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 13 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 16 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 17 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 18 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 19 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 20 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 21 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 22 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 23 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 24 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 25 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 26 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 27 AND s.code = 'SN025' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 28 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
-- Continue distributor/wholesaler/retailer/service provider/other mappings
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 31 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 32 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 32 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 32 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 32 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 32 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 32 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 32 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 33 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 33 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 33 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 33 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 33 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 34 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 34 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 34 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 34 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 34 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 35 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 35 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 35 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 35 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 35 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 36 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 36 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 36 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 36 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 36 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 37 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 37 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 37 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 37 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 37 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 38 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 38 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 38 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 38 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 38 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 39 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 39 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 39 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 39 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 39 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 39 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 40 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 40 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 40 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 40 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 40 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 41 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 41 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 41 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 41 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 41 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 42 AND s.code = 'SN025' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 42 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 42 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 42 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 42 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 43 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 43 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 43 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 43 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 43 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 43 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
-- Wholesaler (46-58)
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 46 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 47 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 47 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 47 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 47 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 47 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 47 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 47 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 48 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 48 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 48 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 48 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 48 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 49 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 49 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 49 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 49 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 49 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 50 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 50 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 50 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 50 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 50 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 51 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 51 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 51 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 51 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 51 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 52 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 52 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 52 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 52 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 52 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 53 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 53 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 53 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 53 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 53 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 54 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 54 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 54 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 54 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 54 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 54 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 55 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 55 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 55 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 55 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 55 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 56 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 56 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 56 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 56 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 56 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 57 AND s.code = 'SN025' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 57 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 57 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 57 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 57 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 58 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 58 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 58 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 58 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 58 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 58 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
-- Exporter (61-73)
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 61 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 62 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 63 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 64 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 65 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 66 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 67 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 68 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 69 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 70 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 71 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 72 AND s.code = 'SN025' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 73 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
-- Retailer (76-88)
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 76 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 77 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 77 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 77 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 78 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 78 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 78 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 78 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 79 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 79 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 79 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 79 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 79 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 80 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 80 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 80 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 80 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 80 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 81 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 81 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 81 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 81 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 81 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 82 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 82 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 82 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 82 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 82 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 83 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 83 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 83 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 83 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 83 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 84 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 84 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 84 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 84 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 84 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 84 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 85 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 85 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 85 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 85 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 85 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 86 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 86 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 86 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 86 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 86 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 87 AND s.code = 'SN025' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 87 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 87 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 87 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 87 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 88 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 88 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 88 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 88 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
-- Service Provider (91-103)
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 91 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 92 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 92 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 92 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 92 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 92 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 93 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 93 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 93 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 94 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 94 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 94 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 95 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 95 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 95 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 96 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 96 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 96 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 97 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 97 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 97 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 98 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 98 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 98 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 99 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 99 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 100 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 100 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 100 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 101 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 101 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 101 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 102 AND s.code = 'SN025' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 102 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 102 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 103 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 103 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 103 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 103 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 103 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 103 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
-- Other (106-118)
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 106 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN003' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN004' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 107 AND s.code = 'SN011' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 108 AND s.code = 'SN008' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 109 AND s.code = 'SN009' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 110 AND s.code = 'SN010' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 111 AND s.code = 'SN012' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 112 AND s.code = 'SN013' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 113 AND s.code = 'SN014' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN018' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 114 AND s.code = 'SN019' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 115 AND s.code = 'SN020' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 116 AND s.code = 'SN023' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_ACTIVITY b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 117 AND s.code = 'SN025' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN001' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN002' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN005' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN006' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN007' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN015' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN016' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN017' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN021' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN022' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN024' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN026' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN027' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN028' ON CONFLICT DO NOTHING;
INSERT INTO public.business_activity_scenario (business_activity_id, scenario_id)
SELECT b.id, s.id FROM public.business_activity b, public.scenario s WHERE b.sr = 118 AND s.code = 'SN008' ON CONFLICT DO NOTHING; 