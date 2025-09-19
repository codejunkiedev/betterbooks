-- Update scenario descriptions and sale_type values based on the provided table data

-- SN001: Goods at standard rate to registered buyers
UPDATE public.scenario SET 
    description = 'Goods at standard rate to registered buyers',
    sale_type = 'Goods at Standard Rate (default)'
WHERE code = 'SN001';

-- SN002: Goods at standard rate to unregistered buyers
UPDATE public.scenario SET 
    description = 'Goods at standard rate to unregistered buyers',
    sale_type = 'Goods at Standard Rate (default)'
WHERE code = 'SN002';

-- SN003: Sale of Steel (Melted and Re-Rolled)
UPDATE public.scenario SET 
    description = 'Sale of Steel (Melted and Re-Rolled)',
    sale_type = 'Steel Melting and re-rolling'
WHERE code = 'SN003';

-- SN004: Sale by Ship Breakers
UPDATE public.scenario SET 
    description = 'Sale by Ship Breakers',
    sale_type = 'Ship breaking'
WHERE code = 'SN004';

-- SN005: Reduced rate sale
UPDATE public.scenario SET 
    description = 'Reduced rate sale',
    sale_type = 'Goods at Reduced Rate'
WHERE code = 'SN005';

-- SN006: Exempt goods sale
UPDATE public.scenario SET 
    description = 'Exempt goods sale',
    sale_type = 'Exempt goods'
WHERE code = 'SN006';

-- SN007: Zero rated sale
UPDATE public.scenario SET 
    description = 'Zero rated sale',
    sale_type = 'Goods at zero-rate'
WHERE code = 'SN007';

-- SN008: Sale of 3rd schedule goods
UPDATE public.scenario SET 
    description = 'Sale of 3rd schedule goods',
    sale_type = '3rd Schedule Goods'
WHERE code = 'SN008';

-- SN009: Cotton Spinners purchase from Cotton Ginners (Textile Sector)
UPDATE public.scenario SET 
    description = 'Cotton Spinners purchase from Cotton Ginners (Textile Sector)',
    sale_type = 'Cotton ginners'
WHERE code = 'SN009';

-- SN010: Telecom services rendered or provided
UPDATE public.scenario SET 
    description = 'Telecom services rendered or provided',
    sale_type = 'Telecommunication services'
WHERE code = 'SN010';

-- SN011: Toll Manufacturing sale by Steel sector
UPDATE public.scenario SET 
    description = 'Toll Manufacturing sale by Steel sector',
    sale_type = 'Toll Manufacturing'
WHERE code = 'SN011';

-- SN012: Sale of Petroleum products
UPDATE public.scenario SET 
    description = 'Sale of Petroleum products',
    sale_type = 'Petroleum Products'
WHERE code = 'SN012';

-- SN013: Electricity Supply to Retailers
UPDATE public.scenario SET 
    description = 'Electricity Supply to Retailers',
    sale_type = 'Electricity Supply to Retailers'
WHERE code = 'SN013';

-- SN014: Sale of Gas to CNG stations
UPDATE public.scenario SET 
    description = 'Sale of Gas to CNG stations',
    sale_type = 'Gas to CNG stations'
WHERE code = 'SN014';

-- SN015: Sale of mobile phones
UPDATE public.scenario SET 
    description = 'Sale of mobile phones',
    sale_type = 'Mobile Phones'
WHERE code = 'SN015';

-- SN016: Processing / Conversion of Goods
UPDATE public.scenario SET 
    description = 'Processing / Conversion of Goods',
    sale_type = 'Processing/Conversion of Goods'
WHERE code = 'SN016';

-- SN017: Sale of Goods where FED is charged in ST mode
UPDATE public.scenario SET 
    description = 'Sale of Goods where FED is charged in ST mode',
    sale_type = 'Goods (FED in ST Mode)'
WHERE code = 'SN017';

-- SN018: Services rendered or provided where FED is charged in ST mode
UPDATE public.scenario SET 
    description = 'Services rendered or provided where FED is charged in ST mode',
    sale_type = 'Services (FED in ST Mode)'
WHERE code = 'SN018';

-- SN019: Services rendered or provided
UPDATE public.scenario SET 
    description = 'Services rendered or provided',
    sale_type = 'Services'
WHERE code = 'SN019';

-- SN020: Sale of Electric Vehicles
UPDATE public.scenario SET 
    description = 'Sale of Electric Vehicles',
    sale_type = 'Electric Vehicle'
WHERE code = 'SN020';

-- SN021: Sale of Cement /Concrete Block
UPDATE public.scenario SET 
    description = 'Sale of Cement /Concrete Block',
    sale_type = 'Cement /Concrete Block'
WHERE code = 'SN021';

-- SN022: Sale of Potassium Chlorate
UPDATE public.scenario SET 
    description = 'Sale of Potassium Chlorate',
    sale_type = 'Potassium Chlorate'
WHERE code = 'SN022';

