

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."account_type" AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'CONTRA_REVENUE',
    'COGS',
    'EXPENSE'
);


ALTER TYPE "public"."account_type" OWNER TO "postgres";


CREATE TYPE "public"."activity_type" AS ENUM (
    'USER_LOGIN',
    'DOCUMENT_UPLOADED',
    'DOCUMENT_DELETED',
    'JOURNAL_ENTRY_CREATED',
    'JOURNAL_ENTRY_UPDATED',
    'COMPANY_ACTIVATED',
    'COMPANY_DEACTIVATED',
    'REPORT_GENERATED'
);


ALTER TYPE "public"."activity_type" OWNER TO "postgres";


CREATE TYPE "public"."company_type" AS ENUM (
    'INDEPENDENT_WORKER',
    'PROFESSIONAL_SERVICES',
    'SMALL_BUSINESS'
);


ALTER TYPE "public"."company_type" OWNER TO "postgres";


CREATE TYPE "public"."document_status" AS ENUM (
    'PENDING_REVIEW',
    'IN_PROGRESS',
    'USER_INPUT_NEEDED',
    'COMPLETED'
);


ALTER TYPE "public"."document_status" OWNER TO "postgres";


CREATE TYPE "public"."document_type" AS ENUM (
    'INVOICE',
    'RECEIPT',
    'BANK_STATEMENT',
    'OTHER',
    'TAX_RETURN',
    'TAX_VOUCHER',
    'TAX_SUMMARY'
);


ALTER TYPE "public"."document_type" OWNER TO "postgres";


CREATE TYPE "public"."invoice_type" AS ENUM (
    'DEBIT',
    'CREDIT'
);


ALTER TYPE "public"."invoice_type" OWNER TO "postgres";


CREATE TYPE "public"."role" AS ENUM (
    'USER',
    'ACCOUNTANT',
    'ADMIN'
);


ALTER TYPE "public"."role" OWNER TO "postgres";


CREATE TYPE "public"."status" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE "public"."status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_messages_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_messages_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accountants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."accountants" OWNER TO "postgres";


COMMENT ON TABLE "public"."accountants" IS 'Stores information about your internal accountant team';



CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" bigint NOT NULL,
    "company_id" "uuid",
    "actor_id" "uuid",
    "activity" "public"."activity_type" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."activity_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."activity_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."activity_logs_id_seq" OWNED BY "public"."activity_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coa_template" (
    "id" bigint NOT NULL,
    "account_id" "text" NOT NULL,
    "account_name" "text" NOT NULL,
    "account_type" "public"."account_type",
    "parent_id" bigint
);


ALTER TABLE "public"."coa_template" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."coa_template_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."coa_template_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."coa_template_id_seq" OWNED BY "public"."coa_template"."id";



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assigned_accountant_id" "uuid",
    "name" "text" NOT NULL,
    "type" "public"."company_type" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "account_balance" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "opening_balance" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "closing_balance" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "total_debit" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "total_credit" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "tax_id_number" "text",
    "filing_status" "text",
    "tax_year_end" "date"
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."companies" IS 'The central table for a user''s company';



COMMENT ON COLUMN "public"."companies"."tax_id_number" IS 'Tax ID Number (EIN, SSN, etc.)';



COMMENT ON COLUMN "public"."companies"."filing_status" IS 'Filing status (Sole Proprietor, S-Corp, etc.)';



COMMENT ON COLUMN "public"."companies"."tax_year_end" IS 'Tax year end date';



CREATE TABLE IF NOT EXISTS "public"."company_coa" (
    "id" bigint NOT NULL,
    "account_id" "text" NOT NULL,
    "account_name" "text" NOT NULL,
    "account_type" "public"."account_type",
    "parent_id" bigint,
    "company_id" "uuid" NOT NULL,
    "credit_balance" numeric DEFAULT 0,
    "debit_balance" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "template_id" bigint
);


