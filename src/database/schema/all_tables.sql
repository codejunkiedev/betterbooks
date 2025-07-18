-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accountants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT accountants_pkey PRIMARY KEY (id),
  CONSTRAINT accountants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.activity_logs (
  id bigint NOT NULL DEFAULT nextval('activity_logs_id_seq'::regclass),
  company_id uuid,
  actor_id uuid,
  activity USER-DEFINED NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id)
);
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.coa_template (
  id bigint NOT NULL DEFAULT nextval('coa_template_id_seq'::regclass),
  account_id text NOT NULL,
  account_name text NOT NULL,
  account_type USER-DEFINED,
  parent_id bigint,
  CONSTRAINT coa_template_pkey PRIMARY KEY (id),
  CONSTRAINT coa_template_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.coa_template(id)
);
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assigned_accountant_id uuid,
  name text NOT NULL,
  type USER-DEFINED NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id),
  CONSTRAINT companies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT companies_assigned_accountant_id_fkey FOREIGN KEY (assigned_accountant_id) REFERENCES public.accountants(id)
);
CREATE TABLE public.company_coa (
  id bigint NOT NULL DEFAULT nextval('company_coa_id_seq'::regclass) UNIQUE,
  account_id text NOT NULL,
  account_name text NOT NULL,
  account_type USER-DEFINED,
  parent_id bigint,
  company_id uuid NOT NULL,
  credit_balance numeric DEFAULT 0,
  debit_balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  template_id bigint,
  CONSTRAINT company_coa_pkey PRIMARY KEY (id),
  CONSTRAINT company_coa_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.document_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT document_comments_pkey PRIMARY KEY (id),
  CONSTRAINT document_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id),
  CONSTRAINT document_comments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  uploaded_by_user_id uuid NOT NULL,
  file_path text NOT NULL,
  original_filename text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING_REVIEW'::document_status,
  type USER-DEFINED NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_uploaded_by_user_id_fkey1 FOREIGN KEY (uploaded_by_user_id) REFERENCES auth.users(id),
  CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.journal_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  entry_date date NOT NULL,
  description text NOT NULL,
  created_by_accountant_id uuid NOT NULL,
  source_document_id uuid,
  is_adjusting_entry boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT journal_entries_pkey PRIMARY KEY (id),
  CONSTRAINT journal_entries_created_by_accountant_id_fkey FOREIGN KEY (created_by_accountant_id) REFERENCES public.accountants(id),
  CONSTRAINT journal_entries_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.documents(id),
  CONSTRAINT journal_entries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.journal_entry_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL,
  account_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['DEBIT'::text, 'CREDIT'::text])),
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id),
  CONSTRAINT journal_entry_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  related_document_id uuid,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id),
  CONSTRAINT messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id),
  CONSTRAINT messages_related_document_id_fkey FOREIGN KEY (related_document_id) REFERENCES public.documents(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  is_active boolean DEFAULT true,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);