-- SN023: Sale of CNG
UPDATE public.scenario SET 
    description = 'Sale of CNG',
    sale_type = 'CNG Sales'
WHERE code = 'SN023';

-- SN024: Goods sold that are listed in SRO 297(1)/2023
UPDATE public.scenario SET 
    description = 'Goods sold that are listed in SRO 297(1)/2023',
    sale_type = 'Goods as per SRO.297(|)/2023'
WHERE code = 'SN024';

-- SN025: Drugs sold at fixed ST rate under serial 81 of Eighth Schedule Table 1
UPDATE public.scenario SET 
    description = 'Drugs sold at fixed ST rate under serial 81 of Eighth Schedule Table 1',
    sale_type = 'Non-Adjustable Supplies'
WHERE code = 'SN025';

-- SN026: Sale to End Consumer by retailers
UPDATE public.scenario SET 
    description = 'Sale to End Consumer by retailers',
    sale_type = 'Goods at Standard Rate (default)'
WHERE code = 'SN026';

-- SN027: Sale to End Consumer by retailers
UPDATE public.scenario SET 
    description = 'Sale to End Consumer by retailers',
    sale_type = '3rd Schedule Goods'
WHERE code = 'SN027';

-- SN028: Sale to End Consumer by retailers
UPDATE public.scenario SET 
    description = 'Sale to End Consumer by retailers',
    sale_type = 'Goods at Reduced Rate'
WHERE code = 'SN028';




-- Add transaction_type_id column to scenario table
ALTER TABLE public.scenario 
ADD COLUMN IF NOT EXISTS transaction_type_id INTEGER;

-- Update scenario table with transaction_type_id values based on sale_type mapping
-- The mapping is based on the sale_type field that corresponds to the transaction descriptions

UPDATE public.scenario SET transaction_type_id = 75 WHERE sale_type = 'Goods at Standard Rate (default)';
UPDATE public.scenario SET transaction_type_id = 24 WHERE sale_type = 'Goods at Reduced Rate';
UPDATE public.scenario SET transaction_type_id = 80 WHERE sale_type = 'Goods at zero-rate';
UPDATE public.scenario SET transaction_type_id = 85 WHERE sale_type = 'Petroleum Products';
UPDATE public.scenario SET transaction_type_id = 62 WHERE sale_type = 'Electricity Supply to Retailers';
UPDATE public.scenario SET transaction_type_id = 129 WHERE sale_type = 'SIM';
UPDATE public.scenario SET transaction_type_id = 77 WHERE sale_type = 'Gas to CNG stations';
UPDATE public.scenario SET transaction_type_id = 122 WHERE sale_type = 'Mobile Phones';
UPDATE public.scenario SET transaction_type_id = 25 WHERE sale_type = 'Processing/ Conversion of Goods';
UPDATE public.scenario SET transaction_type_id = 23 WHERE sale_type = '3rd Schedule Goods';
UPDATE public.scenario SET transaction_type_id = 21 WHERE sale_type = 'Goods (FED in ST Mode)';
UPDATE public.scenario SET transaction_type_id = 22 WHERE sale_type = 'Services (FED in ST Mode)';
UPDATE public.scenario SET transaction_type_id = 18 WHERE sale_type = 'Services';
UPDATE public.scenario SET transaction_type_id = 81 WHERE sale_type = 'Zero rated sale';
UPDATE public.scenario SET transaction_type_id = 82 WHERE sale_type = 'DTRE goods';
UPDATE public.scenario SET transaction_type_id = 130 WHERE sale_type = 'Cotton Ginners';
UPDATE public.scenario SET transaction_type_id = 132 WHERE sale_type = 'Electric Vehicle';
UPDATE public.scenario SET transaction_type_id = 134 WHERE sale_type = 'Cement /Concrete Block';
UPDATE public.scenario SET transaction_type_id = 84 WHERE sale_type = 'Telecommunication services';
UPDATE public.scenario SET transaction_type_id = 123 WHERE sale_type = 'Steel Melting and re-rolling';
UPDATE public.scenario SET transaction_type_id = 125 WHERE sale_type = 'Ship breaking';
UPDATE public.scenario SET transaction_type_id = 115 WHERE sale_type = 'Potassium Chlorate';
UPDATE public.scenario SET transaction_type_id = 178 WHERE sale_type = 'CNG Sales';
UPDATE public.scenario SET transaction_type_id = 181 WHERE sale_type = 'Toll Manufacturing';
UPDATE public.scenario SET transaction_type_id = 138 WHERE sale_type = 'Non-Adjustable Supplies';
UPDATE public.scenario SET transaction_type_id = 139 WHERE sale_type = 'Goods as per SRO.297(|)/2023';
UPDATE public.scenario SET transaction_type_id = 130 WHERE sale_type = 'Cotton ginners';
UPDATE public.scenario SET transaction_type_id = 81 WHERE sale_type = 'Exempt goods';

-- Add comment to the column for documentation
COMMENT ON COLUMN public.scenario.transaction_type_id IS 'FBR Transaction Type ID corresponding to the sale type';
