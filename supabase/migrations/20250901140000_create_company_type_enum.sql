-- Migration: Create company_type enum and related types
-- This migration creates the company_type enum that is referenced in onboarding functions

-- Create company_type enum if it doesn't exist
DO $$ 
BEGIN
    -- Check if the enum type already exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_type') THEN
        CREATE TYPE public.company_type AS ENUM (
            'sole_proprietorship',
            'partnership',
            'private_limited',
            'public_limited',
            'limited_liability_partnership',
            'other'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Type already exists, continue
        NULL;
    WHEN OTHERS THEN
        -- Other errors, continue
        NULL;
END $$;

-- Create other common enum types that might be needed
DO $$ 
BEGIN
    -- Create filing_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'filing_status') THEN
        CREATE TYPE public.filing_status AS ENUM (
            'individual',
            'business',
            'exempt',
            'not_required'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create tax_year_end_month enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tax_year_end_month') THEN
        CREATE TYPE public.tax_year_end_month AS ENUM (
            'january',
            'february',
            'march',
            'april',
            'may',
            'june',
            'july',
            'august',
            'september',
            'october',
            'november',
            'december'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create account_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE public.account_type AS ENUM (
            'asset',
            'liability',
            'equity',
            'revenue',
            'expense'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create transaction_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE public.transaction_type AS ENUM (
            'debit',
            'credit'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create user_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE public.user_status AS ENUM (
            'active',
            'inactive',
            'suspended',
            'pending'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create module_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_status') THEN
        CREATE TYPE public.module_status AS ENUM (
            'active',
            'inactive',
            'trial',
            'expired'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Grant usage on the enum types to authenticated users
GRANT USAGE ON TYPE public.company_type TO authenticated;
GRANT USAGE ON TYPE public.filing_status TO authenticated;
GRANT USAGE ON TYPE public.tax_year_end_month TO authenticated;
GRANT USAGE ON TYPE public.account_type TO authenticated;
GRANT USAGE ON TYPE public.transaction_type TO authenticated;
GRANT USAGE ON TYPE public.user_status TO authenticated;
GRANT USAGE ON TYPE public.module_status TO authenticated;

-- Add comments for documentation
COMMENT ON TYPE public.company_type IS 'Types of business entities';
COMMENT ON TYPE public.filing_status IS 'Tax filing status options';
COMMENT ON TYPE public.tax_year_end_month IS 'Months for tax year end';
COMMENT ON TYPE public.account_type IS 'Chart of accounts account types';
COMMENT ON TYPE public.transaction_type IS 'Transaction entry types (debit/credit)';
COMMENT ON TYPE public.user_status IS 'User account status';
COMMENT ON TYPE public.module_status IS 'Module subscription status';