ALTER TABLE "public"."company_coa" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."company_coa_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."company_coa_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."company_coa_id_seq" OWNED BY "public"."company_coa"."id";



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "uploaded_by_user_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "original_filename" "text" NOT NULL,
    "status" "public"."document_status" DEFAULT 'PENDING_REVIEW'::"public"."document_status" NOT NULL,
    "type" "public"."document_type" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "entry_date" "date" NOT NULL,
    "description" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "source_document_id" "uuid",
    "is_adjusting_entry" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."journal_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_entry_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "journal_entry_id" "uuid" NOT NULL,
    "account_id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    CONSTRAINT "journal_entry_lines_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "journal_entry_lines_type_check" CHECK (("type" = ANY (ARRAY['DEBIT'::"text", 'CREDIT'::"text"])))
);


ALTER TABLE "public"."journal_entry_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "related_document_id" "uuid",
    "content" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Stores public-facing user data, linked 1-to-1 with Supabase auth users';



ALTER TABLE ONLY "public"."activity_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."activity_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."coa_template" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."coa_template_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."company_coa" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."company_coa_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."accountants"
    ADD CONSTRAINT "accountants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accountants"
    ADD CONSTRAINT "accountants_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."coa_template"
    ADD CONSTRAINT "coa_template_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_coa"
    ADD CONSTRAINT "company_coa_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."company_coa"
    ADD CONSTRAINT "company_coa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_coa"
    ADD CONSTRAINT "company_coa_template_company_unique" UNIQUE ("template_id", "company_id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_entry_lines"
    ADD CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_logs_company_id" ON "public"."activity_logs" USING "btree" ("company_id");



CREATE INDEX "idx_admins_user_id" ON "public"."admins" USING "btree" ("user_id");



CREATE INDEX "idx_companies_account_balance" ON "public"."companies" USING "btree" ("account_balance");



CREATE INDEX "idx_companies_total_credit" ON "public"."companies" USING "btree" ("total_credit");



CREATE INDEX "idx_companies_total_debit" ON "public"."companies" USING "btree" ("total_debit");



CREATE OR REPLACE TRIGGER "update_messages_updated_at" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_messages_updated_at"();



ALTER TABLE ONLY "public"."accountants"
    ADD CONSTRAINT "accountants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coa_template"
    ADD CONSTRAINT "coa_template_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."coa_template"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_assigned_accountant_id_fkey" FOREIGN KEY ("assigned_accountant_id") REFERENCES "public"."accountants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_coa"
    ADD CONSTRAINT "company_coa_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_user_id_fkey1" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_source_document_id_fkey" FOREIGN KEY ("source_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."journal_entry_lines"
    ADD CONSTRAINT "journal_entry_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."company_coa"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."journal_entry_lines"
    ADD CONSTRAINT "journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_related_document_id_fkey" FOREIGN KEY ("related_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable all access to all authenticated users" ON "public"."accountants" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."activity_logs" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."admins" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."coa_template" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."companies" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."company_coa" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."documents" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."journal_entries" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."journal_entry_lines" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."messages" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access to all authenticated users" ON "public"."profiles" USING (true) WITH CHECK (true);



ALTER TABLE "public"."accountants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coa_template" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_coa" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journal_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journal_entry_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."update_messages_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_messages_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_messages_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."accountants" TO "anon";
GRANT ALL ON TABLE "public"."accountants" TO "authenticated";
GRANT ALL ON TABLE "public"."accountants" TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON TABLE "public"."coa_template" TO "anon";
GRANT ALL ON TABLE "public"."coa_template" TO "authenticated";
GRANT ALL ON TABLE "public"."coa_template" TO "service_role";



GRANT ALL ON SEQUENCE "public"."coa_template_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."coa_template_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."coa_template_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_coa" TO "anon";
GRANT ALL ON TABLE "public"."company_coa" TO "authenticated";
GRANT ALL ON TABLE "public"."company_coa" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_coa_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_coa_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_coa_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."journal_entries" TO "anon";
GRANT ALL ON TABLE "public"."journal_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_entries" TO "service_role";



GRANT ALL ON TABLE "public"."journal_entry_lines" TO "anon";
GRANT ALL ON TABLE "public"."journal_entry_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_entry_lines" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
