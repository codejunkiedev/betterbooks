-- Migration: Create foundation enums
-- This migration creates all required enum types that are used throughout the application
-- It should run early in the migration sequence to ensure all dependencies are met

-- Create company_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_type') THEN
        CREATE TYPE public.company_type AS ENUM (
            'INDEPENDENT_WORKER',
            'PROFESSIONAL_SERVICES',
            'SMALL_BUSINESS'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create filing_status enum if it doesn't exist
DO $$ 
BEGIN
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
            'ASSET',
            'LIABILITY',
            'EQUITY',
            'REVENUE',
            'CONTRA_REVENUE',
            'COGS',
            'EXPENSE'
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

-- Create activity_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE public.activity_type AS ENUM (
            'USER_LOGIN',
            'DOCUMENT_UPLOADED',
            'DOCUMENT_DELETED',
            'JOURNAL_ENTRY_CREATED',
            'JOURNAL_ENTRY_UPDATED',
            'COMPANY_ACTIVATED',
            'COMPANY_DEACTIVATED',
            'REPORT_GENERATED',
            'COMPANY_CREATED'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create document_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE public.document_status AS ENUM (
            'PENDING_REVIEW',
            'IN_PROGRESS',
            'USER_INPUT_NEEDED',
            'COMPLETED'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create document_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE public.document_type AS ENUM (
            'INVOICE',
            'RECEIPT',
            'BANK_STATEMENT',
            'OTHER',
            'TAX_RETURN',
            'TAX_VOUCHER',
            'TAX_SUMMARY'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create invoice_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_type') THEN
        CREATE TYPE public.invoice_type AS ENUM (
            'DEBIT',
            'CREDIT'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE public.role AS ENUM (
            'USER',
            'ACCOUNTANT',
            'ADMIN'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
        CREATE TYPE public.status AS ENUM (
            'ACTIVE',
            'INACTIVE',
            'SUSPENDED'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create availability_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_status') THEN
        CREATE TYPE public.availability_status AS ENUM (
            'Available',
            'Busy',
            'On Leave'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;

-- Create registration_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_type') THEN
        CREATE TYPE public.registration_type AS ENUM (
            'Registered',
            'Unregistered'
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
GRANT USAGE ON TYPE public.activity_type TO authenticated;
GRANT USAGE ON TYPE public.document_status TO authenticated;
GRANT USAGE ON TYPE public.document_type TO authenticated;
GRANT USAGE ON TYPE public.invoice_type TO authenticated;
GRANT USAGE ON TYPE public.role TO authenticated;
GRANT USAGE ON TYPE public.status TO authenticated;
GRANT USAGE ON TYPE public.availability_status TO authenticated;
GRANT USAGE ON TYPE public.registration_type TO authenticated;

-- Add comments for documentation
COMMENT ON TYPE public.company_type IS 'Types of business entities (INDEPENDENT_WORKER, PROFESSIONAL_SERVICES, SMALL_BUSINESS)';
COMMENT ON TYPE public.filing_status IS 'Tax filing status options';
COMMENT ON TYPE public.tax_year_end_month IS 'Months for tax year end';
COMMENT ON TYPE public.account_type IS 'Chart of accounts account types (ASSET, LIABILITY, EQUITY, REVENUE, etc.)';
COMMENT ON TYPE public.transaction_type IS 'Transaction entry types (debit/credit)';
COMMENT ON TYPE public.user_status IS 'User account status';
COMMENT ON TYPE public.module_status IS 'Module subscription status';
COMMENT ON TYPE public.activity_type IS 'User activity types for logging (USER_LOGIN, DOCUMENT_UPLOADED, etc.)';
COMMENT ON TYPE public.document_status IS 'Document processing status (PENDING_REVIEW, IN_PROGRESS, etc.)';
COMMENT ON TYPE public.document_type IS 'Types of documents (INVOICE, RECEIPT, BANK_STATEMENT, etc.)';
COMMENT ON TYPE public.invoice_type IS 'Invoice types (DEBIT, CREDIT)';
COMMENT ON TYPE public.role IS 'User roles (USER, ACCOUNTANT, ADMIN)';
COMMENT ON TYPE public.status IS 'General status (ACTIVE, INACTIVE, SUSPENDED)';
COMMENT ON TYPE public.availability_status IS 'Accountant availability status (Available, Busy, On Leave)';
COMMENT ON TYPE public.registration_type IS 'Registration status (Registered, Unregistered)';
