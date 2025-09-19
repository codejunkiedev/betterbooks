-- Migration: Create business_activity table
-- This migration creates the original business_activity table that is referenced by user_business_activities

-- Create business_activity table
CREATE TABLE IF NOT EXISTS public.business_activity (
    id SERIAL PRIMARY KEY,
    sr INT UNIQUE NOT NULL,
    business_activity VARCHAR(100) NOT NULL,
    sector VARCHAR(200) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_activity_sr ON public.business_activity(sr);
CREATE INDEX IF NOT EXISTS idx_business_activity_activity ON public.business_activity(business_activity);
CREATE INDEX IF NOT EXISTS idx_business_activity_sector ON public.business_activity(sector);

-- Enable RLS
ALTER TABLE public.business_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access (this table should be readable by all authenticated users)
DROP POLICY IF EXISTS business_activity_select_all ON public.business_activity;
CREATE POLICY business_activity_select_all ON public.business_activity FOR SELECT USING (true);

-- Insert sample business activities (these will be migrated to the new structure later)
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
(14, 'Importer', 'All Other Sectors'),
(15, 'Importer', 'Steel'),
(16, 'Importer', 'FMCG'),
(17, 'Importer', 'Textile'),
(18, 'Importer', 'Telecom'),
(19, 'Importer', 'Petroleum'),
(20, 'Importer', 'Electricity Distribution'),
(21, 'Importer', 'Gas Distribution'),
(22, 'Importer', 'Services'),
(23, 'Importer', 'Automobile'),
(24, 'Importer', 'CNG Stations'),
(25, 'Importer', 'Pharmaceuticals'),
(26, 'Importer', 'Wholesale / Retails'),
(27, 'Distributor', 'All Other Sectors'),
(28, 'Distributor', 'Steel'),
(29, 'Distributor', 'FMCG'),
(30, 'Distributor', 'Textile'),
(31, 'Distributor', 'Telecom'),
(32, 'Distributor', 'Petroleum'),
(33, 'Distributor', 'Electricity Distribution'),
(34, 'Distributor', 'Gas Distribution'),
(35, 'Distributor', 'Services'),
(36, 'Distributor', 'Automobile'),
(37, 'Distributor', 'CNG Stations'),
(38, 'Distributor', 'Pharmaceuticals'),
(39, 'Distributor', 'Wholesale / Retails'),
(40, 'Wholesaler', 'All Other Sectors'),
(41, 'Wholesaler', 'Steel'),
(42, 'Wholesaler', 'FMCG'),
(43, 'Wholesaler', 'Textile'),
(44, 'Wholesaler', 'Telecom'),
(45, 'Wholesaler', 'Petroleum'),
(46, 'Wholesaler', 'Electricity Distribution'),
(47, 'Wholesaler', 'Gas Distribution'),
(48, 'Wholesaler', 'Services'),
(49, 'Wholesaler', 'Automobile'),
(50, 'Wholesaler', 'CNG Stations'),
(51, 'Wholesaler', 'Pharmaceuticals'),
(52, 'Wholesaler', 'Wholesale / Retails'),
(53, 'Exporter', 'All Other Sectors'),
(54, 'Exporter', 'Steel'),
(55, 'Exporter', 'FMCG'),
(56, 'Exporter', 'Textile'),
(57, 'Exporter', 'Telecom'),
(58, 'Exporter', 'Petroleum'),
(59, 'Exporter', 'Electricity Distribution'),
(60, 'Exporter', 'Gas Distribution'),
(61, 'Exporter', 'Services'),
(62, 'Exporter', 'Automobile'),
(63, 'Exporter', 'CNG Stations'),
(64, 'Exporter', 'Pharmaceuticals'),
(65, 'Exporter', 'Wholesale / Retails'),
(66, 'Retailer', 'All Other Sectors'),
(67, 'Retailer', 'Steel'),
(68, 'Retailer', 'FMCG'),
(69, 'Retailer', 'Textile'),
(70, 'Retailer', 'Telecom'),
(71, 'Retailer', 'Petroleum'),
(72, 'Retailer', 'Electricity Distribution'),
(73, 'Retailer', 'Gas Distribution'),
(74, 'Retailer', 'Services'),
(75, 'Retailer', 'Automobile'),
(76, 'Retailer', 'CNG Stations'),
(77, 'Retailer', 'Pharmaceuticals'),
(78, 'Retailer', 'Wholesale / Retails'),
(79, 'Service Provider', 'All Other Sectors'),
(80, 'Service Provider', 'Steel'),
(81, 'Service Provider', 'FMCG'),
(82, 'Service Provider', 'Textile'),
(83, 'Service Provider', 'Telecom'),
(84, 'Service Provider', 'Petroleum'),
(85, 'Service Provider', 'Electricity Distribution'),
(86, 'Service Provider', 'Gas Distribution'),
(87, 'Service Provider', 'Services'),
(88, 'Service Provider', 'Automobile'),
(89, 'Service Provider', 'CNG Stations'),
(90, 'Service Provider', 'Pharmaceuticals'),
(91, 'Service Provider', 'Wholesale / Retails'),
(92, 'Other', 'All Other Sectors'),
(93, 'Other', 'Steel'),
(94, 'Other', 'FMCG'),
(95, 'Other', 'Textile'),
(96, 'Other', 'Telecom'),
(97, 'Other', 'Petroleum'),
(98, 'Other', 'Electricity Distribution'),
(99, 'Other', 'Gas Distribution'),
(100, 'Other', 'Services'),
(101, 'Other', 'Automobile'),
(102, 'Other', 'CNG Stations'),
(103, 'Other', 'Pharmaceuticals'),
(104, 'Other', 'Wholesale / Retails')
ON CONFLICT (sr) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.business_activity TO authenticated;

-- Add comment
COMMENT ON TABLE public.business_activity IS 'Original business activity table with combined business activity and sector information. This will be migrated to the new normalized structure.';
