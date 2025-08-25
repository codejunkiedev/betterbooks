-- Add additional columns to scenario table
ALTER TABLE public.scenario 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS sale_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Update scenario descriptions and details
UPDATE public.scenario SET 
    description = 'Goods at standard rate to registered buyers',
    sale_type = 'Sale Type (Purchase type in case of Cotton Ginners)',
    category = 'Standard Rate Sales'
WHERE code = 'SN001';

UPDATE public.scenario SET 
    description = 'Goods at standard rate to unregistered buyers',
    sale_type = 'Goods at Standard Rate (default)',
    category = 'Standard Rate Sales'
WHERE code = 'SN002';

UPDATE public.scenario SET 
    description = 'Sale of Steel (Melted and Re-Rolled)',
    sale_type = 'Goods at Standard Rate (default)',
    category = 'Steel Sector'
WHERE code = 'SN003';

UPDATE public.scenario SET 
    description = 'Sale by Ship Breakers',
    sale_type = 'Steel Melting and re-rolling',
    category = 'Ship Breaking'
WHERE code = 'SN004';

UPDATE public.scenario SET 
    description = 'Reduced rate sale',
    sale_type = 'Goods at Reduced Rate',
    category = 'Reduced Rate Sales'
WHERE code = 'SN005';

UPDATE public.scenario SET 
    description = 'Exempt goods sale',
    sale_type = 'Zero rated sale',
    category = 'Exempt Goods'
WHERE code = 'SN006';

UPDATE public.scenario SET 
    description = 'Zero rated sale',
    sale_type = 'Goods at zero-rate',
    category = 'Zero Rate Sales'
WHERE code = 'SN007';

UPDATE public.scenario SET 
    description = 'Sale of 3rd schedule goods',
    sale_type = '3rd Schedule Goods',
    category = '3rd Schedule Goods'
WHERE code = 'SN008';

UPDATE public.scenario SET 
    description = 'Cotton Spinners purchase from Cotton Ginners (Textile Sector)',
    sale_type = 'Cotton Ginners',
    category = 'Textile Sector'
WHERE code = 'SN009';

UPDATE public.scenario SET 
    description = 'Telecom services rendered or provided',
    sale_type = 'Telecommunication services',
    category = 'Telecom Services'
WHERE code = 'SN010';

UPDATE public.scenario SET 
    description = 'Toll Manufacturing sale by Steel sector',
    sale_type = 'Toll Manufacturing',
    category = 'Steel Sector'
WHERE code = 'SN011';

UPDATE public.scenario SET 
    description = 'Sale of Petroleum products',
    sale_type = 'Petroleum Products',
    category = 'Petroleum Sector'
WHERE code = 'SN012';

UPDATE public.scenario SET 
    description = 'Electricity Supply to Retailers',
    sale_type = 'Electricity Supply to Retailers',
    category = 'Electricity Sector'
WHERE code = 'SN013';

UPDATE public.scenario SET 
    description = 'Sale of Gas to CNG stations',
    sale_type = 'Gas to CNG stations',
    category = 'Gas Sector'
WHERE code = 'SN014';

UPDATE public.scenario SET 
    description = 'Sale of mobile phones',
    sale_type = 'Mobile Phones',
    category = 'Mobile Phones'
WHERE code = 'SN015';

UPDATE public.scenario SET 
    description = 'Processing / Conversion of Goods',
    sale_type = 'Processing/ Conversion of Goods',
    category = 'Processing Services'
WHERE code = 'SN016';

UPDATE public.scenario SET 
    description = 'Sale of Goods where FED is charged in ST mode',
    sale_type = 'Goods (FED in ST Mode)',
    category = 'FED in ST Mode'
WHERE code = 'SN017';

UPDATE public.scenario SET 
    description = 'Services rendered or provided where FED is charged in ST mode',
    sale_type = 'Services (FED in ST Mode)',
    category = 'FED in ST Mode'
WHERE code = 'SN018';

UPDATE public.scenario SET 
    description = 'Services rendered or provided',
    sale_type = 'Services',
    category = 'Services'
WHERE code = 'SN019';

UPDATE public.scenario SET 
    description = 'Sale of Electric Vehicles',
    sale_type = 'Electric Vehicle',
    category = 'Automobile Sector'
WHERE code = 'SN020';

UPDATE public.scenario SET 
    description = 'Sale of Cement /Concrete Block',
    sale_type = 'Cement /Concrete Block',
    category = 'Construction Materials'
WHERE code = 'SN021';

UPDATE public.scenario SET 
    description = 'Sale of Potassium Chlorate',
    sale_type = 'Potassium Chlorate',
    category = 'Chemicals'
WHERE code = 'SN022';

UPDATE public.scenario SET 
    description = 'Sale of CNG',
    sale_type = 'CNG Sales',
    category = 'CNG Sector'
WHERE code = 'SN023';

UPDATE public.scenario SET 
    description = 'Goods sold that are listed in SRO 297(1)/2023',
    sale_type = 'Goods as per SRO.297(|)/2023',
    category = 'SRO 297 Goods'
WHERE code = 'SN024';

UPDATE public.scenario SET 
    description = 'Drugs sold at fixed ST rate under serial 81 of Eighth Schedule Table 1',
    sale_type = 'Non-Adjustable Supplies',
    category = 'Pharmaceuticals'
WHERE code = 'SN025';

UPDATE public.scenario SET 
    description = 'Sale to End Consumer by retailers',
    sale_type = 'Goods at Standard Rate (default)',
    category = 'Retail Sales'
WHERE code = 'SN026';

UPDATE public.scenario SET 
    description = 'Sale to End Consumer by retailers',
    sale_type = '3rd Schedule Goods',
    category = 'Retail Sales'
WHERE code = 'SN027';

UPDATE public.scenario SET 
    description = 'Sale to End Consumer by retailers',
    sale_type = 'Goods at Reduced Rate',
    category = 'Retail Sales'
WHERE code = 'SN028';
