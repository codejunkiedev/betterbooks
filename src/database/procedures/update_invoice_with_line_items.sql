CREATE OR REPLACE FUNCTION update_invoice_with_line_items(
  p_invoice_id UUID,
  p_deepseek_response JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_line_item JSONB;
BEGIN
  -- Update the invoice with the deepseek response
  UPDATE invoices
  SET status = 'approved',
      data = p_deepseek_response
  WHERE id = p_invoice_id;

  -- If there are line items in the response and they are assets, save them
  IF p_deepseek_response->'line_items' IS NOT NULL THEN
    FOR v_line_item IN SELECT * FROM jsonb_array_elements(p_deepseek_response->'line_items')
    LOOP
      IF (v_line_item->>'is_asset')::boolean = true THEN
        INSERT INTO line_items (
          invoice_id,
          description,
          amount,
          quantity,
          unit_price,
          is_asset,
          asset_type,
          asset_life_months
        ) VALUES (
          p_invoice_id,
          v_line_item->>'description',
          (v_line_item->>'amount')::decimal,
          (v_line_item->>'quantity')::integer,
          CASE 
            WHEN v_line_item->>'unit_price' IS NOT NULL 
            THEN (v_line_item->>'unit_price')::decimal 
            ELSE NULL 
          END,
          true,
          v_line_item->>'asset_type',
          CASE 
            WHEN v_line_item->>'asset_life_months' IS NOT NULL 
            THEN (v_line_item->>'asset_life_months')::integer 
            ELSE NULL 
          END
        );
      END IF;
    END LOOP;
  END IF;
END;
$$;