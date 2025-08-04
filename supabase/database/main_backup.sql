--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 16.1

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

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: account_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_type AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'CONTRA_REVENUE',
    'COGS',
    'EXPENSE'
);


--
-- Name: activity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_type AS ENUM (
    'USER_LOGIN',
    'DOCUMENT_UPLOADED',
    'DOCUMENT_DELETED',
    'JOURNAL_ENTRY_CREATED',
    'JOURNAL_ENTRY_UPDATED',
    'COMPANY_ACTIVATED',
    'COMPANY_DEACTIVATED',
    'REPORT_GENERATED'
);


--
-- Name: company_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.company_type AS ENUM (
    'INDEPENDENT_WORKER',
    'PROFESSIONAL_SERVICES',
    'SMALL_BUSINESS'
);


--
-- Name: document_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_status AS ENUM (
    'PENDING_REVIEW',
    'IN_PROGRESS',
    'USER_INPUT_NEEDED',
    'COMPLETED'
);


--
-- Name: document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_type AS ENUM (
    'INVOICE',
    'RECEIPT',
    'BANK_STATEMENT',
    'OTHER',
    'TAX_RETURN',
    'TAX_VOUCHER',
    'TAX_SUMMARY'
);


--
-- Name: invoice_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invoice_type AS ENUM (
    'DEBIT',
    'CREDIT'
);


--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'USER',
    'ACCOUNTANT',
    'ADMIN'
);


--
-- Name: status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: update_messages_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_messages_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: accountants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accountants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: TABLE accountants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accountants IS 'Stores information about your internal accountant team';


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id bigint NOT NULL,
    company_id uuid,
    actor_id uuid,
    activity public.activity_type NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: coa_template; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coa_template (
    id bigint NOT NULL,
    account_id text NOT NULL,
    account_name text NOT NULL,
    account_type public.account_type,
    parent_id bigint
);


--
-- Name: coa_template_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coa_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coa_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coa_template_id_seq OWNED BY public.coa_template.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    assigned_accountant_id uuid,
    name text NOT NULL,
    type public.company_type NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    account_balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    opening_balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    closing_balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    total_debit numeric(15,2) DEFAULT 0.00 NOT NULL,
    total_credit numeric(15,2) DEFAULT 0.00 NOT NULL,
    tax_id_number text,
    filing_status text,
    tax_year_end date
);


--
-- Name: TABLE companies; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.companies IS 'The central table for a user''s company';


--
-- Name: COLUMN companies.tax_id_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.tax_id_number IS 'Tax ID Number (EIN, SSN, etc.)';


--
-- Name: COLUMN companies.filing_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.filing_status IS 'Filing status (Sole Proprietor, S-Corp, etc.)';


--
-- Name: COLUMN companies.tax_year_end; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.tax_year_end IS 'Tax year end date';


--
-- Name: company_coa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_coa (
    id bigint NOT NULL,
    account_id text NOT NULL,
    account_name text NOT NULL,
    account_type public.account_type,
    parent_id bigint,
    company_id uuid NOT NULL,
    credit_balance numeric DEFAULT 0,
    debit_balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    template_id bigint
);


--
-- Name: company_coa_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_coa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_coa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_coa_id_seq OWNED BY public.company_coa.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    uploaded_by_user_id uuid NOT NULL,
    file_path text NOT NULL,
    original_filename text NOT NULL,
    status public.document_status DEFAULT 'PENDING_REVIEW'::public.document_status NOT NULL,
    type public.document_type NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now()
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    entry_date date NOT NULL,
    description text NOT NULL,
    created_by uuid NOT NULL,
    source_document_id uuid,
    is_adjusting_entry boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: journal_entry_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entry_lines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    journal_entry_id uuid NOT NULL,
    account_id bigint NOT NULL,
    type text NOT NULL,
    amount numeric(12,2) NOT NULL,
    CONSTRAINT journal_entry_lines_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT journal_entry_lines_type_check CHECK ((type = ANY (ARRAY['DEBIT'::text, 'CREDIT'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    related_document_id uuid,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    is_active boolean DEFAULT true
);


--
-- Name: TABLE profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.profiles IS 'Stores public-facing user data, linked 1-to-1 with Supabase auth users';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: coa_template id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_template ALTER COLUMN id SET DEFAULT nextval('public.coa_template_id_seq'::regclass);


--
-- Name: company_coa id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_coa ALTER COLUMN id SET DEFAULT nextval('public.company_coa_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	18bc8b0f-49a9-4b9d-8feb-a055cfb14109	{"action":"user_confirmation_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-08 15:55:08.072985+00	
00000000-0000-0000-0000-000000000000	7836ceb8-c520-44e7-9707-db6fe85fe0a5	{"action":"user_signedup","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"team"}	2025-05-08 16:00:12.446763+00	
00000000-0000-0000-0000-000000000000	48720aaf-960f-440a-94da-814d9cd459cd	{"action":"user_repeated_signup","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-08 16:02:08.558051+00	
00000000-0000-0000-0000-000000000000	30ffdfa7-108a-4eba-971a-04b780f2be1c	{"action":"user_confirmation_requested","actor_id":"10c29eea-0a1f-4278-847e-0ba9094e0594","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-08 16:06:47.558471+00	
00000000-0000-0000-0000-000000000000	2865fa31-19fb-4c1c-b7d6-cb3d2981ca4d	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:08:16.061404+00	
00000000-0000-0000-0000-000000000000	b8d9565f-298b-4bc8-8c1a-485a1a6de043	{"action":"user_repeated_signup","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-08 16:12:45.755444+00	
00000000-0000-0000-0000-000000000000	33826b1e-aca5-4ee4-a3d4-1b52ebd16b08	{"action":"user_repeated_signup","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-08 16:14:15.280211+00	
00000000-0000-0000-0000-000000000000	ca454a77-45c0-4eb9-8d4a-692ec94168f4	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:31:10.676257+00	
00000000-0000-0000-0000-000000000000	bd7601a5-58e3-4d39-9874-10f360663ce2	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:31:19.460415+00	
00000000-0000-0000-0000-000000000000	229a4d28-b00d-46a9-bb9d-e39eb56adb1d	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:31:25.722122+00	
00000000-0000-0000-0000-000000000000	50e919a2-86d6-4080-a340-b6961315025a	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:40:17.568034+00	
00000000-0000-0000-0000-000000000000	6f5d2080-15a1-4aac-8938-7a1aac408eac	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:40:35.577633+00	
00000000-0000-0000-0000-000000000000	896e23c9-e461-4d1a-acac-82bb54146880	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:41:43.585826+00	
00000000-0000-0000-0000-000000000000	263ebcec-47f4-4538-bdad-019ab3553cdd	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:41:52.02861+00	
00000000-0000-0000-0000-000000000000	79b04673-0fda-43a3-ae21-1e643fe2fdb1	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:42:37.525344+00	
00000000-0000-0000-0000-000000000000	e567c53d-56c8-4673-be00-4978e7a9b1c0	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:42:43.478567+00	
00000000-0000-0000-0000-000000000000	e1aeed76-cf77-46aa-a40a-9460aa30105e	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:43:45.662966+00	
00000000-0000-0000-0000-000000000000	ddb6a1dc-8297-4bf7-a57c-0880ee4045fd	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:44:52.211236+00	
00000000-0000-0000-0000-000000000000	57df64fb-d629-4d52-8a42-135a5346ddd3	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:44:57.519038+00	
00000000-0000-0000-0000-000000000000	840170a6-cbbe-4437-b87e-0a0955a7957a	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:00.693551+00	
00000000-0000-0000-0000-000000000000	586282fc-304e-4801-9f4f-b7031d1216d2	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:04.446638+00	
00000000-0000-0000-0000-000000000000	765b0b69-4dec-44eb-909d-5f48a45d691b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:07.77644+00	
00000000-0000-0000-0000-000000000000	6a388591-dba4-470c-8dbc-c9527c4706ce	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:10.840498+00	
00000000-0000-0000-0000-000000000000	4db91569-e266-4644-8d44-b6cc96bb6a0d	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:13.464645+00	
00000000-0000-0000-0000-000000000000	5bb957f0-b13d-409f-be52-38f89922cf28	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:15.994657+00	
00000000-0000-0000-0000-000000000000	444c4e79-2b7a-4806-b1ed-3ad2b17e369a	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:32.19717+00	
00000000-0000-0000-0000-000000000000	00fa5e8b-c4ff-48cf-ad79-5bb4f36f63ec	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:36.879528+00	
00000000-0000-0000-0000-000000000000	d07eb39f-b1d6-4bd2-a46c-064aa83dd1c4	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:45:58.661638+00	
00000000-0000-0000-0000-000000000000	a2769e62-0266-412b-a1d7-de2ca85abb9e	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 16:46:02.617221+00	
00000000-0000-0000-0000-000000000000	d787b2de-93a8-43e9-87d2-79a6438e4f0a	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-08 16:48:05.45269+00	
00000000-0000-0000-0000-000000000000	b8002097-f023-4735-bf1f-f4debc2b1018	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 16:48:26.195637+00	
00000000-0000-0000-0000-000000000000	aa795431-5a3e-45f4-8811-7fa37f5b6636	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-08 16:53:51.468152+00	
00000000-0000-0000-0000-000000000000	6899ddd5-fcf5-4bd7-86d5-127104587d92	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 16:54:06.07673+00	
00000000-0000-0000-0000-000000000000	8dc2229e-e8af-41ea-ab0e-b877ef7a2969	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-08 16:55:35.056221+00	
00000000-0000-0000-0000-000000000000	01e82e74-50e1-4721-85a4-cae7e38caa67	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 16:56:01.421147+00	
00000000-0000-0000-0000-000000000000	7bd637fe-b3f9-4331-914e-4b4c25a7f600	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-08 16:57:10.788459+00	
00000000-0000-0000-0000-000000000000	9ca575dd-516b-48ba-8e87-5c0a5f87934b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 16:57:18.327315+00	
00000000-0000-0000-0000-000000000000	ba68e2f9-7665-4e9b-ae72-5fc6597f215e	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-08 17:01:47.647236+00	
00000000-0000-0000-0000-000000000000	0e92c86d-067a-499c-9dc0-24698bf3217e	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 17:02:19.595228+00	
00000000-0000-0000-0000-000000000000	ca3fa9b7-aece-4c45-81f5-d2206f183737	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-08 17:13:23.453325+00	
00000000-0000-0000-0000-000000000000	790642de-4dba-49a0-9778-d946df944bec	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 17:14:15.134977+00	
00000000-0000-0000-0000-000000000000	70218607-b959-4437-9231-5de50db1898b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 20:02:46.821357+00	
00000000-0000-0000-0000-000000000000	b3e8fc1a-460c-4f03-98df-cf1928c4b7a2	{"action":"user_confirmation_requested","actor_id":"1d89c0c7-99a3-4807-a8d2-7cb030394b7f","actor_username":"talhamushtaq6997@signupgmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-08 20:03:13.055442+00	
00000000-0000-0000-0000-000000000000	661507c6-7568-4474-abdf-b45132b70c22	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 20:29:23.211896+00	
00000000-0000-0000-0000-000000000000	a52030f5-5cf0-4932-a967-416b33f954f7	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 20:29:49.447217+00	
00000000-0000-0000-0000-000000000000	6ddc7eaa-fe94-4cf5-8662-e5cd8e69d988	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 20:58:58.777341+00	
00000000-0000-0000-0000-000000000000	386d650d-d762-441e-b059-750a8ec9a019	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 21:49:24.135515+00	
00000000-0000-0000-0000-000000000000	63b26b67-d25b-4bde-8584-71735e2a4779	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-08 21:51:14.502515+00	
00000000-0000-0000-0000-000000000000	73e41f5c-1efc-4cc5-9132-80e9abaefb93	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 21:51:23.002725+00	
00000000-0000-0000-0000-000000000000	d3330efb-4d63-4d15-8191-dbc247439980	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 23:43:47.46325+00	
00000000-0000-0000-0000-000000000000	4d55e01a-6f14-40a6-8027-597728056d86	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-08 23:58:44.098694+00	
00000000-0000-0000-0000-000000000000	c7f49f9c-3c80-45b1-9e92-ad531a5b8592	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 00:00:32.068021+00	
00000000-0000-0000-0000-000000000000	46def30c-3889-49d1-9c55-71eeef129612	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 00:00:49.785286+00	
00000000-0000-0000-0000-000000000000	b3fa071c-98ee-4711-ae8e-95749948eacf	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 00:01:04.724146+00	
00000000-0000-0000-0000-000000000000	623ed6b1-7dc0-4340-b99d-8753e83b317d	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 00:01:19.695038+00	
00000000-0000-0000-0000-000000000000	c90f5841-8128-47a6-9d2e-a5f9178bc2e0	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 00:06:29.990969+00	
00000000-0000-0000-0000-000000000000	a0c2e952-2f42-4ff0-aa4b-e5a5c2eab8a4	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 00:06:40.577033+00	
00000000-0000-0000-0000-000000000000	4302cf11-cb3b-4071-b4e2-8a8890ce2d4b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 00:47:53.105816+00	
00000000-0000-0000-0000-000000000000	21d5b509-55a1-4f8e-8c4f-b0e910de9958	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 01:04:56.359574+00	
00000000-0000-0000-0000-000000000000	27cfbff6-a0e5-4c8e-b34c-15be3db42441	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 01:04:56.361393+00	
00000000-0000-0000-0000-000000000000	47236240-5980-4633-8911-0cca49393dd0	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 02:03:26.149353+00	
00000000-0000-0000-0000-000000000000	dd17f8fa-af62-442d-baed-e238c9549712	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 02:03:26.151553+00	
00000000-0000-0000-0000-000000000000	842ee2d1-d177-4dd3-9515-5d8a54ab02da	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 03:01:56.108474+00	
00000000-0000-0000-0000-000000000000	38f1187b-8a09-4d13-92e7-08b99f30234e	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 03:01:56.110163+00	
00000000-0000-0000-0000-000000000000	83c60cbb-5812-4c40-8906-dc2aae6f5fde	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 04:00:25.953676+00	
00000000-0000-0000-0000-000000000000	c8b93de1-2b51-4212-90a0-ecd9c25689b5	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 04:00:25.954704+00	
00000000-0000-0000-0000-000000000000	732cf93c-1220-49e1-82a0-7b06b8797c66	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 04:58:56.131587+00	
00000000-0000-0000-0000-000000000000	671eacc9-4d2d-458e-b782-65e109d31454	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 04:58:56.13721+00	
00000000-0000-0000-0000-000000000000	68ed0e1c-1e61-4e92-b71c-4ec3230aec1b	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 05:57:26.019999+00	
00000000-0000-0000-0000-000000000000	1814e6ed-b7fc-46f0-a34f-971e5c0f71ee	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 05:57:26.021025+00	
00000000-0000-0000-0000-000000000000	7e84fe7a-dfad-4c42-b0fd-e05c8ae99fcd	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 06:55:55.962901+00	
00000000-0000-0000-0000-000000000000	dee97584-7536-4afe-b6db-f1c1390e08fb	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 06:55:55.964452+00	
00000000-0000-0000-0000-000000000000	9e7107be-19a4-4e8a-ab21-8d54456e468a	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 11:28:08.075724+00	
00000000-0000-0000-0000-000000000000	e98df87e-00e3-4c68-993d-8ccacc5ece56	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 11:32:43.707443+00	
00000000-0000-0000-0000-000000000000	93a0a7ea-31a6-455e-9fc1-ab92bb14d779	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 11:32:55.254464+00	
00000000-0000-0000-0000-000000000000	499f4d92-f51f-4955-a5e3-39cfae1bd94a	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 11:38:16.817172+00	
00000000-0000-0000-0000-000000000000	8e550c2f-f977-4553-9142-c3df471c44d7	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-09 11:38:25.589486+00	
00000000-0000-0000-0000-000000000000	2561f1e9-c22d-4436-841a-b85caac8eccf	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 11:38:43.335358+00	
00000000-0000-0000-0000-000000000000	90407257-33b2-4897-bb0d-a406841ce9ec	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 12:17:11.22288+00	
00000000-0000-0000-0000-000000000000	5e85f66b-8ef6-4fdb-9fc6-c4bc1754929e	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 14:17:04.549713+00	
00000000-0000-0000-0000-000000000000	a64771a3-bde0-4faf-a213-9bc07e9eb25b	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 14:17:04.55133+00	
00000000-0000-0000-0000-000000000000	68a526d9-00d5-438f-ad61-f13b898d4ec8	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 15:02:16.048049+00	
00000000-0000-0000-0000-000000000000	30bdfb29-2b30-49be-a408-5ab91507a57b	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 15:02:26.645378+00	
00000000-0000-0000-0000-000000000000	f9ec7029-13c4-4027-9679-bbffb703abee	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 15:02:46.323702+00	
00000000-0000-0000-0000-000000000000	258e5627-931a-4445-a568-de9932ef2ca5	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 15:02:49.930376+00	
00000000-0000-0000-0000-000000000000	4ba648aa-d089-4b81-81ac-0a93ef262856	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-09 15:03:01.93524+00	
00000000-0000-0000-0000-000000000000	b22df569-d64d-4c0e-a1ab-2ef296a53498	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 15:03:19.525727+00	
00000000-0000-0000-0000-000000000000	5dcf9212-8f3b-4cf4-8c83-b6b382ceedb4	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 15:40:59.052437+00	
00000000-0000-0000-0000-000000000000	b017d2bc-09f5-47d2-9b4f-2d9ecbc4c1af	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 15:41:06.346288+00	
00000000-0000-0000-0000-000000000000	5290c647-f0bc-42ff-986f-78cdd1ca5649	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 15:58:42.657948+00	
00000000-0000-0000-0000-000000000000	4a1f89cc-16de-405b-bc1d-256b8aefd8dd	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 18:41:17.631626+00	
00000000-0000-0000-0000-000000000000	a625c8d0-16cd-4d22-912b-c96e273050ae	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 18:41:17.634488+00	
00000000-0000-0000-0000-000000000000	23ceec0c-3fbd-4e07-b190-c42babd35a51	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 19:22:17.757303+00	
00000000-0000-0000-0000-000000000000	eb8b993e-93a1-4fc9-99fc-aa54dadd8103	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 20:21:13.924024+00	
00000000-0000-0000-0000-000000000000	30bfec3a-9679-49c6-9a82-a0e8000db158	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 20:21:13.92553+00	
00000000-0000-0000-0000-000000000000	973603ac-2f9b-4b4c-a284-8cebcbf57b80	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-09 20:52:17.776065+00	
00000000-0000-0000-0000-000000000000	aa61252e-e661-480d-a9c4-7d10350282de	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-09 20:52:29.281795+00	
00000000-0000-0000-0000-000000000000	50ce9a44-a299-4a0c-871d-a42c03bdc407	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 22:35:04.832467+00	
00000000-0000-0000-0000-000000000000	a0458358-4274-4c97-8298-e354d55f4736	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-09 22:35:04.834865+00	
00000000-0000-0000-0000-000000000000	9b120c88-93c9-442b-81b7-0a4ef4f1bfa2	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 10:18:33.335231+00	
00000000-0000-0000-0000-000000000000	8aef6d1b-1a26-4708-99e2-24eecb98dd0c	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 10:18:33.341963+00	
00000000-0000-0000-0000-000000000000	a72962ea-72b2-43dc-80a7-05417fbc8cb8	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 11:30:05.070306+00	
00000000-0000-0000-0000-000000000000	566a263c-86ab-47f4-8b85-4eec2c37caad	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 11:30:05.071198+00	
00000000-0000-0000-0000-000000000000	69e2ffea-c2f6-4936-b875-422932c068f7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talhamushtaq6997@signupgmail.com","user_id":"1d89c0c7-99a3-4807-a8d2-7cb030394b7f","user_phone":""}}	2025-05-10 14:52:24.047589+00	
00000000-0000-0000-0000-000000000000	62e77020-c8d6-4402-9a14-b32b220ad925	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 16:06:52.397463+00	
00000000-0000-0000-0000-000000000000	ea54db14-4686-48d6-b07f-5af33ab78590	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 16:06:52.399961+00	
00000000-0000-0000-0000-000000000000	67662a23-4786-4d3b-a95d-8ecacf235016	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 17:19:47.218894+00	
00000000-0000-0000-0000-000000000000	9b0a3d6f-41c0-484b-ad92-607eeb3a3de6	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 17:19:47.219805+00	
00000000-0000-0000-0000-000000000000	37c86ae6-69b3-4008-9c44-da0e676a940f	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 18:19:49.736713+00	
00000000-0000-0000-0000-000000000000	7a1dabfc-fedc-4713-9f95-1b21a6260bc4	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 18:19:49.741784+00	
00000000-0000-0000-0000-000000000000	2a8d105c-12be-484b-ae9e-d64c0ef1d9a6	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 21:22:33.909225+00	
00000000-0000-0000-0000-000000000000	cd3863a0-4fdc-4d4e-98da-3a1b88b39ca4	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 21:22:33.912253+00	
00000000-0000-0000-0000-000000000000	b4aabbb1-b9d4-47b3-bb2c-deb930ad16bc	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-10 21:22:39.204317+00	
00000000-0000-0000-0000-000000000000	4601daa3-2722-43df-b7e4-8c5836865183	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-10 21:22:42.414616+00	
00000000-0000-0000-0000-000000000000	d684d6c1-fdf7-4959-8788-04e74d2f1d45	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 22:21:12.86053+00	
00000000-0000-0000-0000-000000000000	cdadd020-3730-4876-83e1-66bdafebc535	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-10 22:21:12.86173+00	
00000000-0000-0000-0000-000000000000	80659271-7aee-437a-a378-64af432ebe36	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-11 09:11:17.532611+00	
00000000-0000-0000-0000-000000000000	6aeb3178-7609-4467-a6c5-a6387c7bb507	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-11 09:11:17.536111+00	
00000000-0000-0000-0000-000000000000	3fcd1429-c932-4be3-8522-d8a3e90d1ff7	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-11 10:09:46.216768+00	
00000000-0000-0000-0000-000000000000	aaac2bbc-4e06-40ae-9d11-a4857eea4c06	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-11 10:09:46.218556+00	
00000000-0000-0000-0000-000000000000	7dad3fd0-5df7-454b-923a-0f1a8f646e01	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 11:31:52.228357+00	
00000000-0000-0000-0000-000000000000	f6a12e44-a93f-4e05-80c8-4e55e3630e07	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 11:31:52.238997+00	
00000000-0000-0000-0000-000000000000	6f5219e1-9dcf-4de9-9701-bb6b42544130	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 14:21:36.438475+00	
00000000-0000-0000-0000-000000000000	5b0389eb-ee7f-446f-9608-807e3d85e31d	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 14:21:36.444232+00	
00000000-0000-0000-0000-000000000000	2bc7ac03-6851-4bf9-af90-a4013170a171	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 19:17:51.794862+00	
00000000-0000-0000-0000-000000000000	29a0a3e3-c9bf-4f2a-bc9e-fec092a31831	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 19:17:51.80699+00	
00000000-0000-0000-0000-000000000000	39e68a89-ebf6-415c-a582-c35d87421c44	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 20:27:08.178772+00	
00000000-0000-0000-0000-000000000000	7410d1de-d5e9-451a-ad85-1afef8be95e2	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 20:27:08.187702+00	
00000000-0000-0000-0000-000000000000	9c2bd1ab-419c-4000-a87c-c4456a1a7af1	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 21:39:22.717644+00	
00000000-0000-0000-0000-000000000000	d8b4c48a-df06-40d7-9b48-ed972034a300	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 21:39:22.727664+00	
00000000-0000-0000-0000-000000000000	ab6ffe2a-edab-4ce4-9ce1-ab8b50181144	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 22:47:20.988299+00	
00000000-0000-0000-0000-000000000000	15601e62-cfe6-408e-9fb2-389e9ad33be3	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-12 22:47:20.996651+00	
00000000-0000-0000-0000-000000000000	3bdfcfa4-7c5e-4f30-b3bc-4376afbb6e12	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 11:16:29.163773+00	
00000000-0000-0000-0000-000000000000	b6ffb597-b3ac-4a52-b9a2-8d45f1838d09	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 11:16:29.170241+00	
00000000-0000-0000-0000-000000000000	7e7c17fb-4ca7-4f9a-aa68-96815234179a	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 12:30:20.931965+00	
00000000-0000-0000-0000-000000000000	382b272e-bb14-434f-b65e-785cf46f1b2b	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 12:30:20.940644+00	
00000000-0000-0000-0000-000000000000	dc426d68-fe6d-4ba5-9f63-603c52b3a6c1	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-13 12:41:59.941872+00	
00000000-0000-0000-0000-000000000000	14e5a6aa-06a4-4613-bbe2-c2362522a6fe	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-13 12:42:26.440444+00	
00000000-0000-0000-0000-000000000000	39441205-217e-4573-9e96-f0b8162b9254	{"action":"user_recovery_requested","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-13 12:43:57.525082+00	
00000000-0000-0000-0000-000000000000	956d30b7-e0ec-46cc-b187-b6f4b494015b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-13 12:44:26.604462+00	
00000000-0000-0000-0000-000000000000	ef96fa79-42d6-4fae-af0a-027a8c9561fb	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 13:31:37.89087+00	
00000000-0000-0000-0000-000000000000	6e40f932-dad7-4d84-8e7b-5df93e2f9ab8	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 13:31:37.893269+00	
00000000-0000-0000-0000-000000000000	57674459-2b88-4ee2-b7f2-15ecdafc1f9d	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 14:33:43.217882+00	
00000000-0000-0000-0000-000000000000	229cb84a-f92b-43de-938a-d5c5dfa51e29	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 14:33:43.228727+00	
00000000-0000-0000-0000-000000000000	294273d0-a1b7-43d8-9f83-26477f961b68	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-13 14:57:36.91249+00	
00000000-0000-0000-0000-000000000000	94fbbfce-578a-4998-8fa8-fede0937484e	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 18:08:38.465588+00	
00000000-0000-0000-0000-000000000000	8c578b65-84c5-49d6-a9a6-6181ec03e40e	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 18:08:38.472039+00	
00000000-0000-0000-0000-000000000000	e29147a6-7510-4df9-9404-bc613a0002e8	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 18:39:16.538163+00	
00000000-0000-0000-0000-000000000000	b47b30c6-9019-4f7a-bb60-a85df84c107c	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 18:39:16.541672+00	
00000000-0000-0000-0000-000000000000	5727ecdb-89b3-4979-af47-57f97e7f1ee7	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 19:11:07.830839+00	
00000000-0000-0000-0000-000000000000	e7bd726a-0312-43ad-8ef4-7a8e824ab57e	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 19:11:07.832989+00	
00000000-0000-0000-0000-000000000000	23b11893-d98d-4c75-8f2b-662884ff2846	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 19:49:18.727598+00	
00000000-0000-0000-0000-000000000000	6ecc02f3-f5a0-4403-aaaf-273eaa67306a	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 19:49:18.729089+00	
00000000-0000-0000-0000-000000000000	6acb9927-0833-42ae-90a8-d93cf17359c0	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-13 21:36:11.441307+00	
00000000-0000-0000-0000-000000000000	d6d90be4-7255-4801-8c01-32abae8abe80	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 21:40:45.277825+00	
00000000-0000-0000-0000-000000000000	a9a13dfa-9587-44b1-907b-2c9a571617ad	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 21:40:45.278678+00	
00000000-0000-0000-0000-000000000000	6ea0f2d3-b759-45de-899a-90273b64febc	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 22:36:59.954436+00	
00000000-0000-0000-0000-000000000000	b22fea78-2b4b-41e6-8bd2-b3659b977b61	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-13 22:36:59.955315+00	
00000000-0000-0000-0000-000000000000	4f92c171-e20c-4a23-a3aa-c304277eb5b9	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 01:01:36.512083+00	
00000000-0000-0000-0000-000000000000	6b7a7fd4-dde6-43bc-a91d-c97f49a98c52	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 01:01:36.512969+00	
00000000-0000-0000-0000-000000000000	991ecfa8-a6c7-41fd-bad7-44a07688eee8	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 11:58:40.936519+00	
00000000-0000-0000-0000-000000000000	249be6df-527a-4ca0-934c-af3d5c4a9089	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 11:58:40.943893+00	
00000000-0000-0000-0000-000000000000	42f7f58c-2e10-4dc1-a71b-1d60522a405c	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 14:43:18.544705+00	
00000000-0000-0000-0000-000000000000	22fed8e7-2817-492e-8006-a0b2585fcf9a	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 14:43:18.550568+00	
00000000-0000-0000-0000-000000000000	f61ca75b-252b-4a81-8260-3a1c03aa4d31	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 15:49:48.537126+00	
00000000-0000-0000-0000-000000000000	665ea01a-08d0-459d-94b3-e2ad422d5516	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 15:49:48.541216+00	
00000000-0000-0000-0000-000000000000	1400bf7f-c5d5-40fe-b084-582cd785d150	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 17:01:47.833687+00	
00000000-0000-0000-0000-000000000000	195b1f9b-ca7a-4785-bbdd-b42e001be570	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 17:01:47.835336+00	
00000000-0000-0000-0000-000000000000	ed6ef07d-3650-4537-b2a2-c18bf31cd653	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 17:05:56.262796+00	
00000000-0000-0000-0000-000000000000	79e2cfa8-a1b3-48f2-843c-080f0d5f85f7	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 17:05:56.264553+00	
00000000-0000-0000-0000-000000000000	f821e472-9584-4325-a43f-5da0f93f1efe	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 17:41:43.989787+00	
00000000-0000-0000-0000-000000000000	892a857c-8fdf-4b1b-a2eb-f1585d5dc072	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 17:41:43.99188+00	
00000000-0000-0000-0000-000000000000	9fe071ca-084b-488c-98c5-ed1686fadce6	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-14 17:41:54.158866+00	
00000000-0000-0000-0000-000000000000	47414f9f-a141-4878-b8fa-138efaf24b6c	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-14 17:42:06.108799+00	
00000000-0000-0000-0000-000000000000	4397ed41-0927-46c8-af93-cf85ca9b1462	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-14 17:53:42.49675+00	
00000000-0000-0000-0000-000000000000	dbdfcec0-ce0a-4de9-a891-e424003ab96c	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-14 18:01:28.805704+00	
00000000-0000-0000-0000-000000000000	c2a7de37-b987-4f2b-ae11-5f15e258f3bb	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-14 18:01:33.919566+00	
00000000-0000-0000-0000-000000000000	ec6ddfad-bc94-49e0-8047-bde3224c2b18	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-14 18:01:37.148094+00	
00000000-0000-0000-0000-000000000000	1c3492b1-87bd-4554-aa58-06ab530c5123	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 19:02:09.395685+00	
00000000-0000-0000-0000-000000000000	9e3379b8-66a9-424e-ba03-b669cbbccb92	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 19:02:09.397398+00	
00000000-0000-0000-0000-000000000000	9aebb7e0-0528-4d59-897a-e4a7b509f3c4	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 22:45:41.886482+00	
00000000-0000-0000-0000-000000000000	f68ea7db-0c15-4733-a5b1-8ae85c95b419	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-14 22:45:41.892114+00	
00000000-0000-0000-0000-000000000000	199a4e77-83bc-43d8-90fc-ac8418822da5	{"action":"user_confirmation_requested","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-15 07:26:26.121946+00	
00000000-0000-0000-0000-000000000000	a1d4c927-59dd-4109-80e1-28b16dda1c71	{"action":"user_signedup","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"team"}	2025-05-15 07:27:13.082673+00	
00000000-0000-0000-0000-000000000000	6bdc9081-49cc-403e-8b2e-6a32dfb78100	{"action":"login","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 07:27:23.568036+00	
00000000-0000-0000-0000-000000000000	8d5b2f48-723b-492b-aec9-110307718a97	{"action":"token_refreshed","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 08:27:21.288426+00	
00000000-0000-0000-0000-000000000000	3cf12714-6018-4be9-ac85-84749b149578	{"action":"token_revoked","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 08:27:21.301067+00	
00000000-0000-0000-0000-000000000000	2a5fefdf-9cf9-4003-bc0d-bf7868d3ecce	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 10:09:22.582527+00	
00000000-0000-0000-0000-000000000000	b88a755d-6ecf-4fa8-8f71-5177c013e7f2	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 10:09:22.585887+00	
00000000-0000-0000-0000-000000000000	ef5f9763-4ab8-4eaa-84b8-41c57cc9546d	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 10:16:16.222553+00	
00000000-0000-0000-0000-000000000000	c1be6e69-34d5-4534-84b2-0c7d295c8fd4	{"action":"token_refreshed","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 10:47:50.806856+00	
00000000-0000-0000-0000-000000000000	00b8e9bf-079e-46f2-a76f-8c050defc6f0	{"action":"token_revoked","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 10:47:50.810691+00	
00000000-0000-0000-0000-000000000000	26c7bd3f-4e75-46b5-b68c-8e772f61fbbe	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 11:19:36.925974+00	
00000000-0000-0000-0000-000000000000	ee2f6c68-1731-4915-aa82-8fc82b2c3b52	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 11:19:36.928305+00	
00000000-0000-0000-0000-000000000000	ad91c8da-812f-4d2c-9c34-29f467fb56e8	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-15 11:46:53.121044+00	
00000000-0000-0000-0000-000000000000	b65f0a7e-b5e0-49d7-880a-c76a22793697	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 11:47:01.55214+00	
00000000-0000-0000-0000-000000000000	80b452c7-55ea-427f-9960-17c07784e124	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 11:50:01.242699+00	
00000000-0000-0000-0000-000000000000	88f5f42a-2605-452a-baf8-84f6fa10d730	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 11:56:34.481548+00	
00000000-0000-0000-0000-000000000000	8be4b1bb-c2c3-48d6-840a-56d03cb842e7	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 12:00:14.207555+00	
00000000-0000-0000-0000-000000000000	1bdf49ad-1923-45e8-acaf-f8a964f969c5	{"action":"token_refreshed","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 12:00:58.762299+00	
00000000-0000-0000-0000-000000000000	29e9e2da-3b7f-4b24-8119-25ed9c79c93a	{"action":"token_revoked","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 12:00:58.763026+00	
00000000-0000-0000-0000-000000000000	358f1e52-27f2-4254-b47a-e81ec195576e	{"action":"user_confirmation_requested","actor_id":"8cd651fb-6af2-4a3e-9516-40257b954bd7","actor_username":"user1@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-15 12:42:19.825525+00	
00000000-0000-0000-0000-000000000000	ae0feaf8-cfcb-4a08-b727-c54e62899485	{"action":"user_signedup","actor_id":"8cd651fb-6af2-4a3e-9516-40257b954bd7","actor_username":"user1@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-15 12:42:28.963611+00	
00000000-0000-0000-0000-000000000000	2322c42d-f723-460a-8b2e-12081da5b959	{"action":"login","actor_id":"8cd651fb-6af2-4a3e-9516-40257b954bd7","actor_username":"user1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 12:42:35.578987+00	
00000000-0000-0000-0000-000000000000	7fe55ca2-4130-44cf-8adc-dfb58c787286	{"action":"token_refreshed","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 14:06:20.242628+00	
00000000-0000-0000-0000-000000000000	93f4dcd3-fa9f-4050-9242-9f19474b8c6b	{"action":"token_revoked","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"token"}	2025-05-15 14:06:20.245264+00	
00000000-0000-0000-0000-000000000000	c3d644b7-766d-46d8-8f4f-bb5724da5110	{"action":"logout","actor_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","actor_username":"hassan.mujtaba@codejunkie.co","actor_via_sso":false,"log_type":"account"}	2025-05-15 14:06:23.621524+00	
00000000-0000-0000-0000-000000000000	944b9fde-b995-49b6-a5f5-74e5aca5cf10	{"action":"user_confirmation_requested","actor_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","actor_username":"bb-user-one@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-15 14:07:50.811577+00	
00000000-0000-0000-0000-000000000000	141af537-3230-44fc-9f04-88e6dc96e2ee	{"action":"user_signedup","actor_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","actor_username":"bb-user-one@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-15 14:09:50.16164+00	
00000000-0000-0000-0000-000000000000	81f54107-25a9-45f7-b697-a404954f660a	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 14:37:35.819677+00	
00000000-0000-0000-0000-000000000000	9426b377-e8b2-46ea-b963-6ac64865229c	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 14:37:35.822094+00	
00000000-0000-0000-0000-000000000000	9db57591-f904-4c7d-a1f5-d77da55c0f19	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 16:13:01.410939+00	
00000000-0000-0000-0000-000000000000	0ea8d171-fa4d-4d53-8989-fa22ea775401	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 17:12:14.858297+00	
00000000-0000-0000-0000-000000000000	4bece11a-25dd-46ef-a1b0-9136dcafadf3	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 17:12:14.862143+00	
00000000-0000-0000-0000-000000000000	c061c184-9f68-4cb1-aab4-febbf7842275	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 18:17:53.20506+00	
00000000-0000-0000-0000-000000000000	02889eb2-1b4a-4dc9-a2b7-82736b3f81a3	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 18:17:53.207836+00	
00000000-0000-0000-0000-000000000000	a37345f2-656d-410a-bafd-361551fc45dd	{"action":"token_refreshed","actor_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","actor_username":"bb-user-one@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 19:46:55.472801+00	
00000000-0000-0000-0000-000000000000	09958f4f-72d5-4d56-94cd-356fcd05214c	{"action":"token_revoked","actor_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","actor_username":"bb-user-one@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 19:46:55.475645+00	
00000000-0000-0000-0000-000000000000	c84371b3-458c-4dc4-b22d-8d9e153af3ae	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talhamushtaq6997@gmail.com","user_id":"10c29eea-0a1f-4278-847e-0ba9094e0594","user_phone":""}}	2025-05-15 20:05:55.169125+00	
00000000-0000-0000-0000-000000000000	aedf3922-7ccd-4651-8ad1-f7700e572d98	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 20:06:47.743852+00	
00000000-0000-0000-0000-000000000000	32ac2685-6379-4ce4-836a-8ea005075dbe	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 20:06:47.744499+00	
00000000-0000-0000-0000-000000000000	53f0c3cc-4205-494b-ad53-72d414cf36b6	{"action":"user_confirmation_requested","actor_id":"c1239d24-838a-48b2-be5c-e95208053321","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-15 20:07:08.026113+00	
00000000-0000-0000-0000-000000000000	1ff1cad5-7137-4097-a9df-fa78c299ab1f	{"action":"user_signedup","actor_id":"c1239d24-838a-48b2-be5c-e95208053321","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"team"}	2025-05-15 20:08:12.196435+00	
00000000-0000-0000-0000-000000000000	5f2906e2-57f2-4d47-85ec-94c9270806d1	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 20:08:28.462985+00	
00000000-0000-0000-0000-000000000000	55f1f45e-0213-4045-9d4b-e3ec5c5349e7	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 20:08:28.464893+00	
00000000-0000-0000-0000-000000000000	0af7422c-fd83-4a66-944a-9c463534a571	{"action":"login","actor_id":"c1239d24-838a-48b2-be5c-e95208053321","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 20:30:40.394658+00	
00000000-0000-0000-0000-000000000000	368fd2b8-ecd1-44e9-b65a-0b32473a65cf	{"action":"login","actor_id":"c1239d24-838a-48b2-be5c-e95208053321","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 20:30:45.972236+00	
00000000-0000-0000-0000-000000000000	d129a5e6-731a-4fac-8ede-201c5f47e821	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talhamushtaq6997@gmail.com","user_id":"c1239d24-838a-48b2-be5c-e95208053321","user_phone":""}}	2025-05-15 20:31:26.881932+00	
00000000-0000-0000-0000-000000000000	3bee8fa1-1e6d-4aba-9e6d-6b5cafaa1660	{"action":"user_confirmation_requested","actor_id":"0f3eb531-f964-4379-8ab8-a9217427dad1","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-15 20:31:55.532073+00	
00000000-0000-0000-0000-000000000000	c1d5f1e1-7600-48af-ae03-56ca6ad08ea4	{"action":"user_signedup","actor_id":"0f3eb531-f964-4379-8ab8-a9217427dad1","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"team"}	2025-05-15 20:32:16.203744+00	
00000000-0000-0000-0000-000000000000	a56fe729-e57f-4af8-87af-17e15fdc2c8e	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 21:23:07.218405+00	
00000000-0000-0000-0000-000000000000	88b9534e-c8f6-4370-a9f4-f45cf3ede21d	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 21:23:07.224336+00	
00000000-0000-0000-0000-000000000000	1cf64267-ab2f-447c-b244-ce58600748a5	{"action":"user_recovery_requested","actor_id":"0f3eb531-f964-4379-8ab8-a9217427dad1","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-05-15 21:23:13.448771+00	
00000000-0000-0000-0000-000000000000	845a0356-ce07-475a-b2ef-3835cdb31fec	{"action":"login","actor_id":"0f3eb531-f964-4379-8ab8-a9217427dad1","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-15 21:23:35.906444+00	
00000000-0000-0000-0000-000000000000	e820ffda-2aca-41e3-852f-a45af5e74ebb	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 21:41:35.033269+00	
00000000-0000-0000-0000-000000000000	a60571ed-f09e-4228-befd-cf10b13abaf3	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 21:41:35.035687+00	
00000000-0000-0000-0000-000000000000	0c122ec9-db95-42b6-99b2-1e537c8acf03	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 22:27:57.973932+00	
00000000-0000-0000-0000-000000000000	0c316523-df14-44ad-959a-af265a738a57	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-15 22:27:57.983794+00	
00000000-0000-0000-0000-000000000000	13aaf9ae-f4ba-490d-9f4b-2db013d23955	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-15 22:49:28.341228+00	
00000000-0000-0000-0000-000000000000	f999c678-9318-4dd1-91d6-fceac8525818	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 10:16:23.166639+00	
00000000-0000-0000-0000-000000000000	68a71874-c0db-4938-8be2-3e4e4a76418a	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 10:16:23.174679+00	
00000000-0000-0000-0000-000000000000	22934396-7492-434c-a852-b28b93e2b311	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 10:16:23.469337+00	
00000000-0000-0000-0000-000000000000	8d6b1a16-bf02-47b1-8390-e5aeb83746f8	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 10:22:43.134985+00	
00000000-0000-0000-0000-000000000000	457323a1-40ad-42dc-b35e-6d07f88b61d0	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 10:22:43.140485+00	
00000000-0000-0000-0000-000000000000	92a77764-e502-408a-a9c3-937f194fa101	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 13:50:07.641352+00	
00000000-0000-0000-0000-000000000000	ffd3e547-9918-4bb9-bfcb-0237209e0357	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 13:50:07.645208+00	
00000000-0000-0000-0000-000000000000	3ee308eb-8b7a-4aa9-934d-998900b57430	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-16 13:55:19.636336+00	
00000000-0000-0000-0000-000000000000	9528db4d-407a-40be-aafa-b678fc55e99a	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-16 14:05:53.034859+00	
00000000-0000-0000-0000-000000000000	7d16cfe4-284a-4d3c-90e1-977286802a01	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 15:39:28.357957+00	
00000000-0000-0000-0000-000000000000	7056b8cc-3b74-4628-bdde-f95f1ba38963	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 15:39:28.371507+00	
00000000-0000-0000-0000-000000000000	98cbdb17-1e4d-488b-b09d-2f73a01ce621	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-16 15:40:29.617713+00	
00000000-0000-0000-0000-000000000000	6ecbe709-f5ba-4574-af39-40c0f8851dac	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 17:52:42.28569+00	
00000000-0000-0000-0000-000000000000	8e883747-bad7-4dd0-ae37-2877d169a61d	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 17:52:42.293067+00	
00000000-0000-0000-0000-000000000000	03bddd85-c466-4efc-873f-8dfca4c222f7	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-16 17:54:04.193952+00	
00000000-0000-0000-0000-000000000000	962ea17b-d33d-416f-a936-14287f55aa6c	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-16 20:23:52.509258+00	
00000000-0000-0000-0000-000000000000	f2b71697-9d3e-40c9-8d19-85974f8530a1	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-16 20:38:19.11186+00	
00000000-0000-0000-0000-000000000000	dc587f8b-d485-404f-bbae-40a60c155233	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 21:22:43.404218+00	
00000000-0000-0000-0000-000000000000	91e42547-4c44-4d3f-8642-ebe82d8c5306	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 21:22:43.407729+00	
00000000-0000-0000-0000-000000000000	a3dd9aee-d667-429c-8121-7c183869d759	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-16 21:45:28.249684+00	
00000000-0000-0000-0000-000000000000	c2a2878e-96ff-4041-b926-e964c0e3e404	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-16 21:46:09.819958+00	
00000000-0000-0000-0000-000000000000	05eb8930-4575-4868-a561-86373f5be192	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-18 23:35:39.609238+00	
00000000-0000-0000-0000-000000000000	7ac5404a-7801-4838-b62e-3ff87e71ac05	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-18 23:35:39.625833+00	
00000000-0000-0000-0000-000000000000	340c94e0-aaaa-43a7-a9f8-ebe88974858a	{"action":"token_refreshed","actor_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","actor_username":"bb-user-one@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 07:20:11.599054+00	
00000000-0000-0000-0000-000000000000	3dc187e1-7f3f-4feb-ac53-f17b011693ae	{"action":"token_revoked","actor_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","actor_username":"bb-user-one@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 07:20:11.620078+00	
00000000-0000-0000-0000-000000000000	484fe17e-78d0-43bd-bf51-d486e8834622	{"action":"logout","actor_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","actor_username":"bb-user-one@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-05-19 07:20:28.250823+00	
00000000-0000-0000-0000-000000000000	9d05a3cf-0a7c-48bc-a42e-749703f922e1	{"action":"user_confirmation_requested","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-19 07:20:52.496332+00	
00000000-0000-0000-0000-000000000000	786f1e42-0fd2-4d0d-b323-a0a630bd1cb9	{"action":"user_signedup","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-19 07:21:45.474924+00	
00000000-0000-0000-0000-000000000000	fdb0e0c2-1f3b-488a-82a8-29a89afe833d	{"action":"login","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 10:39:52.229904+00	
00000000-0000-0000-0000-000000000000	dde585cc-a5c7-4bf3-96b9-7525c22273ba	{"action":"token_refreshed","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 11:39:34.07496+00	
00000000-0000-0000-0000-000000000000	e3da893a-b237-4152-8248-fb4ac32d4fef	{"action":"token_revoked","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 11:39:34.078074+00	
00000000-0000-0000-0000-000000000000	97181ace-95f8-4fd5-9307-7c8915959124	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 11:51:54.5393+00	
00000000-0000-0000-0000-000000000000	36828dc1-5bb1-40d2-8255-7098163027d5	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 12:14:58.675757+00	
00000000-0000-0000-0000-000000000000	fbfefe3a-2b34-4dcc-84fb-f7bf14189c29	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 13:13:24.185231+00	
00000000-0000-0000-0000-000000000000	32ffbb7b-d6ee-4e99-9293-ab65970c1dd2	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 13:13:24.19001+00	
00000000-0000-0000-0000-000000000000	1968668a-4f04-4fe8-85f8-ea3e38eba1ad	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 14:11:54.491746+00	
00000000-0000-0000-0000-000000000000	a705d03a-8d11-4300-8bb9-894c9013cc61	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 14:11:54.494811+00	
00000000-0000-0000-0000-000000000000	be8b6d48-459c-4bb4-9bf2-2dcac7ffa083	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 15:13:39.544997+00	
00000000-0000-0000-0000-000000000000	175fbe89-ac1f-4483-97dd-45dc28523a23	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 15:13:39.55486+00	
00000000-0000-0000-0000-000000000000	72aaff0c-2c67-4569-b7cb-62e3b6d1d87b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 16:36:47.563894+00	
00000000-0000-0000-0000-000000000000	06c54771-cdc0-4608-ba21-e1936e00bb8f	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:34:44.361333+00	
00000000-0000-0000-0000-000000000000	084db5fd-bca1-4748-9dde-9d6c3350d04d	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:34:44.366834+00	
00000000-0000-0000-0000-000000000000	ff63d411-27a3-4769-b6cf-9d7579b7edfb	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:35:19.444166+00	
00000000-0000-0000-0000-000000000000	3cab4871-76e2-47da-a7de-37c25c286b1f	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:35:19.448464+00	
00000000-0000-0000-0000-000000000000	bcf95043-d8e5-4fa4-8064-8996f1ad9aac	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:50:33.980038+00	
00000000-0000-0000-0000-000000000000	257fe812-aa70-4a42-8d57-5f9e1f0c8c24	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:50:33.982165+00	
00000000-0000-0000-0000-000000000000	75be3c39-6669-42a0-8806-009ba7841fd6	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-19 18:25:47.961413+00	
00000000-0000-0000-0000-000000000000	a6be67bc-188b-4365-957f-9da1f7a3153b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 18:30:12.491104+00	
00000000-0000-0000-0000-000000000000	a09a5121-ea5c-4b62-a3be-8016856ae86e	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 19:38:17.905709+00	
00000000-0000-0000-0000-000000000000	33a7dbda-3f20-430e-97b9-bc1facb8fb34	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 19:38:17.906642+00	
00000000-0000-0000-0000-000000000000	e7512185-815a-4255-bd01-9320e7cc06bc	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 19:55:16.859929+00	
00000000-0000-0000-0000-000000000000	c19f1174-e2b9-4a2c-ac57-8bd00f3bb6d6	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 20:37:18.042365+00	
00000000-0000-0000-0000-000000000000	96ad37ef-471a-4497-b74e-7b366fe13b59	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 20:37:18.052665+00	
00000000-0000-0000-0000-000000000000	f8e789bd-8575-4eea-b761-2877b197d8fc	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 20:46:04.997085+00	
00000000-0000-0000-0000-000000000000	12aa9778-8d50-478f-ba8f-ea813f2a3ff4	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 21:36:38.820624+00	
00000000-0000-0000-0000-000000000000	7c9b21ab-aa44-4909-8ecd-fdf78d19f7a0	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 21:36:38.823284+00	
00000000-0000-0000-0000-000000000000	65a0a283-2b65-4c77-8988-2bb4b42937ae	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 21:47:58.471+00	
00000000-0000-0000-0000-000000000000	286857f9-c102-4ff6-9ad7-55e0c49731aa	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-19 21:47:58.473056+00	
00000000-0000-0000-0000-000000000000	787d4d01-a874-4ed1-8dda-d02c378b17bb	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 22:29:10.361164+00	
00000000-0000-0000-0000-000000000000	48ae41de-b5aa-466e-b956-b3161a04811b	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-19 22:32:23.128244+00	
00000000-0000-0000-0000-000000000000	3341a583-973f-4d49-9fc5-f099cafc5a54	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-20 11:56:25.139068+00	
00000000-0000-0000-0000-000000000000	33a2cfa5-94c6-41de-a794-95c269e44054	{"action":"token_refreshed","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 12:33:43.158766+00	
00000000-0000-0000-0000-000000000000	117e81ab-63ed-47d0-b8cd-868676e6bdb6	{"action":"token_revoked","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 12:33:43.165164+00	
00000000-0000-0000-0000-000000000000	e37fe7d6-95ed-4f10-b511-4da17eacf7cc	{"action":"token_refreshed","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 13:54:25.972705+00	
00000000-0000-0000-0000-000000000000	8b5e333e-19b5-4a07-a6aa-c78e6f334962	{"action":"token_revoked","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 13:54:25.976977+00	
00000000-0000-0000-0000-000000000000	78ac74af-7424-438a-b1db-1acde8eb9724	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-20 16:15:13.322635+00	
00000000-0000-0000-0000-000000000000	1cdc304e-042b-459d-b39a-c655df3aa592	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 17:14:07.658169+00	
00000000-0000-0000-0000-000000000000	fc41c64a-ac83-46c4-b267-61d0150b4f2e	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 17:14:07.66183+00	
00000000-0000-0000-0000-000000000000	15ed4661-3844-4e14-bd00-32bf7dde8554	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 18:46:59.021484+00	
00000000-0000-0000-0000-000000000000	13f3f6a2-787b-41ea-aa2c-4cc80b91fc59	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-20 18:46:59.024715+00	
00000000-0000-0000-0000-000000000000	a3ed0f0b-4508-4576-bb6f-687775272a19	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-20 19:04:12.954806+00	
00000000-0000-0000-0000-000000000000	f28f545b-7acc-4645-ab31-f2a06d1c6fa2	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 11:54:28.107921+00	
00000000-0000-0000-0000-000000000000	d5033197-f6ca-4812-b215-21c8a9abe62d	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 11:54:28.117018+00	
00000000-0000-0000-0000-000000000000	30160a04-7618-43df-aef0-9a8edceb6d16	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 11:54:34.381656+00	
00000000-0000-0000-0000-000000000000	202612d2-16cf-4ce2-9d0d-93b4273acee0	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 11:54:34.382289+00	
00000000-0000-0000-0000-000000000000	b508c9c9-a322-4511-903c-47e77cb81df0	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 14:14:05.344951+00	
00000000-0000-0000-0000-000000000000	06631fb8-1931-4343-95c9-009aa45e916c	{"action":"user_repeated_signup","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-21 14:14:40.908701+00	
00000000-0000-0000-0000-000000000000	805592c0-1b98-4702-b7e6-59ae5f1babc8	{"action":"user_confirmation_requested","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-21 14:15:10.850201+00	
00000000-0000-0000-0000-000000000000	6d5fd43b-37ef-44ce-949f-b47aab56bfc6	{"action":"user_signedup","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-21 14:15:39.195642+00	
00000000-0000-0000-0000-000000000000	a57749a7-2230-4bd0-bbba-07b32e4ef0c6	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 14:19:32.612988+00	
00000000-0000-0000-0000-000000000000	422bdcdf-46c6-4202-9cb6-677d3a2cce5f	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 14:19:32.614946+00	
00000000-0000-0000-0000-000000000000	825b9e31-5933-48c5-bfe2-b2b13050f090	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 14:19:37.884808+00	
00000000-0000-0000-0000-000000000000	788df1cf-3068-4ba4-bd67-bb0127709c01	{"action":"user_confirmation_requested","actor_id":"f36a75dc-24e8-4740-a4e5-de37a39adbb5","actor_username":"pakistan2@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-21 14:21:00.002773+00	
00000000-0000-0000-0000-000000000000	793d8130-2ae4-4c31-83b0-f83c25dfcff2	{"action":"user_signedup","actor_id":"f36a75dc-24e8-4740-a4e5-de37a39adbb5","actor_username":"pakistan2@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-21 14:21:21.811516+00	
00000000-0000-0000-0000-000000000000	a8e8c6b2-affb-405a-95ad-8778937f2835	{"action":"token_refreshed","actor_id":"f36a75dc-24e8-4740-a4e5-de37a39adbb5","actor_username":"pakistan2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 15:40:46.255065+00	
00000000-0000-0000-0000-000000000000	e10c1a67-ebeb-4722-b051-8315b6349acd	{"action":"token_revoked","actor_id":"f36a75dc-24e8-4740-a4e5-de37a39adbb5","actor_username":"pakistan2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 15:40:46.257835+00	
00000000-0000-0000-0000-000000000000	e4e46651-a778-43e7-8f9d-36ff922c0ff1	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 15:40:49.921259+00	
00000000-0000-0000-0000-000000000000	63bb0849-f7d9-449a-af3f-5448a94091bc	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 16:39:05.279403+00	
00000000-0000-0000-0000-000000000000	58dbe3b8-e17d-4800-9263-3cbe754266ab	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 16:39:05.287763+00	
00000000-0000-0000-0000-000000000000	38177333-a2c7-4d04-8954-519a6f55e4d9	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 17:10:10.737292+00	
00000000-0000-0000-0000-000000000000	18377bb5-fa1c-4298-8ca5-ce4a0255ec8b	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 18:08:22.414251+00	
00000000-0000-0000-0000-000000000000	18d1c382-4d0d-4649-a16a-09946da09cd8	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 18:08:22.417618+00	
00000000-0000-0000-0000-000000000000	32fbb5a3-0ad9-4c92-a234-26493a09176c	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 18:15:22.909724+00	
00000000-0000-0000-0000-000000000000	e38657bc-8636-4fe0-bd2f-6dd545a55500	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 18:15:22.912313+00	
00000000-0000-0000-0000-000000000000	69dfa3e1-4b3c-4097-ab01-784432375104	{"action":"token_refreshed","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 18:26:04.664291+00	
00000000-0000-0000-0000-000000000000	6da722bf-1dd7-4453-a13e-e8a7a2a85e47	{"action":"token_revoked","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 18:26:04.666101+00	
00000000-0000-0000-0000-000000000000	8d71c451-ed25-4454-a3e2-365e4625aba7	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 19:06:52.369004+00	
00000000-0000-0000-0000-000000000000	502f2af4-6b91-44f7-9df9-72a0787d31bf	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 19:06:52.370504+00	
00000000-0000-0000-0000-000000000000	08b5dd60-1178-462d-a197-d23d05bca8f9	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:00:41.402517+00	
00000000-0000-0000-0000-000000000000	f4841af8-5478-4d8f-93a7-0a78a9a617db	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:13:38.597896+00	
00000000-0000-0000-0000-000000000000	5577d537-b295-4f5a-823e-a9c551db3cc1	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:19:23.903334+00	
00000000-0000-0000-0000-000000000000	78e5e813-0b2c-4f6d-8cbb-06dee63eabc2	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:19:40.012254+00	
00000000-0000-0000-0000-000000000000	8c77e716-6654-4455-9ce6-51b939851f51	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:20:07.942465+00	
00000000-0000-0000-0000-000000000000	284ee2c1-dbbe-465c-b9f4-1cff68db077a	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:26:45.646361+00	
00000000-0000-0000-0000-000000000000	89b347d3-335c-41da-817b-d3e7b9f71ef4	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:34:21.697044+00	
00000000-0000-0000-0000-000000000000	6a571bae-3b58-4edd-ad81-a8c48b3067a0	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:36:11.951349+00	
00000000-0000-0000-0000-000000000000	326dbbce-2790-4508-81d6-8ab85e526cd6	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:40:49.035672+00	
00000000-0000-0000-0000-000000000000	94efff64-f3d5-4559-b285-0e868e38807a	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:42:52.509638+00	
00000000-0000-0000-0000-000000000000	9d789513-391b-4507-b9ed-89fb454425eb	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:43:32.510799+00	
00000000-0000-0000-0000-000000000000	69075afa-c9c6-4e1d-a07f-0688d713701d	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 20:46:04.589256+00	
00000000-0000-0000-0000-000000000000	fa391d91-295b-4edb-b968-a7f2c411a6b0	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:46:52.113498+00	
00000000-0000-0000-0000-000000000000	0ccdf9b2-fd33-4bd2-a94c-241eb8c691fc	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 20:52:55.63978+00	
00000000-0000-0000-0000-000000000000	2d296943-47f3-4f8e-857a-67eb041194cd	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:53:00.976703+00	
00000000-0000-0000-0000-000000000000	a849c397-0ce2-4b33-be61-b5a84477a847	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 20:54:07.27385+00	
00000000-0000-0000-0000-000000000000	33c47c69-f5b0-44a7-9230-dcbda372187f	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 20:54:09.364365+00	
00000000-0000-0000-0000-000000000000	e3be1b44-d87e-4ce9-92a3-e8a294c40657	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 21:05:06.095293+00	
00000000-0000-0000-0000-000000000000	b55a3d97-0442-4cb4-b7a2-685363423bdb	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 21:52:34.247098+00	
00000000-0000-0000-0000-000000000000	73445213-c2c4-4bc8-9a07-9c7225b71afc	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 21:52:34.248596+00	
00000000-0000-0000-0000-000000000000	13c96c6b-4152-478e-ae23-dbb4e0f36140	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 22:07:46.686093+00	
00000000-0000-0000-0000-000000000000	19385ddd-6c22-497c-90e8-717b04c68b79	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-21 22:07:46.68792+00	
00000000-0000-0000-0000-000000000000	1cbc236b-3e33-42d6-ba54-bfd3fb109678	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 22:36:30.065866+00	
00000000-0000-0000-0000-000000000000	cab95778-43b0-4008-8c0c-1d2bca848c9c	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 22:37:02.661022+00	
00000000-0000-0000-0000-000000000000	91ed76d0-e05e-4e5b-938f-a84f5df68402	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 22:37:06.147363+00	
00000000-0000-0000-0000-000000000000	962ac4ce-7cb8-4cd4-ae5e-fb7cd0060e22	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 22:53:49.16993+00	
00000000-0000-0000-0000-000000000000	abdc1025-d389-4d98-a821-ae870bfe383d	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 22:53:51.968197+00	
00000000-0000-0000-0000-000000000000	5215b4aa-0065-46cf-8931-0365e3c56805	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 22:57:56.611261+00	
00000000-0000-0000-0000-000000000000	52db1746-dbb1-48e5-8400-6c87c7f229aa	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 22:58:46.974116+00	
00000000-0000-0000-0000-000000000000	d059d74c-b3dd-4ca6-a0f9-90b45915801c	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:00:31.860745+00	
00000000-0000-0000-0000-000000000000	b28c5bc7-d648-4909-ae69-99547e62e790	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 23:02:58.272569+00	
00000000-0000-0000-0000-000000000000	f8506649-0dea-4656-90c5-599885ded987	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:03:01.202286+00	
00000000-0000-0000-0000-000000000000	52497899-48f4-4e54-bd3d-79bd493633ff	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 23:03:09.942427+00	
00000000-0000-0000-0000-000000000000	590ec289-c5c4-4558-835c-3de5ebe0aca4	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:03:13.084732+00	
00000000-0000-0000-0000-000000000000	0426d43f-6d50-4366-87fc-1de4046d412a	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 23:12:01.728314+00	
00000000-0000-0000-0000-000000000000	f7e258ad-a6e0-4698-9582-1fdcfccbaeb4	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:12:03.489869+00	
00000000-0000-0000-0000-000000000000	a44fbf8b-7994-4dda-813f-e2f97c469c1f	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 23:21:56.62475+00	
00000000-0000-0000-0000-000000000000	1abeacf6-7927-424a-a283-9facef8b8735	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:21:58.813413+00	
00000000-0000-0000-0000-000000000000	992c85fc-c4a7-4d30-bdbe-6ad15b07a1d3	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 23:38:27.979107+00	
00000000-0000-0000-0000-000000000000	41fdea17-b908-4498-ac1d-7afb7518d663	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:38:29.728365+00	
00000000-0000-0000-0000-000000000000	183ec9f1-44a6-44ce-ab94-ab0f0320295c	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 23:39:56.539047+00	
00000000-0000-0000-0000-000000000000	f914dcc1-e9ab-4f01-b0cf-fdbb2c348bb7	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:39:58.236564+00	
00000000-0000-0000-0000-000000000000	68629b81-ac8b-4604-85f9-08594adccfb8	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-21 23:46:55.601427+00	
00000000-0000-0000-0000-000000000000	7c5c0968-4658-476a-86c7-b93e6738d463	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-21 23:46:56.952292+00	
00000000-0000-0000-0000-000000000000	f56c281a-249f-4d0f-af50-0e3dfb887056	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 00:45:29.512691+00	
00000000-0000-0000-0000-000000000000	cff8c2f0-0d69-40a3-b63a-775c781dea17	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 00:45:29.514641+00	
00000000-0000-0000-0000-000000000000	5894b92f-7944-4cff-a8c4-9d1a9654a629	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-22 00:55:40.414351+00	
00000000-0000-0000-0000-000000000000	d2ba9186-8677-4b10-82bb-f5ec52e320cc	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 09:54:46.348663+00	
00000000-0000-0000-0000-000000000000	97c6eb6f-0362-4868-8cb6-f25b316271f6	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 09:54:46.364149+00	
00000000-0000-0000-0000-000000000000	05fcb123-f74c-4cb3-88eb-a8368df6eea4	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 10:52:57.383112+00	
00000000-0000-0000-0000-000000000000	a7a3d13a-14f7-478c-b570-c0e950a3b5ad	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 10:52:57.385971+00	
00000000-0000-0000-0000-000000000000	3e6202cc-62dc-43fd-b597-4fd3a54040cd	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 11:53:29.399885+00	
00000000-0000-0000-0000-000000000000	1e6b0e48-e4cd-4ba0-bdc0-a4d3436d1829	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 11:53:29.401337+00	
00000000-0000-0000-0000-000000000000	d3dd34e7-7763-460e-96ff-abd10cb16cca	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 11:53:32.856498+00	
00000000-0000-0000-0000-000000000000	efa1296d-41c7-4363-af3f-74042ae19a04	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 11:53:32.857081+00	
00000000-0000-0000-0000-000000000000	4cbdb4d5-0f59-420e-a72b-412d1d3497a0	{"action":"token_refreshed","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 12:12:31.126462+00	
00000000-0000-0000-0000-000000000000	f7d00faa-ad4d-4ec0-99c0-08790fbae21d	{"action":"token_revoked","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 12:12:31.127329+00	
00000000-0000-0000-0000-000000000000	703ce6c9-95b8-4210-a071-ee60ab17d7fe	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-22 12:23:33.541984+00	
00000000-0000-0000-0000-000000000000	cc25108e-1a4e-4a5c-beb6-98295b60ef30	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 12:51:46.348414+00	
00000000-0000-0000-0000-000000000000	4ca3b760-21e7-431f-ad46-80bae1e8a727	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 12:51:46.349301+00	
00000000-0000-0000-0000-000000000000	636c1cd1-f0f9-4248-9b83-e6216a8e5194	{"action":"token_refreshed","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 13:10:00.923448+00	
00000000-0000-0000-0000-000000000000	fe51130b-6bb4-45a8-813a-ae14c1222359	{"action":"token_revoked","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 13:10:00.925501+00	
00000000-0000-0000-0000-000000000000	e4c6c4f7-3c3a-4235-9883-e8abaf12da1a	{"action":"logout","actor_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","actor_username":"hassan-betterbook-2@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-05-22 13:10:12.347189+00	
00000000-0000-0000-0000-000000000000	1ac6b125-e556-4c3a-b9a7-cb583e784704	{"action":"user_confirmation_requested","actor_id":"47592c54-c10e-4ba2-8ae6-81df7e277b81","actor_username":"hassan-betterbook-3@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-22 13:10:24.794037+00	
00000000-0000-0000-0000-000000000000	ff848e91-cb5b-462d-9141-4fc3994b5b57	{"action":"user_signedup","actor_id":"47592c54-c10e-4ba2-8ae6-81df7e277b81","actor_username":"hassan-betterbook-3@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-22 13:10:41.748456+00	
00000000-0000-0000-0000-000000000000	a7a6a2d4-b20e-4fad-9d03-9ee2d7642e07	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 13:24:33.261252+00	
00000000-0000-0000-0000-000000000000	882020eb-f04d-4eff-b144-83dfce5cbadf	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 13:24:33.264071+00	
00000000-0000-0000-0000-000000000000	64dfedc4-61e6-4e50-9ccc-516668354b56	{"action":"logout","actor_id":"47592c54-c10e-4ba2-8ae6-81df7e277b81","actor_username":"hassan-betterbook-3@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-05-22 13:53:30.643969+00	
00000000-0000-0000-0000-000000000000	ef31b6fe-9541-4fa9-99da-a9f6577009c4	{"action":"user_confirmation_requested","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-22 13:54:23.991011+00	
00000000-0000-0000-0000-000000000000	3d1e6414-efc7-432a-aed3-099dca6d3055	{"action":"user_signedup","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-22 13:54:31.970997+00	
00000000-0000-0000-0000-000000000000	007fcb1c-1657-4ba4-aaef-a68d9d3fd59f	{"action":"token_refreshed","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 15:01:45.370643+00	
00000000-0000-0000-0000-000000000000	870b7fe5-13de-489d-86c1-ff17e7ee0d39	{"action":"token_revoked","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 15:01:45.37308+00	
00000000-0000-0000-0000-000000000000	ab3ef7fa-b394-48f9-ad26-f92fcb92f1b6	{"action":"logout","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-05-22 15:01:52.630833+00	
00000000-0000-0000-0000-000000000000	152b325f-e685-47d8-adda-b5f53c09f166	{"action":"login","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-22 15:02:45.406541+00	
00000000-0000-0000-0000-000000000000	1940451f-7e7b-496e-9b2c-53dfb0c7bd0f	{"action":"token_refreshed","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 16:36:22.34181+00	
00000000-0000-0000-0000-000000000000	568ca3e0-9b2f-4aef-b7b6-11858093939c	{"action":"token_revoked","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 16:36:22.345458+00	
00000000-0000-0000-0000-000000000000	3229ab1f-f578-4435-96f1-db57fd4afbd7	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 19:23:42.47846+00	
00000000-0000-0000-0000-000000000000	d4f0d613-ffc2-4c5f-8fed-4d3eddd7b8d3	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 19:23:42.49574+00	
00000000-0000-0000-0000-000000000000	4a29305c-a17e-4372-9d56-98818b4f70bb	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 19:26:09.781335+00	
00000000-0000-0000-0000-000000000000	057dd4b5-bec0-4f43-97f7-ac118394dd00	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 19:26:09.782348+00	
00000000-0000-0000-0000-000000000000	db1fac08-7345-4508-988c-709f8a271e41	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 20:32:07.230579+00	
00000000-0000-0000-0000-000000000000	15a6a994-9b15-4c14-94d3-eec0fc3efb9f	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 20:32:07.23411+00	
00000000-0000-0000-0000-000000000000	eb2ff8bd-cbbc-4d05-9e26-60d2264b3c3d	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 21:55:46.443869+00	
00000000-0000-0000-0000-000000000000	befff657-57f7-4960-a807-cab63234b6d5	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 21:55:46.447024+00	
00000000-0000-0000-0000-000000000000	f0c91ec4-d775-461b-966c-a91d49321e92	{"action":"token_refreshed","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 21:56:27.223573+00	
00000000-0000-0000-0000-000000000000	d311345f-6d1d-4fec-999b-5ded7e9d4308	{"action":"token_revoked","actor_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","actor_username":"pakistan1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 21:56:27.225135+00	
00000000-0000-0000-0000-000000000000	d0a4951b-43b9-4345-98a2-f3fec836b858	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-22 21:56:42.118321+00	
00000000-0000-0000-0000-000000000000	a60188cc-ed62-4a7c-8a6c-7acbf2617d8a	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 22:58:41.059189+00	
00000000-0000-0000-0000-000000000000	e731b7ff-18da-4425-a3c7-e45adb03e810	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-22 22:58:41.061278+00	
00000000-0000-0000-0000-000000000000	b6200197-22c3-4662-8fba-be94b0cb79d1	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-23 10:28:28.686724+00	
00000000-0000-0000-0000-000000000000	322b87e2-1e6e-4bb2-9ad6-b571e2622307	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-23 10:28:28.710305+00	
00000000-0000-0000-0000-000000000000	aca23acb-befb-4bbb-8a10-b9f73bf58b65	{"action":"token_refreshed","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-23 11:10:18.067842+00	
00000000-0000-0000-0000-000000000000	b89952bc-62e6-4341-97c8-a1a4332a9161	{"action":"token_revoked","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-23 11:10:18.070263+00	
00000000-0000-0000-0000-000000000000	5369a734-5ece-4bbe-a71c-bc357b7a25f6	{"action":"logout","actor_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","actor_username":"hassan-bb-4@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-05-23 11:10:24.491449+00	
00000000-0000-0000-0000-000000000000	c83fca86-f164-41bf-96b4-247bd1e91886	{"action":"user_confirmation_requested","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-23 11:11:07.666658+00	
00000000-0000-0000-0000-000000000000	2dac643d-c2d5-425f-8903-bd98e4ca953f	{"action":"user_signedup","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-05-23 11:11:19.4431+00	
00000000-0000-0000-0000-000000000000	ab299e94-53c3-436f-90af-a51fc6daae0b	{"action":"token_refreshed","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-23 16:45:59.268+00	
00000000-0000-0000-0000-000000000000	04b658ba-2fd8-46dc-b3c1-59058e504ad8	{"action":"token_revoked","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-05-23 16:45:59.271383+00	
00000000-0000-0000-0000-000000000000	167ee113-263a-4d03-bf4b-d1a1d7bd38f1	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-29 15:17:17.564746+00	
00000000-0000-0000-0000-000000000000	94761566-70c8-4ed5-b59c-1b95279df04e	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-29 15:17:17.583922+00	
00000000-0000-0000-0000-000000000000	265b20af-cbb1-441c-818e-3a5158a6d784	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-29 15:17:24.373368+00	
00000000-0000-0000-0000-000000000000	96d2eb27-d06d-4602-bd3f-0d9b6b912d9a	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-29 16:22:42.432797+00	
00000000-0000-0000-0000-000000000000	fb85e2c6-312b-4522-8675-2af97dc195d3	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-29 16:22:42.438627+00	
00000000-0000-0000-0000-000000000000	fc985ed4-bde3-4d55-b8b3-365c2c56bd8d	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-31 06:30:01.323597+00	
00000000-0000-0000-0000-000000000000	40ee6c18-6106-43d3-bb89-42e29fcfa515	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-31 06:30:01.338531+00	
00000000-0000-0000-0000-000000000000	c3cc1c4d-0edb-415b-8c90-cbc88cafc609	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-04 11:40:00.568011+00	
00000000-0000-0000-0000-000000000000	a0ea98ca-8de7-4da4-b153-25ded34fadc4	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-04 11:40:00.578436+00	
00000000-0000-0000-0000-000000000000	02132420-2645-4375-9440-2937d8224a92	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 16:50:32.098546+00	
00000000-0000-0000-0000-000000000000	22025e21-80c3-4282-8f2f-4758aad6a025	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 16:50:32.105636+00	
00000000-0000-0000-0000-000000000000	78b3267e-95a8-4ced-af29-8e6f8225b983	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-02 16:50:36.566909+00	
00000000-0000-0000-0000-000000000000	c984ce29-ce1e-4c7f-a3a2-e5a45080fd77	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 18:26:26.696372+00	
00000000-0000-0000-0000-000000000000	e11ece85-5a21-4679-9b3a-a05ad15282c4	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 18:26:26.701604+00	
00000000-0000-0000-0000-000000000000	39d5c75c-f0df-4bb9-af52-405da218f189	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 20:12:49.167852+00	
00000000-0000-0000-0000-000000000000	d3dfd9a4-e1b3-45ce-a8c6-687e7938712f	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 20:12:49.17108+00	
00000000-0000-0000-0000-000000000000	f745def8-7b1a-45b1-91a8-d68835d6d22a	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 07:05:00.433424+00	
00000000-0000-0000-0000-000000000000	1fb2ac0a-8698-4d6e-98f8-11a305ccc738	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 07:05:00.443383+00	
00000000-0000-0000-0000-000000000000	c56dbc7f-93dd-4aea-accb-bd2ffb81972c	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 09:43:28.608023+00	
00000000-0000-0000-0000-000000000000	a74e36ff-598c-4ddd-ad2b-930cfcca559c	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 09:43:28.613884+00	
00000000-0000-0000-0000-000000000000	8480d360-ad63-47ee-8d32-43c43847754a	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 17:08:36.007302+00	
00000000-0000-0000-0000-000000000000	ef912a1f-00dd-4d9a-84fd-98d29c8073f1	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 17:08:36.015785+00	
00000000-0000-0000-0000-000000000000	e20900ff-c979-4bfa-9204-f2083fbcab66	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-07-03 17:08:51.030995+00	
00000000-0000-0000-0000-000000000000	80a77863-abc5-45a3-aea4-5e7ef8e1b365	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 17:08:53.404565+00	
00000000-0000-0000-0000-000000000000	2774172f-738a-4632-923e-1481cadc6a26	{"action":"token_refreshed","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 18:08:05.756215+00	
00000000-0000-0000-0000-000000000000	0bf8cf87-1520-4e03-a7f0-f9292fffba69	{"action":"token_revoked","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 18:08:05.75866+00	
00000000-0000-0000-0000-000000000000	16d69916-f24e-4a33-8846-8d42f23a7fbe	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-07-03 18:09:24.427503+00	
00000000-0000-0000-0000-000000000000	9efca158-8b9d-43e7-8945-41204fc10b68	{"action":"user_confirmation_requested","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-03 18:10:05.189931+00	
00000000-0000-0000-0000-000000000000	7b788dd7-b334-4010-8924-c514441a2b12	{"action":"user_signedup","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-03 18:10:37.36269+00	
00000000-0000-0000-0000-000000000000	b7171d94-0463-4de5-9ad0-f55297c8ce10	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 18:18:20.83864+00	
00000000-0000-0000-0000-000000000000	de5fc8b9-9ccc-4607-8a1b-a5044f48e304	{"action":"logout","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-07-03 18:18:42.557259+00	
00000000-0000-0000-0000-000000000000	645d067b-ee6d-43d7-ae15-37405e82fb6d	{"action":"login","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 18:20:46.370364+00	
00000000-0000-0000-0000-000000000000	21961dc2-5e40-4399-a70c-7be8f39a88c8	{"action":"logout","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-03 18:21:02.34802+00	
00000000-0000-0000-0000-000000000000	106c38e4-c439-4d17-a563-5956692fee74	{"action":"login","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 18:21:07.309121+00	
00000000-0000-0000-0000-000000000000	37f8b96c-aefa-479a-bb42-67f0abf39d56	{"action":"logout","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-03 18:29:22.799238+00	
00000000-0000-0000-0000-000000000000	eba8cb00-061c-4928-b4a3-6804a3ae4fff	{"action":"login","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 19:11:21.13568+00	
00000000-0000-0000-0000-000000000000	8bbdf29f-dd5f-412e-ad75-1da5f5033384	{"action":"login","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 19:53:37.63416+00	
00000000-0000-0000-0000-000000000000	bdb2d2f7-a838-4408-ac08-eea429df6006	{"action":"login","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 19:53:42.919998+00	
00000000-0000-0000-0000-000000000000	111c8dd3-2132-4150-a327-b23636c19cc3	{"action":"login","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 20:00:14.544386+00	
00000000-0000-0000-0000-000000000000	1218c007-95e1-430d-b511-78c0beff1560	{"action":"user_confirmation_requested","actor_id":"2cdb895a-37d5-4e45-8fff-6fec470644d2","actor_username":"talha2@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-03 20:40:49.234987+00	
00000000-0000-0000-0000-000000000000	b89ffbf8-6190-4a32-aa8c-5c14d8f3bac0	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talha2@mailinator.com","user_id":"2cdb895a-37d5-4e45-8fff-6fec470644d2","user_phone":""}}	2025-07-03 20:43:52.114542+00	
00000000-0000-0000-0000-000000000000	a3759158-c87d-4b9a-aa0a-a74d0e964961	{"action":"user_confirmation_requested","actor_id":"9ca25f42-2404-4647-b37d-5036e6b761ec","actor_username":"talha2@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-03 20:44:44.165225+00	
00000000-0000-0000-0000-000000000000	7814bf70-3cf6-49d3-83a1-93c48048ffc5	{"action":"token_refreshed","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 21:14:36.927948+00	
00000000-0000-0000-0000-000000000000	e1fc1b6f-ad10-461a-9321-98939b1caa78	{"action":"token_revoked","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 21:14:36.930698+00	
00000000-0000-0000-0000-000000000000	dbe71003-44e4-4694-ac25-4c4891fa0cf1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talha2@mailinator.com","user_id":"9ca25f42-2404-4647-b37d-5036e6b761ec","user_phone":""}}	2025-07-03 21:16:21.495769+00	
00000000-0000-0000-0000-000000000000	9ce8b993-122e-439f-9d4b-51615ae81d29	{"action":"user_confirmation_requested","actor_id":"2ded6d01-0854-43ac-b6c9-a3a95085c22b","actor_username":"talha2@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-03 21:17:04.099166+00	
00000000-0000-0000-0000-000000000000	89b85904-8982-468b-9b59-33477d7f061c	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 21:17:16.437983+00	
00000000-0000-0000-0000-000000000000	df3b920b-eeaa-444e-b74a-2637c3e37991	{"action":"user_confirmation_requested","actor_id":"d3b4681d-67f5-4def-9cb2-279572782b9a","actor_username":"talha3@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-03 21:21:16.424164+00	
00000000-0000-0000-0000-000000000000	7eb9f58b-c38a-4081-89f6-d4d9c01040bd	{"action":"user_signedup","actor_id":"d3b4681d-67f5-4def-9cb2-279572782b9a","actor_username":"talha3@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-03 21:21:49.386893+00	
00000000-0000-0000-0000-000000000000	a5c207af-ad33-41ce-b18d-2ac12e1b7fed	{"action":"login","actor_id":"d3b4681d-67f5-4def-9cb2-279572782b9a","actor_username":"talha3@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 21:22:19.896299+00	
00000000-0000-0000-0000-000000000000	87f97ea3-14f5-4c49-ae7c-61481c8cf8da	{"action":"user_confirmation_requested","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-03 21:23:58.703005+00	
00000000-0000-0000-0000-000000000000	c8b0751a-ee2e-418f-a4eb-8a5e5a75f5c0	{"action":"user_signedup","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-03 21:25:04.635913+00	
00000000-0000-0000-0000-000000000000	8724601f-d391-409b-8976-b328372c7aa7	{"action":"login","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-03 21:25:08.982792+00	
00000000-0000-0000-0000-000000000000	57b28fc8-bea3-4cbb-817a-8f080fc4c50c	{"action":"token_refreshed","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 06:16:26.883475+00	
00000000-0000-0000-0000-000000000000	c0336e3f-d9f5-440e-a8b8-baa68e7f73c7	{"action":"token_revoked","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 06:16:26.893274+00	
00000000-0000-0000-0000-000000000000	533ff86c-f5bc-4a5c-8467-c67aa0350dfc	{"action":"login","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-04 06:19:17.981294+00	
00000000-0000-0000-0000-000000000000	a31b614f-e99e-46d2-8ed7-3c983eeea15a	{"action":"login","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-04 06:52:24.062221+00	
00000000-0000-0000-0000-000000000000	285e8818-624d-42b6-bea2-5f2225c8c5e2	{"action":"token_refreshed","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 07:50:35.844881+00	
00000000-0000-0000-0000-000000000000	c8b12ab1-8454-48e2-b619-3b9e435d0271	{"action":"token_revoked","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 07:50:35.84701+00	
00000000-0000-0000-0000-000000000000	63c0528e-c912-4123-afc9-d882f77da0cd	{"action":"token_refreshed","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 16:24:13.912679+00	
00000000-0000-0000-0000-000000000000	1392a15e-471f-4d01-b4e7-305e0322051b	{"action":"token_revoked","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 16:24:13.923479+00	
00000000-0000-0000-0000-000000000000	bc4b3b58-e3d3-41fe-a3cf-2a2ba8cf8b86	{"action":"logout","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-04 16:39:58.45445+00	
00000000-0000-0000-0000-000000000000	884573ee-d6a6-43fe-b09e-c7eba32711fe	{"action":"user_confirmation_requested","actor_id":"48b04799-abe7-4a3b-a2f1-07c14642aec2","actor_username":"test5@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-04 16:42:16.867225+00	
00000000-0000-0000-0000-000000000000	a67d9971-693b-4e91-bba3-bd5dad0a30fc	{"action":"user_signedup","actor_id":"48b04799-abe7-4a3b-a2f1-07c14642aec2","actor_username":"test5@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-04 16:53:39.698117+00	
00000000-0000-0000-0000-000000000000	b3a97f73-c25e-4243-a701-b2b934af31b7	{"action":"login","actor_id":"48b04799-abe7-4a3b-a2f1-07c14642aec2","actor_username":"test5@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-04 16:53:59.777602+00	
00000000-0000-0000-0000-000000000000	91a8abd4-538c-48b6-a158-e5edb67801f1	{"action":"user_confirmation_requested","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-04 17:19:51.340317+00	
00000000-0000-0000-0000-000000000000	7549f147-e117-4d60-8cb3-29015d4ee082	{"action":"user_signedup","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-04 17:20:19.491921+00	
00000000-0000-0000-0000-000000000000	9a941a90-6dac-48b2-a324-fd5d50f3d441	{"action":"login","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-04 17:20:32.924978+00	
00000000-0000-0000-0000-000000000000	db7709be-1c25-44de-83fb-f9fc33378634	{"action":"token_refreshed","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 18:19:31.53151+00	
00000000-0000-0000-0000-000000000000	3079580f-c19f-449e-a3b5-1defeea3fae0	{"action":"token_revoked","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 18:19:31.535896+00	
00000000-0000-0000-0000-000000000000	fddfc7c4-b5b4-444b-8545-d97d5a3b6944	{"action":"token_refreshed","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-05 17:35:01.319745+00	
00000000-0000-0000-0000-000000000000	b5dcc1be-d046-49fa-a01e-c5b46a517606	{"action":"token_revoked","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-05 17:35:01.33273+00	
00000000-0000-0000-0000-000000000000	45973437-47a9-49c8-bc1f-81ded8604d75	{"action":"token_refreshed","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-05 19:40:53.739017+00	
00000000-0000-0000-0000-000000000000	059671ff-dbca-46e1-9fed-9c60c84ce5bf	{"action":"token_revoked","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-05 19:40:53.745705+00	
00000000-0000-0000-0000-000000000000	1af5ae59-41b2-4b37-9248-a99bbb265c66	{"action":"token_refreshed","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 10:02:28.455139+00	
00000000-0000-0000-0000-000000000000	9d5c83cf-8f28-497a-833b-b7063d0cb853	{"action":"token_revoked","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 10:02:28.465691+00	
00000000-0000-0000-0000-000000000000	06806d8e-3251-4678-beb3-32243bc86bb0	{"action":"token_refreshed","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 10:26:29.722191+00	
00000000-0000-0000-0000-000000000000	3a6fbb68-14d6-4660-ae65-47d038a785af	{"action":"token_revoked","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 10:26:29.72495+00	
00000000-0000-0000-0000-000000000000	ae1d4130-4298-40c9-a8e4-901291fdec38	{"action":"token_refreshed","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 19:59:25.453196+00	
00000000-0000-0000-0000-000000000000	9d38fcf2-9c6e-45c3-9156-1fed09262a2a	{"action":"token_revoked","actor_id":"5d593238-40c0-4b29-9e41-397769604047","actor_username":"test6@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 19:59:25.46001+00	
00000000-0000-0000-0000-000000000000	4be8584a-852a-477a-97ee-2b0fe791d05f	{"action":"login","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-08 20:36:32.147211+00	
00000000-0000-0000-0000-000000000000	b08ee856-b164-4dbb-8508-e7f37ffeb678	{"action":"logout","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-08 20:36:38.277006+00	
00000000-0000-0000-0000-000000000000	e45dccc6-f637-4c3d-9079-287f116d9937	{"action":"login","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-08 20:37:05.117797+00	
00000000-0000-0000-0000-000000000000	fb7a47e1-2809-4e47-a5b4-8fadec4ad925	{"action":"logout","actor_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","actor_username":"talha4@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-08 20:37:09.590317+00	
00000000-0000-0000-0000-000000000000	96857373-62e8-4755-a547-ca4defea51fc	{"action":"user_confirmation_requested","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-08 20:38:25.552807+00	
00000000-0000-0000-0000-000000000000	1b5eb298-5922-4117-b02e-88ca45239dbd	{"action":"user_signedup","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-08 20:38:34.571267+00	
00000000-0000-0000-0000-000000000000	965aa885-3200-4afd-bdd5-c638acb1dd9e	{"action":"login","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-08 20:44:02.462349+00	
00000000-0000-0000-0000-000000000000	67a4fc6e-a416-4038-a4a7-1ec2536e9e60	{"action":"token_refreshed","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 21:48:58.611259+00	
00000000-0000-0000-0000-000000000000	847ab6fc-0f40-4ae1-a98b-9368495cbfc1	{"action":"token_revoked","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 21:48:58.615533+00	
00000000-0000-0000-0000-000000000000	e615a446-e634-4178-887e-06a7f9d6c954	{"action":"logout","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-08 22:08:06.626269+00	
00000000-0000-0000-0000-000000000000	bb001358-834f-4c9b-83cc-c98ba7364c6b	{"action":"login","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-08 22:09:13.732843+00	
00000000-0000-0000-0000-000000000000	01570eb5-7f04-4474-8955-6f084e9e9e0e	{"action":"token_refreshed","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 23:07:56.595762+00	
00000000-0000-0000-0000-000000000000	601c7c26-1f7f-4ab4-bad0-3d0fe8b03d6a	{"action":"token_revoked","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 23:07:56.596589+00	
00000000-0000-0000-0000-000000000000	42ff5e05-d64b-4642-a4d0-e827dc0621b2	{"action":"logout","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-08 23:20:10.452834+00	
00000000-0000-0000-0000-000000000000	c557e008-b309-41ba-8eb9-08a26154e2fe	{"action":"login","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 06:44:45.773435+00	
00000000-0000-0000-0000-000000000000	c68f1afa-2ff0-4c56-a260-eb0c4d2f0c50	{"action":"login","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 06:58:50.504838+00	
00000000-0000-0000-0000-000000000000	90e0e89e-526f-484a-b9fb-85c3962713e7	{"action":"token_refreshed","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:38:21.897275+00	
00000000-0000-0000-0000-000000000000	7062ba14-725e-4bb9-9fb3-bacc22706597	{"action":"token_revoked","actor_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","actor_username":"hassan-bb-5@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:38:21.911937+00	
00000000-0000-0000-0000-000000000000	ac3feaaf-2463-4115-833b-a675c2c27d36	{"action":"user_confirmation_requested","actor_id":"bcaa9886-2ddc-4658-af89-d697425584f7","actor_username":"hassan-test-flg-three@mailiantor.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 10:39:16.827351+00	
00000000-0000-0000-0000-000000000000	3875c312-674c-4ab7-a97e-3c303abd5b08	{"action":"user_confirmation_requested","actor_id":"1f893de3-4e40-4c19-bd84-0730740648aa","actor_username":"hassan-flg-three-user@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 10:41:06.605215+00	
00000000-0000-0000-0000-000000000000	d9cc7240-0ed6-44f5-80f5-8f85874ec607	{"action":"token_refreshed","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:42:01.522789+00	
00000000-0000-0000-0000-000000000000	c4fa978a-8a50-4db0-a31b-0423d65164b2	{"action":"token_revoked","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:42:01.523991+00	
00000000-0000-0000-0000-000000000000	0d5dc4ac-63ba-484d-97e9-31effe8e4719	{"action":"user_confirmation_requested","actor_id":"379e8e55-101a-4d21-bf90-a8e1c4d1e0fd","actor_username":"hassan-flg-three-user-one@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 10:42:05.216879+00	
00000000-0000-0000-0000-000000000000	cbceb8ad-a7f0-4502-b13c-9ac0e42f67dc	{"action":"logout","actor_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","actor_username":"test10@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-09 10:42:25.098459+00	
00000000-0000-0000-0000-000000000000	dc8962f3-3c12-4e9e-8683-3c1e70c722b7	{"action":"user_confirmation_requested","actor_id":"29dc3718-88f7-446e-9d28-cd678e79ed77","actor_username":"test11@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 10:42:52.265096+00	
00000000-0000-0000-0000-000000000000	f91ce76c-e3d6-4e05-9022-ed866acbb25f	{"action":"user_confirmation_requested","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 10:44:22.963491+00	
00000000-0000-0000-0000-000000000000	be406180-48fb-4f41-a151-34bb77e5d5fb	{"action":"user_signedup","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-09 10:44:32.890571+00	
00000000-0000-0000-0000-000000000000	6eee7f6d-791b-46a8-9d7a-669e05f0aeb9	{"action":"login","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 10:46:15.495809+00	
00000000-0000-0000-0000-000000000000	95f2d3d5-5f3e-4bd5-8c61-3c635a902209	{"action":"login","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 11:57:36.948203+00	
00000000-0000-0000-0000-000000000000	4a496853-9507-47f5-a827-dfb9816c3427	{"action":"logout","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-09 11:58:08.935833+00	
00000000-0000-0000-0000-000000000000	76caff43-b106-442c-98eb-b24fbda0be31	{"action":"login","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 11:58:16.406308+00	
00000000-0000-0000-0000-000000000000	0ca953fe-daa5-4a0d-9094-9a08cba081d2	{"action":"login","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 11:58:54.988845+00	
00000000-0000-0000-0000-000000000000	de4b6f87-cb8c-4762-a59f-bd66f4d76cd0	{"action":"logout","actor_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","actor_username":"test100@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-09 11:59:13.470317+00	
00000000-0000-0000-0000-000000000000	9c934112-5921-4d74-a74c-4b69f44191ae	{"action":"user_confirmation_requested","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 11:59:44.644573+00	
00000000-0000-0000-0000-000000000000	3d11d4b4-8a28-4f8f-a310-142443424413	{"action":"user_signedup","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-09 12:00:00.162097+00	
00000000-0000-0000-0000-000000000000	b3ad76b4-e87f-4163-a835-bdcb087aee63	{"action":"user_confirmation_requested","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 12:05:39.93143+00	
00000000-0000-0000-0000-000000000000	8d3c09c1-c443-440a-b0cd-4af1eb1bf748	{"action":"user_signedup","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-09 12:05:52.158736+00	
00000000-0000-0000-0000-000000000000	94d265a9-51b7-4bf2-9bad-3eb3355b5b1f	{"action":"token_refreshed","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 13:02:27.537505+00	
00000000-0000-0000-0000-000000000000	caea1d6c-fa3e-41f0-991a-543891cf7658	{"action":"token_revoked","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 13:02:27.538967+00	
00000000-0000-0000-0000-000000000000	eaba9abb-fb2a-495a-81b5-f43e6e0ba033	{"action":"user_confirmation_requested","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 18:14:04.648341+00	
00000000-0000-0000-0000-000000000000	a0637aa4-3cfd-4883-93c7-f2667a0ad823	{"action":"user_signedup","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-09 18:14:25.175129+00	
00000000-0000-0000-0000-000000000000	01f94320-571c-4cfe-ab26-cebb41989ae3	{"action":"login","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 18:14:44.172978+00	
00000000-0000-0000-0000-000000000000	f77226c1-2863-4e4e-8e6b-37aa519f0252	{"action":"logout","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-09 18:38:07.334629+00	
00000000-0000-0000-0000-000000000000	67fc2fb4-f9aa-4391-a3ff-c62220552c80	{"action":"login","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 18:38:33.182615+00	
00000000-0000-0000-0000-000000000000	84e743b1-3282-4fe8-b99f-5e0e27201cea	{"action":"token_refreshed","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 19:23:09.185749+00	
00000000-0000-0000-0000-000000000000	60e479eb-ea27-4e5b-bff5-1180bd052664	{"action":"token_revoked","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 19:23:09.190401+00	
00000000-0000-0000-0000-000000000000	1c4e8893-45ce-4c33-a888-90225eb7d2b7	{"action":"logout","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-09 19:30:19.647855+00	
00000000-0000-0000-0000-000000000000	48453352-7e90-4951-8a9f-ebe8e53025a9	{"action":"login","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 19:31:58.247527+00	
00000000-0000-0000-0000-000000000000	dfb19635-8f3e-4a77-b9cc-c89dc110a338	{"action":"login","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 19:32:18.542754+00	
00000000-0000-0000-0000-000000000000	ee10f17e-b13a-4ee3-8906-0e1c099235d6	{"action":"user_confirmation_requested","actor_id":"f733c90a-e112-40ef-844b-e7af70934d15","actor_username":"abc@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 19:39:17.189276+00	
00000000-0000-0000-0000-000000000000	ecb3d237-6dc7-4405-a3ec-fa373a8e8444	{"action":"user_signedup","actor_id":"f733c90a-e112-40ef-844b-e7af70934d15","actor_username":"abc@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-09 19:40:55.180215+00	
00000000-0000-0000-0000-000000000000	947b5d61-201a-4d07-b4c5-b24b670e9e58	{"action":"login","actor_id":"f733c90a-e112-40ef-844b-e7af70934d15","actor_username":"abc@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 19:40:57.298749+00	
00000000-0000-0000-0000-000000000000	b70d922b-91a4-4e11-925e-e01a6a989511	{"action":"user_confirmation_requested","actor_id":"6d3cb661-4800-4a55-ba48-455d07f37cc0","actor_username":"eng1@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 19:49:10.773179+00	
00000000-0000-0000-0000-000000000000	a2a35578-611a-4b15-9dd9-34d5f6b59c3a	{"action":"user_confirmation_requested","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-09 20:11:37.269967+00	
00000000-0000-0000-0000-000000000000	f117aa51-284a-4771-9fcb-48c64734e5eb	{"action":"user_signedup","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-09 20:14:00.246289+00	
00000000-0000-0000-0000-000000000000	d80aad04-d124-46b7-8707-c37af68e8943	{"action":"login","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-09 20:14:20.292647+00	
00000000-0000-0000-0000-000000000000	ebe1a572-174b-4791-aa0d-809e3daae9d1	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 19:24:45.031317+00	
00000000-0000-0000-0000-000000000000	80ad4bf1-0267-4f85-9202-681337d97012	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 19:24:45.043899+00	
00000000-0000-0000-0000-000000000000	9339e0d0-35e2-441c-aa4b-f07918dad990	{"action":"token_refreshed","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 19:27:41.89055+00	
00000000-0000-0000-0000-000000000000	880fc195-f1e5-4b49-acc9-330a8b0f6fca	{"action":"token_revoked","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 19:27:41.893925+00	
00000000-0000-0000-0000-000000000000	1bc1bed4-8c18-4602-86a7-48f1dec7820b	{"action":"token_refreshed","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 20:26:13.362045+00	
00000000-0000-0000-0000-000000000000	eee8d8c5-075f-48cb-857d-ce0f23cca387	{"action":"token_revoked","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 20:26:13.365969+00	
00000000-0000-0000-0000-000000000000	60f3b4f8-cf03-49e3-b66e-cffcba8ba042	{"action":"token_refreshed","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 21:26:23.146846+00	
00000000-0000-0000-0000-000000000000	484db88c-a71d-417f-ae9b-b57daa32ba21	{"action":"token_revoked","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 21:26:23.151992+00	
00000000-0000-0000-0000-000000000000	bc6862e8-084b-47c6-bace-fb3f19998af7	{"action":"token_refreshed","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 06:21:47.972517+00	
00000000-0000-0000-0000-000000000000	61884068-c294-4035-8077-8797926dbb60	{"action":"token_revoked","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 06:21:47.982348+00	
00000000-0000-0000-0000-000000000000	e287d013-d0b5-4259-ab29-6c65a047aa7d	{"action":"logout","actor_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","actor_username":"shahid1@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-11 06:45:30.168076+00	
00000000-0000-0000-0000-000000000000	cbd40c9f-4860-460a-a6c6-b9b7b720622b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:45:35.311991+00	
00000000-0000-0000-0000-000000000000	9ded3bbe-3e88-45c2-9033-b388ec8f5a6a	{"action":"login","actor_id":"06eb627b-348e-485a-9d64-328469d18c42","actor_username":"talha1@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:46:55.031713+00	
00000000-0000-0000-0000-000000000000	bcaf58d8-8268-49cd-b7db-70b8686267e5	{"action":"login","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-11 06:48:05.493415+00	
00000000-0000-0000-0000-000000000000	5a0c2871-2520-4ce5-94bb-d649064bb3bf	{"action":"token_refreshed","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 07:49:55.935497+00	
00000000-0000-0000-0000-000000000000	114fa70c-9aa0-4f0b-af48-21f412c7fde5	{"action":"token_revoked","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 07:49:55.937782+00	
00000000-0000-0000-0000-000000000000	acbeb7d6-3930-4959-8e49-cdbb2a3568b0	{"action":"token_refreshed","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 08:51:30.384914+00	
00000000-0000-0000-0000-000000000000	239e7845-b268-44ab-9693-55e52910a1cb	{"action":"token_revoked","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 08:51:30.386833+00	
00000000-0000-0000-0000-000000000000	81efde0a-45cb-4e63-996e-5dfe92d0b6ed	{"action":"token_refreshed","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 09:49:51.897533+00	
00000000-0000-0000-0000-000000000000	cb7b1b66-67c1-4e14-af2f-7207907079dd	{"action":"token_revoked","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 09:49:51.899667+00	
00000000-0000-0000-0000-000000000000	4eb69b70-664c-4acd-9244-4c5da44030a6	{"action":"token_refreshed","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 11:53:30.100592+00	
00000000-0000-0000-0000-000000000000	abfc0b92-b03e-4e8e-aac3-c4624cdb08d8	{"action":"token_revoked","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 11:53:30.111598+00	
00000000-0000-0000-0000-000000000000	bb2f8f2c-7d98-402c-92ce-b075750f80c3	{"action":"token_refreshed","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 12:52:11.170513+00	
00000000-0000-0000-0000-000000000000	c3cc7a32-4511-4af3-a0a0-04ac75806adf	{"action":"token_revoked","actor_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","actor_username":"test101@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 12:52:11.172752+00	
00000000-0000-0000-0000-000000000000	89e77fad-f673-4b3e-99a3-66014600fddc	{"action":"user_confirmation_requested","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-11 13:08:33.316722+00	
00000000-0000-0000-0000-000000000000	958e6bde-00d4-438e-a9f8-9bbb9aa0feb9	{"action":"user_signedup","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-11 13:08:52.581909+00	
00000000-0000-0000-0000-000000000000	43fd159d-d869-4a43-a607-fb1cda5e231a	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 17:07:51.665388+00	
00000000-0000-0000-0000-000000000000	27de52be-2243-4efb-ac7a-c091caaa9f99	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 17:07:51.668081+00	
00000000-0000-0000-0000-000000000000	0ea60191-4984-457c-af1e-33e6522298fa	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 19:02:03.873143+00	
00000000-0000-0000-0000-000000000000	c9df1f8b-6903-48cb-baa1-95a07dacffdc	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 19:02:03.878011+00	
00000000-0000-0000-0000-000000000000	4158d636-d2af-4762-8857-5350fbb70720	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 20:23:42.866755+00	
00000000-0000-0000-0000-000000000000	f967b92f-3836-441d-9503-79a41ea4aa2f	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 20:23:42.869846+00	
00000000-0000-0000-0000-000000000000	75a6309d-89b0-4798-8fe9-9993782e237f	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 13:39:50.501338+00	
00000000-0000-0000-0000-000000000000	bc733843-ce8b-4640-9dbc-4c0847c61efc	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 13:39:50.508104+00	
00000000-0000-0000-0000-000000000000	6a4fa798-287b-4fc3-a13d-0dd881e8c55d	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 15:58:50.074095+00	
00000000-0000-0000-0000-000000000000	24221e84-f5e1-43c7-b566-e1e5368ff6c1	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 15:58:50.075644+00	
00000000-0000-0000-0000-000000000000	81deaaf5-7d4a-41bc-9002-ad66688f0642	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 17:04:39.018228+00	
00000000-0000-0000-0000-000000000000	b05326af-71e0-415d-b668-07bf9dfeb4a7	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 17:04:39.020862+00	
00000000-0000-0000-0000-000000000000	2c1a5f78-ce08-4dce-b2e5-04d8e3b48e3c	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 18:47:31.981503+00	
00000000-0000-0000-0000-000000000000	c3bff82c-f147-4d22-9de2-1146c2e961e2	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 18:47:31.988725+00	
00000000-0000-0000-0000-000000000000	e838b5ed-8814-4cc2-b902-96e66c23e917	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 21:00:31.674678+00	
00000000-0000-0000-0000-000000000000	16e2ee65-f72b-4786-9b6d-5a13fd85ff35	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 21:00:31.677895+00	
00000000-0000-0000-0000-000000000000	0ca84da4-8434-488b-b750-a323a650895a	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 21:08:45.440074+00	
00000000-0000-0000-0000-000000000000	0d456d9d-02f5-407e-b925-77ce10f68ba6	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 22:35:38.459808+00	
00000000-0000-0000-0000-000000000000	3c4d8329-7d7e-4db9-af5f-05ab6230d5f5	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-12 22:35:38.462957+00	
00000000-0000-0000-0000-000000000000	a4cb682e-1d58-4f7c-a960-70475599d518	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:24:57.708476+00	
00000000-0000-0000-0000-000000000000	fb375de2-dedd-4de0-9d28-dab25944ce5b	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:37:16.017761+00	
00000000-0000-0000-0000-000000000000	05ded084-1a29-4eae-9b8a-7a0563a52f24	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:40:15.522559+00	
00000000-0000-0000-0000-000000000000	e66a0ca1-1d32-4f5a-b45b-7e0c694c335d	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:42:21.050195+00	
00000000-0000-0000-0000-000000000000	f7ad0ecb-a6d7-4b60-9ea6-72ec04805e3b	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:46:02.134082+00	
00000000-0000-0000-0000-000000000000	2faed041-cff0-4792-b25c-13035ae93794	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:46:13.539905+00	
00000000-0000-0000-0000-000000000000	f7763cd4-508d-420d-8563-8d5abed0ea6e	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:46:16.380703+00	
00000000-0000-0000-0000-000000000000	ac92c29f-5259-4cb4-8101-4a4c36a88095	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:46:22.086714+00	
00000000-0000-0000-0000-000000000000	6e6a6e15-3d77-48e6-ba7f-8fd6b1ceac07	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:46:29.338903+00	
00000000-0000-0000-0000-000000000000	343f5ada-e339-420e-825f-6564d8287434	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:46:44.652352+00	
00000000-0000-0000-0000-000000000000	049ee49c-7d89-432d-85c8-9d8ff3ca2c0e	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:50:21.657883+00	
00000000-0000-0000-0000-000000000000	9f4d555e-e97c-420f-a7b1-ed8aa8f7cc18	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:50:24.308334+00	
00000000-0000-0000-0000-000000000000	bf5eb0c6-b111-4d27-898c-1994986be05d	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:50:26.097383+00	
00000000-0000-0000-0000-000000000000	6d971063-a450-4cc6-a17c-bcb08e1fa7bb	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:50:27.778064+00	
00000000-0000-0000-0000-000000000000	99c11fe1-e1af-4ad8-8196-f8af623a6d7e	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:51:46.947906+00	
00000000-0000-0000-0000-000000000000	61350207-dc51-44b4-8f89-ac6d4eb60d2a	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:53:05.422769+00	
00000000-0000-0000-0000-000000000000	3608c1e0-4a9e-46ea-bf92-1a48df198903	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:53:07.520269+00	
00000000-0000-0000-0000-000000000000	7a11b170-846d-46ac-8145-30cabb7fb141	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-12 23:56:12.04085+00	
00000000-0000-0000-0000-000000000000	088a732d-ab65-4626-b8f1-fe46b86b8f14	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:09:33.492968+00	
00000000-0000-0000-0000-000000000000	34c1c0c1-f010-4a00-898e-eb155e8f8406	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:10:18.098515+00	
00000000-0000-0000-0000-000000000000	deb55e8c-fbb1-4660-9619-8b8e5f38cf64	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:13:11.20896+00	
00000000-0000-0000-0000-000000000000	f0c6d017-d3ce-491b-ad30-7b94d58e6b68	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 00:13:19.040515+00	
00000000-0000-0000-0000-000000000000	06a29049-4bb2-4773-a492-9878252edde7	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 08:45:38.791018+00	
00000000-0000-0000-0000-000000000000	078d6c31-0b71-4295-8757-0c275096b06a	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 08:45:38.797454+00	
00000000-0000-0000-0000-000000000000	cd8d7ee8-ca34-47b6-8a92-3909c8e3d6b6	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 10:14:30.444041+00	
00000000-0000-0000-0000-000000000000	fd746bc9-ca22-4868-aacd-d8984a24bacc	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 10:16:28.403029+00	
00000000-0000-0000-0000-000000000000	3922afa2-0e37-4fd6-a785-74811723da13	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 10:16:41.210098+00	
00000000-0000-0000-0000-000000000000	b9a8cf77-3aeb-44cb-9682-713aecfec982	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 10:16:46.222143+00	
00000000-0000-0000-0000-000000000000	b8f1256c-d572-4374-bea4-12179dc510cd	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 10:18:09.004353+00	
00000000-0000-0000-0000-000000000000	15c03df7-da8a-4a66-9eed-27481989b3f7	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 11:37:38.067837+00	
00000000-0000-0000-0000-000000000000	a690fca3-4e31-44b3-b3e3-74f8b897d6e7	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 11:37:38.070002+00	
00000000-0000-0000-0000-000000000000	b6b0be3b-080f-4729-8cd4-f0868fee7596	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 11:57:07.498824+00	
00000000-0000-0000-0000-000000000000	3bdb4d8c-f523-4d02-ae1b-885d42db101f	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 11:57:07.500259+00	
00000000-0000-0000-0000-000000000000	3dce3876-e646-4311-9265-b8e26fe27e81	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 11:57:12.948737+00	
00000000-0000-0000-0000-000000000000	b952b6cc-16c4-42ce-83be-c71930168f1e	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 13:37:14.215711+00	
00000000-0000-0000-0000-000000000000	cabad6c6-9025-4083-9fd5-e5aa536169be	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 13:37:14.217901+00	
00000000-0000-0000-0000-000000000000	13fc6999-2cc7-440b-9d19-913ddc38c38f	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-13 13:50:42.383499+00	
00000000-0000-0000-0000-000000000000	e4aef84c-8fd6-4f50-8468-43ad326b8bf3	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 13:50:45.164599+00	
00000000-0000-0000-0000-000000000000	8a35793b-b99e-4246-b6b7-b7213b429b26	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 16:19:51.462506+00	
00000000-0000-0000-0000-000000000000	3b13e614-55fa-4c99-a5a9-6310d24314b4	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 16:19:51.467795+00	
00000000-0000-0000-0000-000000000000	7a532286-949e-4c94-81bd-0dcd62229e3a	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 18:59:39.323174+00	
00000000-0000-0000-0000-000000000000	c9a35391-f86c-4726-a81b-f0f1dd140351	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 18:59:39.325822+00	
00000000-0000-0000-0000-000000000000	04b9bd15-4e73-49b5-99bc-24626401ce09	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 20:02:11.601864+00	
00000000-0000-0000-0000-000000000000	e7feffdb-7ed9-4d09-bb61-30fafb785697	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 20:02:11.60529+00	
00000000-0000-0000-0000-000000000000	04f949d6-e2e6-432c-b5e1-a11e283eefa1	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 20:10:11.972209+00	
00000000-0000-0000-0000-000000000000	2a89e21e-f870-4cf8-8ec9-020d0bb7dec6	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 20:10:12.761991+00	
00000000-0000-0000-0000-000000000000	17966845-6141-440c-b8e8-baadb7ba9b5a	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 20:10:12.970792+00	
00000000-0000-0000-0000-000000000000	c5152746-89fb-4239-984a-77151090ba90	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 20:13:08.854673+00	
00000000-0000-0000-0000-000000000000	a79c5775-7a07-4a33-9e38-dfdfaa84d2cc	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 20:13:08.858108+00	
00000000-0000-0000-0000-000000000000	2421388e-03c4-43b1-9c62-2ee3a8679607	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 20:22:45.143346+00	
00000000-0000-0000-0000-000000000000	38ef87a3-20fd-4b74-80fb-aac962574478	{"action":"user_repeated_signup","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-13 20:32:33.606966+00	
00000000-0000-0000-0000-000000000000	1f9e617a-5383-4b69-91b0-5c88cb37fa67	{"action":"user_repeated_signup","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-13 20:32:33.893109+00	
00000000-0000-0000-0000-000000000000	9206833e-71e5-4076-afb7-17404698047d	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 20:32:42.839137+00	
00000000-0000-0000-0000-000000000000	f631fcc4-1532-4902-8d65-47a2d99ab975	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-13 20:32:44.323378+00	
00000000-0000-0000-0000-000000000000	2cb02871-abd4-4a3b-9493-8e32013bfb54	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 21:36:35.520276+00	
00000000-0000-0000-0000-000000000000	f34345e8-3231-4b65-8f6b-e9a8fb166cf0	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 21:36:35.521954+00	
00000000-0000-0000-0000-000000000000	8a8a8aed-82c6-4d6a-8d15-ec1f2fd910fc	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 22:35:08.44795+00	
00000000-0000-0000-0000-000000000000	ce4bf5e8-5ff8-4686-919f-c8511c1cebf0	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 22:35:08.450543+00	
00000000-0000-0000-0000-000000000000	50107ee6-f7a6-42bd-a465-98fe1e803632	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 22:52:56.931968+00	
00000000-0000-0000-0000-000000000000	602a2a8d-d2c2-4ee3-a72d-7f22978446b9	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-13 22:52:56.935975+00	
00000000-0000-0000-0000-000000000000	2750ef65-5d13-4096-aa42-9d4b022b80bd	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 07:21:04.864034+00	
00000000-0000-0000-0000-000000000000	4ff54c54-d3d9-4125-9636-a157b2ce29d2	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 07:21:04.879492+00	
00000000-0000-0000-0000-000000000000	023c911f-e608-4aa3-9ccb-29f5fcd0ed09	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 07:21:15.948088+00	
00000000-0000-0000-0000-000000000000	ea8a3123-d482-4cf0-b681-ff94efcc1b22	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 07:21:15.949421+00	
00000000-0000-0000-0000-000000000000	f49fc0e5-28ac-4878-8902-5c867b5b51d2	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 11:30:18.67983+00	
00000000-0000-0000-0000-000000000000	6bb9729f-7b1e-4454-a339-40f5460ee4d8	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 11:30:18.681947+00	
00000000-0000-0000-0000-000000000000	77aeddd2-2f2f-4348-bbbe-e6ffb1053a19	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:08:25.728079+00	
00000000-0000-0000-0000-000000000000	c02f6f6f-8d5b-47a1-bb6e-cd3287bd8587	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:08:25.731637+00	
00000000-0000-0000-0000-000000000000	5268f140-1d6e-40bf-9ee1-eba7616f17c2	{"action":"login","actor_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","actor_username":"talhamushtaq565@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 13:10:42.144026+00	
00000000-0000-0000-0000-000000000000	ef63c983-1d15-488f-a74e-d96508a417dd	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:11:03.991831+00	
00000000-0000-0000-0000-000000000000	cde70158-e9d2-4bec-8ab2-8e0216bf5896	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:11:03.992382+00	
00000000-0000-0000-0000-000000000000	2162b6b8-214f-485a-be7a-1c41420602a5	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 13:22:16.710705+00	
00000000-0000-0000-0000-000000000000	cb2a8f62-1f28-485b-87df-09a567752c90	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:23:53.79187+00	
00000000-0000-0000-0000-000000000000	a21a47ca-5164-4e51-b715-4b681c711bb7	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:23:53.793862+00	
00000000-0000-0000-0000-000000000000	fcda9683-b484-43b6-a8e6-651f1b0ae7c5	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:44:29.619935+00	
00000000-0000-0000-0000-000000000000	dbb0ef18-201f-40c1-bffe-388e0c14e9ad	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:44:29.624285+00	
00000000-0000-0000-0000-000000000000	5fe77b8b-f741-4a9a-9a56-a0d6722e3386	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:45:57.787755+00	
00000000-0000-0000-0000-000000000000	6dbcc600-d9b9-401a-8eb4-e97bab04de4e	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:45:57.789173+00	
00000000-0000-0000-0000-000000000000	8f0b10f6-5d82-4c44-ba30-c516f234a3cf	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:48:28.625299+00	
00000000-0000-0000-0000-000000000000	c05290ee-7f86-4d64-9b87-7f8de1ea2960	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 18:48:28.627996+00	
00000000-0000-0000-0000-000000000000	a4ef53a7-3ce3-4f5a-a052-8e25e8e22db5	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 20:10:45.149606+00	
00000000-0000-0000-0000-000000000000	48db1efe-bb09-477b-bc90-e16f0b639c83	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 20:10:45.152307+00	
00000000-0000-0000-0000-000000000000	bbaf18eb-4f2e-42f6-9c60-c8e1954cfa9b	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:18:04.463872+00	
00000000-0000-0000-0000-000000000000	6ba6745b-e53e-4e5d-b1a5-7f2134065798	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 21:18:04.466483+00	
00000000-0000-0000-0000-000000000000	38f75e12-a03a-4db2-aac4-e70f57c0acda	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 22:02:41.624632+00	
00000000-0000-0000-0000-000000000000	005d0d05-4f09-4e5e-b7e7-8259412e3ed0	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 23:08:14.588785+00	
00000000-0000-0000-0000-000000000000	ce02ea02-7126-4fdb-9036-a7d15dcf0c93	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 23:08:14.59145+00	
00000000-0000-0000-0000-000000000000	ac4da04e-a298-45a1-b74c-6ab3e3156b56	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 23:17:55.866697+00	
00000000-0000-0000-0000-000000000000	ee9b4187-db26-4a06-b4d5-cdeff010248b	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 23:18:00.408497+00	
00000000-0000-0000-0000-000000000000	4bf4b9e1-ff5d-4c1d-9a73-56df89ed9035	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 23:18:02.549219+00	
00000000-0000-0000-0000-000000000000	03f39b23-08d7-4257-87ac-b9adc89455cc	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 23:18:22.714372+00	
00000000-0000-0000-0000-000000000000	af68a636-6fe7-4dcf-8440-90399245aca7	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 23:18:27.085319+00	
00000000-0000-0000-0000-000000000000	77ebe3de-d524-49e7-8f63-b6c9c5a5fde9	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 23:18:34.805777+00	
00000000-0000-0000-0000-000000000000	a3e2fd2f-2c44-4a8a-a499-99c7bc6f6b6b	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-14 23:18:41.995704+00	
00000000-0000-0000-0000-000000000000	e75ebb1d-44f2-417d-b7e6-0bd3388ed484	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 00:11:07.083688+00	
00000000-0000-0000-0000-000000000000	91153743-8571-449c-b109-c80d4d30cba4	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_accountant@mailinator.com","user_id":"6c37a735-1990-43f4-858f-a268d52a350d","user_phone":""}}	2025-07-15 00:17:29.512878+00	
00000000-0000-0000-0000-000000000000	f7f45e44-78e1-4c37-b814-6d9d079ab43d	{"action":"user_confirmation_requested","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-15 00:30:17.18795+00	
00000000-0000-0000-0000-000000000000	b24a7f01-850e-4bf9-bc5a-0ff80ab8532b	{"action":"user_signedup","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-15 00:30:26.439437+00	
00000000-0000-0000-0000-000000000000	0c95e275-3ba1-469f-9f0b-d4d5ea3e2541	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 00:31:15.389476+00	
00000000-0000-0000-0000-000000000000	57b0309c-4846-403f-aaea-9d092231829f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tttt@mailinator.com","user_id":"8f6cba15-4a4a-4b3d-aed1-a0fe68d88c9c","user_phone":""}}	2025-07-15 00:51:18.294284+00	
00000000-0000-0000-0000-000000000000	271111d6-22ce-4f74-adc5-54b6266788e0	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:06:02.605917+00	
00000000-0000-0000-0000-000000000000	b8b7a7d6-85a7-4d59-8e84-f19a92d20204	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:06:59.29694+00	
00000000-0000-0000-0000-000000000000	4927f689-5dd5-4210-95f2-bf6a08f8d9eb	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-15 01:07:11.999098+00	
00000000-0000-0000-0000-000000000000	3e271400-6854-4368-a0ad-f0efa3c62777	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:10:09.957306+00	
00000000-0000-0000-0000-000000000000	0a7fa982-9a4c-47ff-a741-efbdcf6d58bc	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-15 01:10:22.894249+00	
00000000-0000-0000-0000-000000000000	1c3d71d9-9ebd-4020-a528-082f844c275a	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:11:37.820061+00	
00000000-0000-0000-0000-000000000000	cf74739c-6f61-4fc3-94cf-2641a03bbf66	{"action":"logout","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-15 01:19:59.092135+00	
00000000-0000-0000-0000-000000000000	aaced3c1-7b53-43c7-ba45-8eaf27b6f16b	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:34:11.069303+00	
00000000-0000-0000-0000-000000000000	cbf9594e-b5a0-470f-ad14-a7ea6d0c85e7	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:34:20.019484+00	
00000000-0000-0000-0000-000000000000	d3ead7d6-978f-4b38-9c68-9a0ebe8da066	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:41:51.261032+00	
00000000-0000-0000-0000-000000000000	5c1d399d-41fc-4eb0-8f1d-14937eda23cf	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_admin@mailinator.com","user_id":"bf3b1096-851d-47c0-bedb-2e185bd161f0","user_phone":""}}	2025-07-15 01:49:14.988916+00	
00000000-0000-0000-0000-000000000000	274ddeaf-31fa-4c9c-a133-83b8ee86da39	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_admin@mailinator.com","user_id":"bf3b1096-851d-47c0-bedb-2e185bd161f0","user_phone":""}}	2025-07-15 01:53:30.47211+00	
00000000-0000-0000-0000-000000000000	39a519d1-7626-4778-b736-9e6c7a26c27b	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_admn@mailinator.com","user_id":"0bf630db-6a6f-441b-a739-f395be4fd664","user_phone":""}}	2025-07-15 01:53:56.662679+00	
00000000-0000-0000-0000-000000000000	b546db9f-6282-4bdc-8122-e23ba88d59de	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:55:51.893966+00	
00000000-0000-0000-0000-000000000000	6dc7b8ca-fe1d-4403-9014-bcd778aaa820	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 01:57:50.777506+00	
00000000-0000-0000-0000-000000000000	4cd9bf2e-4999-4d1d-a287-9e3b507ab249	{"action":"user_recovery_requested","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"user"}	2025-07-15 02:00:49.624392+00	
00000000-0000-0000-0000-000000000000	5a1637f7-89b8-48bd-a61f-ae8b99955e89	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-15 02:01:02.125935+00	
00000000-0000-0000-0000-000000000000	d4b420bc-2caa-432a-a1ec-eb5f13c5c072	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tttt@mailinator.com","user_id":"8f6cba15-4a4a-4b3d-aed1-a0fe68d88c9c","user_phone":""}}	2025-07-15 02:01:30.122108+00	
00000000-0000-0000-0000-000000000000	e091bd86-3188-4c80-b6fa-537742f17331	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:01:57.302216+00	
00000000-0000-0000-0000-000000000000	8f55db30-2e4a-4baf-911f-5969cec5d289	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:02:01.249314+00	
00000000-0000-0000-0000-000000000000	8b880f3d-6dba-43c3-881c-ed1cac3947fa	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:02:06.503025+00	
00000000-0000-0000-0000-000000000000	bad491a3-ed9e-437e-b7ef-0d77ab22cb27	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:02:08.326119+00	
00000000-0000-0000-0000-000000000000	8da73250-3c34-4b1c-97ab-73a8825c4bc8	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:04:28.407926+00	
00000000-0000-0000-0000-000000000000	711a64ed-8420-4491-a766-9bbe99f780f6	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:05:46.8327+00	
00000000-0000-0000-0000-000000000000	dfca5507-f0be-464a-a1cb-401ed00ffe78	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:07:51.533095+00	
00000000-0000-0000-0000-000000000000	fedf4660-f5c2-4a82-bd7b-0b50ac2c232c	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:07:56.556633+00	
00000000-0000-0000-0000-000000000000	21248100-8f73-4e11-8338-631e0317c3b6	{"action":"user_confirmation_requested","actor_id":"8848d4ce-a5d5-4d94-b5e4-83cbfa24b44c","actor_username":"kal@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-15 02:20:45.542309+00	
00000000-0000-0000-0000-000000000000	18293638-d753-43bf-ad00-501ec8a2cc23	{"action":"user_signedup","actor_id":"8848d4ce-a5d5-4d94-b5e4-83cbfa24b44c","actor_username":"kal@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-15 02:21:15.092876+00	
00000000-0000-0000-0000-000000000000	d602fb54-716c-475e-9d51-17b2ca850a3d	{"action":"login","actor_id":"8848d4ce-a5d5-4d94-b5e4-83cbfa24b44c","actor_username":"kal@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 02:21:31.24225+00	
00000000-0000-0000-0000-000000000000	44d8ae20-ecda-410c-936e-8da34f0d54cd	{"action":"logout","actor_id":"8848d4ce-a5d5-4d94-b5e4-83cbfa24b44c","actor_username":"kal@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-15 02:26:32.829391+00	
00000000-0000-0000-0000-000000000000	550974f4-2004-4400-b15f-8bd311c2aa67	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 11:21:14.780753+00	
00000000-0000-0000-0000-000000000000	f12419e8-5111-471c-961e-b80cb91ff2dd	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 11:21:42.329024+00	
00000000-0000-0000-0000-000000000000	7a963fb7-26c3-4e52-9c83-b97c8a1c82a5	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 11:22:26.010183+00	
00000000-0000-0000-0000-000000000000	6506b9c0-fd6d-42dd-a064-62bddfc0ab70	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 11:24:08.471752+00	
00000000-0000-0000-0000-000000000000	f8e5f492-1326-40df-9450-8a39660ff010	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 11:27:22.782143+00	
00000000-0000-0000-0000-000000000000	dda4f044-f41d-4800-a4dc-6c013e0aab8a	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:25:37.350738+00	
00000000-0000-0000-0000-000000000000	a0d74be9-0781-4d96-85bd-80227d8cf30f	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:25:37.354089+00	
00000000-0000-0000-0000-000000000000	d676bcc0-7ba4-453f-a5a1-a890ccaaf75a	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:29:59.845324+00	
00000000-0000-0000-0000-000000000000	d78277ae-4da5-4793-9113-e19f9a63d6e2	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:29:59.848097+00	
00000000-0000-0000-0000-000000000000	03aba297-52ed-4613-90df-5d9bb68f9e61	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 12:37:27.46104+00	
00000000-0000-0000-0000-000000000000	8d49b621-25ae-47cf-90d2-c858c4061911	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 12:38:07.110618+00	
00000000-0000-0000-0000-000000000000	00e5013a-eb5c-4ba9-9825-c1adaa72ef9a	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:38:19.105955+00	
00000000-0000-0000-0000-000000000000	00a3d414-248d-4591-8b7a-f3bd32416590	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:38:19.107818+00	
00000000-0000-0000-0000-000000000000	29144485-bc71-4ca5-b6ff-17955a0c2c9f	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 12:38:28.40236+00	
00000000-0000-0000-0000-000000000000	2e707c8f-ad9a-4d8c-a7a2-9a08c1d83271	{"action":"token_refreshed","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:51:53.020193+00	
00000000-0000-0000-0000-000000000000	371178a5-f96f-49b2-8b15-9ab69b90cff5	{"action":"token_revoked","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 12:51:53.022243+00	
00000000-0000-0000-0000-000000000000	f8c0882f-f0b7-44cb-b03d-93e28d746422	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 16:33:54.165129+00	
00000000-0000-0000-0000-000000000000	0942d209-0fd0-4de7-834c-0a0908ba42fd	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 16:33:54.167244+00	
00000000-0000-0000-0000-000000000000	26907336-a0f2-46b9-8eee-6e2fae9780ef	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 17:15:14.732639+00	
00000000-0000-0000-0000-000000000000	f9cc94fa-9670-4564-bbfa-7accbe8b1a0f	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 17:15:14.734787+00	
00000000-0000-0000-0000-000000000000	2e567b88-bf6d-4a23-b0cc-a31c45ba3bd8	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 17:44:10.304535+00	
00000000-0000-0000-0000-000000000000	d26ef14e-c156-4903-9431-1edd2c4b8907	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 17:45:48.007929+00	
00000000-0000-0000-0000-000000000000	6fcd5931-dbb9-47dc-9a24-a5a40d2fe11f	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 18:23:11.013707+00	
00000000-0000-0000-0000-000000000000	3fcec5b1-b7e4-45af-b51f-e64766fcf55d	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 18:54:08.747255+00	
00000000-0000-0000-0000-000000000000	f6b4745b-bf83-4def-9b78-7fd27095c539	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 18:54:16.909012+00	
00000000-0000-0000-0000-000000000000	6df27f48-2337-4313-b883-afc2f67bdb0c	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-15 19:05:11.69993+00	
00000000-0000-0000-0000-000000000000	52e672a7-dc67-41e5-b48c-c83ac4fab3ad	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:04:11.953574+00	
00000000-0000-0000-0000-000000000000	5ed8f58a-db4b-4c49-aa6d-8f658cae68c0	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:04:11.956845+00	
00000000-0000-0000-0000-000000000000	5d691ddc-8aff-48c4-aba6-bbea75bee2b7	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:04:28.922991+00	
00000000-0000-0000-0000-000000000000	feeaa3be-820a-4484-b9a5-76cbaeae0419	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:04:28.923568+00	
00000000-0000-0000-0000-000000000000	37b289e9-142d-4c80-a66e-662c87e21e22	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:59:40.883891+00	
00000000-0000-0000-0000-000000000000	c4cc9e30-0ed2-4c26-8a79-551076d25404	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 20:59:40.88765+00	
00000000-0000-0000-0000-000000000000	bce0bd31-8827-4970-9c17-5641670c6d42	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:18:37.876517+00	
00000000-0000-0000-0000-000000000000	34de36c9-ce3c-4bfc-a92d-d4b305e9f6e4	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:18:37.880204+00	
00000000-0000-0000-0000-000000000000	917799ea-c676-4f2e-9b97-c81e9c1cf961	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:18:45.206165+00	
00000000-0000-0000-0000-000000000000	b103fac8-32ac-4d1d-95ec-7640ebc452d7	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 21:18:45.206742+00	
00000000-0000-0000-0000-000000000000	fecd6155-9fc4-4f0d-8d52-60b762239dd4	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 07:03:18.881156+00	
00000000-0000-0000-0000-000000000000	88c5b12b-d188-4733-9a3a-6d7c98630df1	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 07:03:18.890809+00	
00000000-0000-0000-0000-000000000000	5ba22340-1eb0-46e6-827c-5fffdf916871	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 07:04:20.256756+00	
00000000-0000-0000-0000-000000000000	01ad4bde-0024-45d1-9b9a-af995ea2c3e6	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 07:23:03.580494+00	
00000000-0000-0000-0000-000000000000	63f54df0-e503-4287-80ad-30ef259b5b1d	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 07:23:03.583857+00	
00000000-0000-0000-0000-000000000000	339bcaa4-d358-425d-8ed1-b7802ea96884	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 07:49:35.491068+00	
00000000-0000-0000-0000-000000000000	6ebb0a4f-e95e-4473-9e99-9198185780b7	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 11:07:28.62412+00	
00000000-0000-0000-0000-000000000000	4ff94770-9253-4efb-a9f7-21e0ee05498a	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 11:07:28.626183+00	
00000000-0000-0000-0000-000000000000	172349c6-096b-4fce-9a83-d28800610dab	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 11:08:23.970114+00	
00000000-0000-0000-0000-000000000000	9a9c60ec-36bd-4bc7-89b3-1128f32b1312	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 11:08:23.970694+00	
00000000-0000-0000-0000-000000000000	0445e2c8-f424-4a70-9b94-f80efffc30fb	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 11:08:31.379165+00	
00000000-0000-0000-0000-000000000000	07aa67f0-d3ea-4a39-925c-0e418b6f7e8b	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 11:08:31.379713+00	
00000000-0000-0000-0000-000000000000	5dee8a38-c28c-4bf7-a927-095c54a6320c	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 11:09:03.117954+00	
00000000-0000-0000-0000-000000000000	57d7ecc4-6439-4731-bbe7-feaaefc3b441	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 11:12:18.423525+00	
00000000-0000-0000-0000-000000000000	96cd9955-2ecc-4b72-8788-2d64be1b72da	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 17:25:57.695175+00	
00000000-0000-0000-0000-000000000000	87d09773-cf33-41b8-a945-7b30318d589f	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 17:25:57.702092+00	
00000000-0000-0000-0000-000000000000	dab1a5a9-4f3a-4e86-9704-6627894b04de	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-16 17:26:07.09382+00	
00000000-0000-0000-0000-000000000000	b9142f1b-3f7c-41ce-82dc-7ef3ce16f3af	{"action":"token_refreshed","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 17:28:13.542315+00	
00000000-0000-0000-0000-000000000000	dc0d1a88-afc2-4e38-b15a-5fa3feeedce4	{"action":"token_revoked","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 17:28:13.543091+00	
00000000-0000-0000-0000-000000000000	d3fcdc80-5063-4909-9c91-f4442911eb11	{"action":"logout","actor_id":"953d738d-2939-4bc4-915c-87ed839ed230","actor_username":"xyz@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-16 17:30:45.233937+00	
00000000-0000-0000-0000-000000000000	ac2ddab6-7c01-443b-ba3a-53a5114e041a	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 17:44:05.720798+00	
00000000-0000-0000-0000-000000000000	64e65b33-55e5-4b4c-8b2c-d7dbc2f789ea	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 17:44:30.564481+00	
00000000-0000-0000-0000-000000000000	26c273aa-a5ab-4446-92c8-9445988acfd4	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 19:10:38.400915+00	
00000000-0000-0000-0000-000000000000	035bdb4b-24d8-47e4-b9d5-6b8d66bb6c02	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-16 19:11:08.924792+00	
00000000-0000-0000-0000-000000000000	85ac0e84-ce37-4458-b2ad-8dad9e0f880a	{"action":"user_confirmation_requested","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-16 19:11:39.479845+00	
00000000-0000-0000-0000-000000000000	706336af-f1e0-42cc-bce9-ccdf115d85d0	{"action":"user_signedup","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-16 19:12:16.432721+00	
00000000-0000-0000-0000-000000000000	00b6a7ff-c2b4-4fcd-a186-2fe6a34b390f	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 19:58:04.825282+00	
00000000-0000-0000-0000-000000000000	f75ff3ef-360a-45de-a38f-e5632b812e2b	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 19:58:04.828983+00	
00000000-0000-0000-0000-000000000000	6a0fb1a0-28bb-4ada-a7ff-596529408b1b	{"action":"token_refreshed","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 20:18:01.218565+00	
00000000-0000-0000-0000-000000000000	88a5a909-247d-4f05-8d8e-e382f70f1961	{"action":"token_revoked","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 20:18:01.223556+00	
00000000-0000-0000-0000-000000000000	7fd87f35-7869-45c3-9805-8262a3af5105	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 20:31:30.479972+00	
00000000-0000-0000-0000-000000000000	7e93f2d9-7341-4ba4-aa23-53f109f8d4c9	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 20:34:16.288443+00	
00000000-0000-0000-0000-000000000000	9a65101a-2270-4ef3-b91f-f741144837fc	{"action":"login","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-16 20:53:07.218553+00	
00000000-0000-0000-0000-000000000000	105b990f-b85b-454f-948c-f5bde6a756af	{"action":"token_refreshed","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 12:39:23.084137+00	
00000000-0000-0000-0000-000000000000	61ae5af0-bca4-4b2d-b07f-d7a04c1de8ca	{"action":"token_revoked","actor_id":"acd9128a-45b7-413a-9326-278dc337b4af","actor_username":"hassan-flg-user-five@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 12:39:23.090904+00	
00000000-0000-0000-0000-000000000000	8939eb45-ad5a-4ffd-9d4a-d06b26056477	{"action":"user_confirmation_requested","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-17 12:55:04.084161+00	
00000000-0000-0000-0000-000000000000	e2533161-d38e-4002-b2c6-43c4b1f10392	{"action":"user_signedup","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-17 12:55:18.498357+00	
00000000-0000-0000-0000-000000000000	2145447b-3a49-4cc2-b285-2998304f79dc	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 13:00:03.398583+00	
00000000-0000-0000-0000-000000000000	1b7fe679-65df-4ac3-a4c1-3187194345dc	{"action":"token_refreshed","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:07:56.846582+00	
00000000-0000-0000-0000-000000000000	cefe3910-bc09-4910-8623-f12fb8dd28a5	{"action":"token_revoked","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:07:56.849188+00	
00000000-0000-0000-0000-000000000000	69479ff4-fb91-45d8-ac4d-7e1b348b12fc	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 13:11:10.43127+00	
00000000-0000-0000-0000-000000000000	0e9850dc-78dd-4e1a-a94f-ad202aa039c1	{"action":"token_refreshed","actor_id":"0f3eb531-f964-4379-8ab8-a9217427dad1","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:12:38.284841+00	
00000000-0000-0000-0000-000000000000	0047fade-377c-47eb-b466-bb59fbdcf639	{"action":"token_revoked","actor_id":"0f3eb531-f964-4379-8ab8-a9217427dad1","actor_username":"talhamushtaq6997@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:12:38.286347+00	
00000000-0000-0000-0000-000000000000	ca33c790-a74e-4666-b71c-2b4e7853f4eb	{"action":"token_refreshed","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 14:02:45.602539+00	
00000000-0000-0000-0000-000000000000	fb460b53-4761-4034-a322-5214d72b70d0	{"action":"token_revoked","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 14:02:45.605887+00	
00000000-0000-0000-0000-000000000000	2e571dfa-2aa5-47d0-874f-cc74ccb378fb	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 16:59:59.668936+00	
00000000-0000-0000-0000-000000000000	5b86e285-ec60-4ad4-8c2e-d3a458e6b902	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 16:59:59.67193+00	
00000000-0000-0000-0000-000000000000	b0724c8e-0ebe-4c5c-b87a-5b522068c98f	{"action":"token_refreshed","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:03:59.676598+00	
00000000-0000-0000-0000-000000000000	6965bf13-49ca-4987-b827-140bebed1af3	{"action":"token_revoked","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:03:59.677409+00	
00000000-0000-0000-0000-000000000000	e4e965c4-365b-4c83-8481-8c033cf1c04f	{"action":"token_refreshed","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:12:37.850912+00	
00000000-0000-0000-0000-000000000000	c69c458e-937a-4c69-916f-f50ca58332fb	{"action":"token_revoked","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:12:37.853428+00	
00000000-0000-0000-0000-000000000000	9f0baef9-24d0-4423-8af3-21224e6761b0	{"action":"logout","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-17 18:21:26.478072+00	
00000000-0000-0000-0000-000000000000	b8cf91ba-e1a5-46fa-8453-0fb64cedaba4	{"action":"login","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 18:24:54.474148+00	
00000000-0000-0000-0000-000000000000	815c84b6-d1aa-4bcb-99a2-88bc08657e26	{"action":"logout","actor_id":"849c98ad-ec88-40af-a6c5-505bee29261e","actor_username":"onboarding@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-17 18:25:08.942137+00	
00000000-0000-0000-0000-000000000000	4f8e91ea-91d8-4047-bbe5-c7c8b2ec8af6	{"action":"user_confirmation_requested","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-17 18:25:25.33047+00	
00000000-0000-0000-0000-000000000000	098d1ff4-5465-4da5-b178-e82b1f44128f	{"action":"user_signedup","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-17 18:27:22.988055+00	
00000000-0000-0000-0000-000000000000	27316d3c-0b62-4dc6-88d5-0db32de9be82	{"action":"token_refreshed","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 19:26:25.553624+00	
00000000-0000-0000-0000-000000000000	101a0a37-072f-4236-8654-bce0a7f95a63	{"action":"token_revoked","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 19:26:25.555191+00	
00000000-0000-0000-0000-000000000000	6f5d29c4-06e7-4b54-8bb4-8988373d05d6	{"action":"login","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 19:33:47.812827+00	
00000000-0000-0000-0000-000000000000	d44dad50-90cf-44e3-9959-0148bf9fabee	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 20:05:23.003962+00	
00000000-0000-0000-0000-000000000000	f8ba2da2-281e-4667-ac81-00327af45fcb	{"action":"token_refreshed","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 20:36:33.474162+00	
00000000-0000-0000-0000-000000000000	b4ba0db4-5acc-4ba7-ad19-aa6fc9b673bc	{"action":"token_revoked","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 20:36:33.476208+00	
00000000-0000-0000-0000-000000000000	000c19c1-4313-46af-9146-0db31d4501ea	{"action":"logout","actor_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","actor_username":"onboarding2@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-17 21:17:05.396671+00	
00000000-0000-0000-0000-000000000000	b05c0c8c-5d7d-4ea7-bc12-da89d3ff31e4	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 17:03:32.047247+00	
00000000-0000-0000-0000-000000000000	a220e0f6-a70d-49e1-aa05-9f99cbe15a32	{"action":"user_confirmation_requested","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-17 21:17:22.091244+00	
00000000-0000-0000-0000-000000000000	3414b1ca-7256-4814-aa8c-fc9596a976a3	{"action":"user_signedup","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-17 21:17:32.27199+00	
00000000-0000-0000-0000-000000000000	8678c5f6-9e29-42fb-8940-024beb825c6e	{"action":"logout","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-17 21:17:40.729883+00	
00000000-0000-0000-0000-000000000000	cc585b49-5b76-4c67-b1ab-f54f938afa41	{"action":"login","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 21:17:44.248673+00	
00000000-0000-0000-0000-000000000000	58556858-da3b-47f4-a266-a96f44ba7dd7	{"action":"login","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 21:24:14.098181+00	
00000000-0000-0000-0000-000000000000	4c1dc124-431f-4d29-8da0-0f50f620cafb	{"action":"logout","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-17 21:24:22.80772+00	
00000000-0000-0000-0000-000000000000	89362d70-1163-488c-9ed7-76b06f87adfe	{"action":"user_confirmation_requested","actor_id":"1c2beda1-0ddd-44f1-951b-2525496db873","actor_username":"ppppp@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-17 21:24:39.142163+00	
00000000-0000-0000-0000-000000000000	cc5dafd5-b028-4901-839e-5ba4d8db09c9	{"action":"user_signedup","actor_id":"1c2beda1-0ddd-44f1-951b-2525496db873","actor_username":"ppppp@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-17 21:24:53.186399+00	
00000000-0000-0000-0000-000000000000	7e19079f-da2c-49cb-9e37-d4ee43988659	{"action":"login","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 22:10:01.319471+00	
00000000-0000-0000-0000-000000000000	aa37bd55-d71c-4750-8b38-bf91abc8216b	{"action":"logout","actor_id":"b3e10068-59b2-4890-ad38-366acfa63846","actor_username":"permission@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-17 22:41:42.397405+00	
00000000-0000-0000-0000-000000000000	9364e8b7-c212-4677-b0d1-6b8af9e9dde3	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 22:41:45.632971+00	
00000000-0000-0000-0000-000000000000	c56dc867-78cd-4605-8253-8969a5038d6a	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-17 22:42:15.853519+00	
00000000-0000-0000-0000-000000000000	43b2eb25-6e0b-458c-b8e3-1f56e815d0a4	{"action":"user_confirmation_requested","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-17 22:42:38.887579+00	
00000000-0000-0000-0000-000000000000	b5d494a4-46f9-4439-b756-88d4777938f4	{"action":"user_signedup","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-17 22:43:25.328685+00	
00000000-0000-0000-0000-000000000000	1d5528ee-e578-421c-9d29-149178578d84	{"action":"login","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-17 22:43:47.60627+00	
00000000-0000-0000-0000-000000000000	fa3d682a-bdf0-445d-afcc-da79c73b4e8d	{"action":"token_refreshed","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 10:18:17.192572+00	
00000000-0000-0000-0000-000000000000	0077d1dd-3669-48a9-8827-b4aa5972430e	{"action":"token_revoked","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 10:18:17.208368+00	
00000000-0000-0000-0000-000000000000	6a32676f-21d3-499b-928e-05468d191dcf	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 12:27:33.654991+00	
00000000-0000-0000-0000-000000000000	260e5be9-e139-4a1b-8b46-86c8c0d02321	{"action":"token_refreshed","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 13:05:44.761191+00	
00000000-0000-0000-0000-000000000000	b8bd61d7-7ed5-4d09-bf09-162bd28b0318	{"action":"token_revoked","actor_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","actor_username":"hassan-bb-one-user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 13:05:44.764549+00	
00000000-0000-0000-0000-000000000000	192ef9dd-dc30-48ee-a97b-60a4406909cc	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-18 13:13:57.004326+00	
00000000-0000-0000-0000-000000000000	7fa1694e-ba59-44f9-8df0-af9a594117f7	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 13:24:12.844534+00	
00000000-0000-0000-0000-000000000000	f4fd821a-1554-4d5f-9433-ba96f199abea	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 14:22:42.940286+00	
00000000-0000-0000-0000-000000000000	eb7517e6-6bc0-4320-bcad-68c89d8d303b	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 14:22:42.942344+00	
00000000-0000-0000-0000-000000000000	9abd444e-62ad-4259-b27e-daec1ad4b1ee	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:36:57.406394+00	
00000000-0000-0000-0000-000000000000	96bbba6f-6eea-42f1-bd24-7ea6782448e7	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:36:57.408504+00	
00000000-0000-0000-0000-000000000000	94602962-422a-4596-b723-1cbec427b2d7	{"action":"token_refreshed","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:48:17.631261+00	
00000000-0000-0000-0000-000000000000	f8f915ac-94ba-4e22-8789-a499361830b5	{"action":"token_revoked","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 15:48:17.633519+00	
00000000-0000-0000-0000-000000000000	ab2cd123-d076-4761-8568-cf1428c4e0b6	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 16:35:02.120896+00	
00000000-0000-0000-0000-000000000000	138f63d8-231e-4e91-8c17-38741bb78ca8	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 16:35:02.122976+00	
00000000-0000-0000-0000-000000000000	772c515c-488c-4331-987c-90f2ea70bfe9	{"action":"token_refreshed","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 16:49:27.459119+00	
00000000-0000-0000-0000-000000000000	f6fcf042-2ff2-4978-b22d-077ba9df9e0c	{"action":"token_revoked","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 16:49:27.46436+00	
00000000-0000-0000-0000-000000000000	dda2020e-4505-46fc-ba3c-87cfdff67131	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 18:02:00.141832+00	
00000000-0000-0000-0000-000000000000	e47c994e-8ccf-49d8-82d7-b2a612dac9ae	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 18:02:00.147149+00	
00000000-0000-0000-0000-000000000000	a238fb7f-6958-4595-9a16-79ddfb6dc33f	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-18 18:17:03.716472+00	
00000000-0000-0000-0000-000000000000	21dfe6b5-6792-4318-9396-37e51183ca22	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 19:15:17.249017+00	
00000000-0000-0000-0000-000000000000	269ee29e-43cf-4937-9055-d4f6cb4c49aa	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 19:15:17.251549+00	
00000000-0000-0000-0000-000000000000	59a5c1ec-7786-4197-bc28-1e4afa6a419f	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:43:08.026717+00	
00000000-0000-0000-0000-000000000000	e2b51cc7-ab35-42db-9543-c9b33e767982	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:43:08.029932+00	
00000000-0000-0000-0000-000000000000	133de216-e0fb-463d-ada9-0f57867e74d5	{"action":"token_refreshed","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:50:22.903933+00	
00000000-0000-0000-0000-000000000000	a9edff82-2ad5-4bb1-a8f8-997a06c1d36e	{"action":"token_revoked","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 20:50:22.906251+00	
00000000-0000-0000-0000-000000000000	eadab6fe-c7dd-4cce-8b70-23a4aef394bf	{"action":"token_refreshed","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 11:04:45.577143+00	
00000000-0000-0000-0000-000000000000	c6d49466-de9d-4e86-8d05-d418fd8209e9	{"action":"token_revoked","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 11:04:45.586743+00	
00000000-0000-0000-0000-000000000000	c69cecb3-54da-42ba-9b67-a155db01c2d4	{"action":"logout","actor_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","actor_username":"111@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 11:04:59.360135+00	
00000000-0000-0000-0000-000000000000	e9a5db8c-c4da-4d9f-9be9-b092da309d4d	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 11:05:19.142539+00	
00000000-0000-0000-0000-000000000000	906b5c0f-326e-48b2-91ba-a9ea0bbc0dd7	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 11:22:57.126813+00	
00000000-0000-0000-0000-000000000000	1cbe43cf-f0fa-4a2c-96ad-3c57445c1bfd	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 11:27:59.827715+00	
00000000-0000-0000-0000-000000000000	52d3fdda-10c5-4f5b-86c2-d1792ece258d	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 11:28:40.314028+00	
00000000-0000-0000-0000-000000000000	54d44196-5402-469b-b791-0b3b61ce24b2	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 11:38:25.720288+00	
00000000-0000-0000-0000-000000000000	151f595c-5b93-430e-b1cc-396afb3bb82b	{"action":"logout","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 11:46:46.480911+00	
00000000-0000-0000-0000-000000000000	e9158010-4e1f-40ff-9fc8-f5e00259a585	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 11:46:53.763805+00	
00000000-0000-0000-0000-000000000000	f005c400-9614-4116-ba3c-6ca7d6038c8d	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 13:16:12.896244+00	
00000000-0000-0000-0000-000000000000	de02f59a-2084-4c7d-8aa9-6bd3e3abe0b7	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 13:16:12.899035+00	
00000000-0000-0000-0000-000000000000	ed6808fe-cde9-49fd-b212-a07f15ed0881	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 13:16:46.614953+00	
00000000-0000-0000-0000-000000000000	15f6a78f-20dd-4adc-bbcd-ed6246bbd66a	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 17:53:57.398695+00	
00000000-0000-0000-0000-000000000000	1d5689fa-53c4-41bb-a029-0fe108aeb773	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 17:53:57.404054+00	
00000000-0000-0000-0000-000000000000	8a4d3a3a-6d16-4088-aead-ec5e4d4b3d51	{"action":"token_refreshed","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 18:55:38.44907+00	
00000000-0000-0000-0000-000000000000	29ebc62a-7c6d-4d06-9eb7-e810c9cd767d	{"action":"token_revoked","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-20 18:55:38.456069+00	
00000000-0000-0000-0000-000000000000	c3daf122-d880-40ff-8b9f-8c0c700a7de8	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 18:56:06.441854+00	
00000000-0000-0000-0000-000000000000	b61e3818-96d4-4e51-9ebd-8b122d612d11	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 18:56:08.877074+00	
00000000-0000-0000-0000-000000000000	f0715562-1265-4aa6-85ad-997297e77961	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 18:57:15.560179+00	
00000000-0000-0000-0000-000000000000	d23a42db-9172-4b34-8727-d95896f8f345	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 18:57:17.501059+00	
00000000-0000-0000-0000-000000000000	265467ca-0ec9-4172-94f6-941bb95173c9	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 18:58:12.797101+00	
00000000-0000-0000-0000-000000000000	c545df06-9f24-4d80-8229-c163af14bb96	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 18:58:14.550317+00	
00000000-0000-0000-0000-000000000000	0783a5e3-25e9-4447-8e15-82384fa81411	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:03:11.150164+00	
00000000-0000-0000-0000-000000000000	a6db2733-e9e3-4f43-a496-617737ab035f	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 19:03:16.063199+00	
00000000-0000-0000-0000-000000000000	7dfd1051-0cfb-45cf-9932-7ff56ce817f8	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:04:25.01819+00	
00000000-0000-0000-0000-000000000000	b21c4ccb-90a3-424d-91dd-59200d4c46ea	{"action":"login","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 19:04:26.915379+00	
00000000-0000-0000-0000-000000000000	f2dc8e00-9183-4c1c-a54b-bd4e99c00095	{"action":"logout","actor_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","actor_username":"dev@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:05:42.139033+00	
00000000-0000-0000-0000-000000000000	521d9d0a-ee3b-4924-a253-e842de1ab51f	{"action":"user_confirmation_requested","actor_id":"e749cb74-5916-4cc5-a35b-10f40b9242e7","actor_username":"testing1012@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-20 19:06:18.32367+00	
00000000-0000-0000-0000-000000000000	a20ddc08-88a8-499f-a23e-ce7f94178f5f	{"action":"user_signedup","actor_id":"e749cb74-5916-4cc5-a35b-10f40b9242e7","actor_username":"testing1012@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-20 19:06:57.343415+00	
00000000-0000-0000-0000-000000000000	69e105af-723e-4b00-86a8-2b2f10e2d802	{"action":"logout","actor_id":"e749cb74-5916-4cc5-a35b-10f40b9242e7","actor_username":"testing1012@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:11:36.059871+00	
00000000-0000-0000-0000-000000000000	0b1ea0ac-a784-4871-a6c0-5544f83cccfa	{"action":"user_confirmation_requested","actor_id":"9ca38876-d3fe-45d7-a7f6-c468ec18ef81","actor_username":"bbbb@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-20 19:11:59.253381+00	
00000000-0000-0000-0000-000000000000	e3f48a65-8931-4550-8c4b-4fbf20c04c8b	{"action":"user_signedup","actor_id":"9ca38876-d3fe-45d7-a7f6-c468ec18ef81","actor_username":"bbbb@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-20 19:12:17.539879+00	
00000000-0000-0000-0000-000000000000	4aeeca71-585e-47e8-b20d-7e433c860681	{"action":"logout","actor_id":"9ca38876-d3fe-45d7-a7f6-c468ec18ef81","actor_username":"bbbb@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:15:01.912498+00	
00000000-0000-0000-0000-000000000000	686cac66-afc7-40ee-bd7e-677e45d7d1bb	{"action":"user_confirmation_requested","actor_id":"53d3c257-3c3f-41d1-97e1-9ef27148fd1a","actor_username":"vvvvv@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-20 19:15:18.399788+00	
00000000-0000-0000-0000-000000000000	aaf30cac-12c8-4d1b-974c-9012e4a7089c	{"action":"user_signedup","actor_id":"53d3c257-3c3f-41d1-97e1-9ef27148fd1a","actor_username":"vvvvv@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-20 19:15:33.089665+00	
00000000-0000-0000-0000-000000000000	a7a5487e-0252-489d-ae1d-4a31eab14668	{"action":"logout","actor_id":"53d3c257-3c3f-41d1-97e1-9ef27148fd1a","actor_username":"vvvvv@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:16:09.886158+00	
00000000-0000-0000-0000-000000000000	a2a0c4c0-2e5d-46f0-87e6-c70d35050dd2	{"action":"login","actor_id":"53d3c257-3c3f-41d1-97e1-9ef27148fd1a","actor_username":"vvvvv@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 19:16:14.842698+00	
00000000-0000-0000-0000-000000000000	86547edf-fdd7-4ba8-b2ac-8b804b4ab95e	{"action":"logout","actor_id":"53d3c257-3c3f-41d1-97e1-9ef27148fd1a","actor_username":"vvvvv@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:16:35.662841+00	
00000000-0000-0000-0000-000000000000	7cf9d38f-82cb-4183-b73c-107e06e8fefe	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 19:17:04.809295+00	
00000000-0000-0000-0000-000000000000	612ed39d-853a-4c0c-a692-d21abe714167	{"action":"logout","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:17:43.643755+00	
00000000-0000-0000-0000-000000000000	68de8fc2-f168-441e-b40d-65e618d998ca	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 19:18:05.938563+00	
00000000-0000-0000-0000-000000000000	1420d48e-dbe2-41a5-9f02-f98c2fe230e3	{"action":"logout","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:18:35.860443+00	
00000000-0000-0000-0000-000000000000	498ca44b-0139-42a6-9cee-231d850e0bab	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 19:18:54.285246+00	
00000000-0000-0000-0000-000000000000	8d066b2b-7a2a-4015-935b-d2378633e8fd	{"action":"logout","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:19:45.32788+00	
00000000-0000-0000-0000-000000000000	d8b06b04-0112-482a-8e31-71816a4fab37	{"action":"login","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-20 19:20:27.693718+00	
00000000-0000-0000-0000-000000000000	be54830c-7114-4aa2-96de-cc2bcd272d23	{"action":"logout","actor_id":"0bf630db-6a6f-441b-a739-f395be4fd664","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-20 19:22:14.587645+00	
00000000-0000-0000-0000-000000000000	0c60e06c-c85a-4bcf-86d7-37ab278a2098	{"action":"login","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-22 14:50:10.095563+00	
00000000-0000-0000-0000-000000000000	5ac344bc-5d78-4afd-8bd7-25182980a0da	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 15:48:58.098954+00	
00000000-0000-0000-0000-000000000000	d02c20d4-5035-4c23-8bc3-36a7d271d26a	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 15:48:58.107499+00	
00000000-0000-0000-0000-000000000000	c3c5d265-d6f1-45b2-811e-357f67211926	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 16:53:10.66665+00	
00000000-0000-0000-0000-000000000000	f37c634a-c8d0-4237-8a37-5004705c63ac	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 16:53:10.669926+00	
00000000-0000-0000-0000-000000000000	0a788e9c-0c26-4771-915a-d53a5d0cbbc2	{"action":"token_refreshed","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 17:55:19.040792+00	
00000000-0000-0000-0000-000000000000	98ab58bd-d200-4db1-b20c-35b7930fcfc4	{"action":"token_revoked","actor_id":"6c37a735-1990-43f4-858f-a268d52a350d","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 17:55:19.046053+00	
00000000-0000-0000-0000-000000000000	4673664e-68d0-4854-bd3d-465cc208cbbd	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 13:48:22.338182+00	
00000000-0000-0000-0000-000000000000	92b0d4d0-0cf4-485d-a0ab-e7439b4953b4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"permission@mailinator.com","user_id":"b3e10068-59b2-4890-ad38-366acfa63846","user_phone":""}}	2025-07-22 18:28:42.762917+00	
00000000-0000-0000-0000-000000000000	dad094ac-f9fa-4716-96a0-eb8a88c949b1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev@mailinator.com","user_id":"6813a4dc-bc5c-4f56-8bf3-5dbce03d4366","user_phone":""}}	2025-07-22 18:28:42.772048+00	
00000000-0000-0000-0000-000000000000	266f2ce9-d659-4b23-926a-0e74c23fc724	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"vvvvv@mailinator.com","user_id":"53d3c257-3c3f-41d1-97e1-9ef27148fd1a","user_phone":""}}	2025-07-22 18:28:42.779525+00	
00000000-0000-0000-0000-000000000000	2a8fe5b4-e945-4cf1-89f9-c1c1736c8ab5	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"bb-user-one@mailinator.com","user_id":"bcf59884-b2ed-46b4-9f50-50fd8cf53f97","user_phone":""}}	2025-07-22 18:28:42.802664+00	
00000000-0000-0000-0000-000000000000	aace9ec1-e528-42b9-973c-2e8688d9b1f8	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-bb-one-user@mailinator.com","user_id":"1d469088-85f9-4b9d-a40c-84361f50ce55","user_phone":""}}	2025-07-22 18:28:42.802672+00	
00000000-0000-0000-0000-000000000000	9ecbc162-4fae-45b3-9604-e313f094524e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"onboarding@mailinator.com","user_id":"849c98ad-ec88-40af-a6c5-505bee29261e","user_phone":""}}	2025-07-22 18:28:42.804455+00	
00000000-0000-0000-0000-000000000000	725142cc-ede6-497b-9b8d-0b1e3e4b6edc	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ppppp@mailinator.com","user_id":"1c2beda1-0ddd-44f1-951b-2525496db873","user_phone":""}}	2025-07-22 18:28:42.826822+00	
00000000-0000-0000-0000-000000000000	e474bcb8-b756-49e4-aa10-222687612efa	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talhamushtaq6997@gmail.com","user_id":"0f3eb531-f964-4379-8ab8-a9217427dad1","user_phone":""}}	2025-07-22 18:28:42.826973+00	
00000000-0000-0000-0000-000000000000	4cb88955-5a63-475a-a703-35a149642fe2	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan.mujtaba@codejunkie.co","user_id":"72d0e09c-1670-42c7-98aa-c9cbec875cfc","user_phone":""}}	2025-07-22 18:28:42.830274+00	
00000000-0000-0000-0000-000000000000	4364790f-4869-48a4-8cac-28bad2a890b0	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"111@mailinator.com","user_id":"a08b8c00-82b2-4b31-afce-08c7e7ef0ad1","user_phone":""}}	2025-07-22 18:28:42.828714+00	
00000000-0000-0000-0000-000000000000	52287a9f-3516-4074-a313-6a2b214ffc5c	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"onboarding2@mailinator.com","user_id":"ae790c5a-6641-4e57-8804-43fcfcead1d3","user_phone":""}}	2025-07-22 18:28:42.835181+00	
00000000-0000-0000-0000-000000000000	8033af78-acd1-41e9-a704-8a2c2aad2829	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"bbbb@mailinator.com","user_id":"9ca38876-d3fe-45d7-a7f6-c468ec18ef81","user_phone":""}}	2025-07-22 18:28:42.845907+00	
00000000-0000-0000-0000-000000000000	b4bfb2f3-798d-4b64-8a39-8727e3ede6aa	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_admn@mailinator.com","user_id":"0bf630db-6a6f-441b-a739-f395be4fd664","user_phone":""}}	2025-07-22 18:28:42.855135+00	
00000000-0000-0000-0000-000000000000	fd156a35-6711-4a93-945c-5aeae1795061	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talhamushtaq565@gmail.com","user_id":"60c28fe9-1a31-4455-af2e-2e117d5e2e45","user_phone":""}}	2025-07-22 18:28:42.859641+00	
00000000-0000-0000-0000-000000000000	5f055be5-f335-4f40-8cf9-c2559c54faa6	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"testing1012@mailinator.com","user_id":"e749cb74-5916-4cc5-a35b-10f40b9242e7","user_phone":""}}	2025-07-22 18:28:42.861791+00	
00000000-0000-0000-0000-000000000000	ec1d9bc7-5aca-441b-ba7a-495bb504e1af	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"kal@mailinator.com","user_id":"8848d4ce-a5d5-4d94-b5e4-83cbfa24b44c","user_phone":""}}	2025-07-22 18:28:42.863384+00	
00000000-0000-0000-0000-000000000000	bcce35e9-847b-447b-b5ba-0c44bfb3792e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-betterbook-2@mailinator.com","user_id":"97c0f5a5-9f23-48ea-b402-2ad3d0b82f5c","user_phone":""}}	2025-07-22 18:28:42.86736+00	
00000000-0000-0000-0000-000000000000	6be1bc6b-853c-4190-8ca9-a85dc3d6bb56	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_accountant@mailinator.com","user_id":"6c37a735-1990-43f4-858f-a268d52a350d","user_phone":""}}	2025-07-22 18:28:42.870036+00	
00000000-0000-0000-0000-000000000000	c62f0092-0515-437f-90d0-3dd1676fbddc	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"user1@mailinator.com","user_id":"8cd651fb-6af2-4a3e-9516-40257b954bd7","user_phone":""}}	2025-07-22 18:28:42.868609+00	
00000000-0000-0000-0000-000000000000	8261802e-adeb-4e44-8954-9f12b29765a4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"xyz@mailinator.com","user_id":"953d738d-2939-4bc4-915c-87ed839ed230","user_phone":""}}	2025-07-22 18:28:42.873993+00	
00000000-0000-0000-0000-000000000000	4b2b0292-2a89-4ee2-8ed5-0b66e222edd4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-bb-5@mailinator.com","user_id":"8b3c4969-acfc-41ec-af10-fbf57204e315","user_phone":""}}	2025-07-22 18:29:07.189544+00	
00000000-0000-0000-0000-000000000000	4f52578c-673b-4733-baa5-c98600eb9bd1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test6@mailinator.com","user_id":"5d593238-40c0-4b29-9e41-397769604047","user_phone":""}}	2025-07-22 18:29:07.683266+00	
00000000-0000-0000-0000-000000000000	144ada3b-75ac-4b7e-a038-9ac10494a392	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talha4@mailinator.com","user_id":"409b7b78-68b7-46c3-9cf3-e01e27d9e680","user_phone":""}}	2025-07-22 18:29:07.685087+00	
00000000-0000-0000-0000-000000000000	a0c47d2e-89b8-475d-9bea-2213c02b224d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test5@mailinator.com","user_id":"48b04799-abe7-4a3b-a2f1-07c14642aec2","user_phone":""}}	2025-07-22 18:29:07.689604+00	
00000000-0000-0000-0000-000000000000	9a271c51-ba08-4875-9e11-65ee614db9bf	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talha2@mailinator.com","user_id":"2ded6d01-0854-43ac-b6c9-a3a95085c22b","user_phone":""}}	2025-07-22 18:29:07.70719+00	
00000000-0000-0000-0000-000000000000	e1dcbb84-62ea-45e9-923b-7d5b4fb21041	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test100@mailinator.com","user_id":"9d0fc5ee-a281-4d19-86b5-32f17e2489a2","user_phone":""}}	2025-07-22 18:29:07.735769+00	
00000000-0000-0000-0000-000000000000	b53d5fd6-9858-430f-9a28-0b5fd7704029	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pakistan1@mailinator.com","user_id":"6fe68cc3-77f2-400d-92d2-53aa130bed6a","user_phone":""}}	2025-07-22 18:29:07.746577+00	
00000000-0000-0000-0000-000000000000	954767fc-0d84-494a-b9d3-49c33f0bcb31	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test10@mailinator.com","user_id":"1d62f597-2ca0-4d40-b4f1-33317804e333","user_phone":""}}	2025-07-22 18:29:16.932638+00	
00000000-0000-0000-0000-000000000000	56ea18ac-cba2-4f59-8a4f-8b6e41a0ce51	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-test-flg-three@mailiantor.com","user_id":"bcaa9886-2ddc-4658-af89-d697425584f7","user_phone":""}}	2025-07-22 18:29:16.951347+00	
00000000-0000-0000-0000-000000000000	751b0512-3b33-4109-963d-bb171e1825ec	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test11@mailinator.com","user_id":"29dc3718-88f7-446e-9d28-cd678e79ed77","user_phone":""}}	2025-07-22 18:29:07.696299+00	
00000000-0000-0000-0000-000000000000	42d4b62c-da27-4ddc-befa-d7fd7c22ace3	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-flg-user-five@mailinator.com","user_id":"acd9128a-45b7-413a-9326-278dc337b4af","user_phone":""}}	2025-07-22 18:29:07.705058+00	
00000000-0000-0000-0000-000000000000	75b428f5-0fd5-4d8b-8877-09afc61877ee	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-flg-three-user@mailinator.com","user_id":"1f893de3-4e40-4c19-bd84-0730740648aa","user_phone":""}}	2025-07-22 18:29:07.721322+00	
00000000-0000-0000-0000-000000000000	698faa84-d697-4c99-8766-cd2bcf258faf	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"eng1@mailinator.com","user_id":"6d3cb661-4800-4a55-ba48-455d07f37cc0","user_phone":""}}	2025-07-22 18:29:07.729631+00	
00000000-0000-0000-0000-000000000000	d6126675-be4a-43e4-bded-f4b71c265485	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 13:48:22.343453+00	
00000000-0000-0000-0000-000000000000	877accd8-4b07-49db-b161-c095be5fe861	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 19:05:08.495897+00	
00000000-0000-0000-0000-000000000000	048f05ec-d1df-4ed9-9e4c-4801fb6a0db9	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 19:05:08.500487+00	
00000000-0000-0000-0000-000000000000	fb928e0f-b309-4c17-bf6a-ff641f208b76	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 14:14:49.163823+00	
00000000-0000-0000-0000-000000000000	029e5526-7e0d-4472-95be-3af4f804ef1f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"shahid1@mailinator.com","user_id":"ff17c053-35dc-44db-a728-6242b6fc75d8","user_phone":""}}	2025-07-22 18:29:07.711392+00	
00000000-0000-0000-0000-000000000000	8730faa1-ef1f-4c29-aa75-10d9bdc866c7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test101@mailinator.com","user_id":"a882f9ad-3cd2-417d-9f3d-48c3dd863c97","user_phone":""}}	2025-07-22 18:29:07.721319+00	
00000000-0000-0000-0000-000000000000	1c75133b-a14b-4770-a813-80535f768f7d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-flg-three-user-one@mailinator.com","user_id":"379e8e55-101a-4d21-bf90-a8e1c4d1e0fd","user_phone":""}}	2025-07-22 18:29:07.72624+00	
00000000-0000-0000-0000-000000000000	a4591425-262e-4154-89e4-d0423a1345ad	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talha1@mailinator.com","user_id":"06eb627b-348e-485a-9d64-328469d18c42","user_phone":""}}	2025-07-22 18:29:07.731515+00	
00000000-0000-0000-0000-000000000000	832cd0d2-5173-4d5d-a421-88be1c5096e7	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 15:13:44.063168+00	
00000000-0000-0000-0000-000000000000	f1f53b2c-ade7-44f7-88d3-f7bb95dceb55	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 11:25:40.234768+00	
00000000-0000-0000-0000-000000000000	b6f8ccaa-43a8-459b-98c2-07963197241e	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 11:25:40.243204+00	
00000000-0000-0000-0000-000000000000	a848b318-2160-4f14-a823-dc6a68eb6a8b	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:49:42.4305+00	
00000000-0000-0000-0000-000000000000	9be0e75d-c359-4992-b629-1273da2cd924	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:49:42.433567+00	
00000000-0000-0000-0000-000000000000	f0c0e433-e5e9-47bf-b6b7-8c605e727bd3	{"action":"user_confirmation_requested","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-22 18:32:45.489452+00	
00000000-0000-0000-0000-000000000000	ba1d8f4c-9ba9-41cf-8477-e3f1d0639b82	{"action":"user_signedup","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-22 18:33:05.572395+00	
00000000-0000-0000-0000-000000000000	d17e019f-5eab-4b3e-ae17-1991547eaa76	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-24 15:55:56.445941+00	
00000000-0000-0000-0000-000000000000	477c5be7-4fc9-47c4-a55a-ef63bde60139	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 15:56:11.338741+00	
00000000-0000-0000-0000-000000000000	877e6d2a-2952-495a-9f1a-61cc9e93afea	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 12:48:41.44132+00	
00000000-0000-0000-0000-000000000000	70bfb7a2-2b36-4832-8c83-30e46f4b3980	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 12:48:41.442105+00	
00000000-0000-0000-0000-000000000000	5fcabb7c-f282-4f47-aad0-5bd4f928557f	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:57:15.491079+00	
00000000-0000-0000-0000-000000000000	4dee3444-e8f6-4948-915a-ce9057d04b66	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 15:57:15.495673+00	
00000000-0000-0000-0000-000000000000	b1e614b8-5f62-441e-b235-ce216c59abad	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_accountant@mailinator.com","user_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","user_phone":""}}	2025-07-22 18:35:40.444178+00	
00000000-0000-0000-0000-000000000000	81017b24-3298-40c0-a5b3-bb2ac7d6aeb1	{"action":"user_recovery_requested","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"user"}	2025-07-22 18:36:37.889494+00	
00000000-0000-0000-0000-000000000000	b0f2421c-2738-4567-a7e2-70e892d98cf2	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-22 18:37:03.397876+00	
00000000-0000-0000-0000-000000000000	19702bb7-324b-431f-824c-ade309a275bf	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev_admn@mailinator.com","user_id":"da960624-8ece-41eb-bb7f-a01ff1b17c56","user_phone":""}}	2025-07-22 18:37:56.380615+00	
00000000-0000-0000-0000-000000000000	3247324c-a865-4a42-8393-2e62e0ce6f1c	{"action":"user_recovery_requested","actor_id":"da960624-8ece-41eb-bb7f-a01ff1b17c56","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"user"}	2025-07-22 18:38:10.441021+00	
00000000-0000-0000-0000-000000000000	5df78a08-b6a6-4908-8a8c-58dd4586951c	{"action":"login","actor_id":"da960624-8ece-41eb-bb7f-a01ff1b17c56","actor_username":"dev_admn@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-22 18:38:31.093125+00	
00000000-0000-0000-0000-000000000000	22bc58ac-dd50-44c3-a027-972c0c6a90b4	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-24 15:57:19.768863+00	
00000000-0000-0000-0000-000000000000	b6c96ef1-3831-4ee2-bfa4-d532640d8627	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 15:57:36.191701+00	
00000000-0000-0000-0000-000000000000	c86a9339-b897-4ed7-9332-e60d2316ab16	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 13:48:14.567516+00	
00000000-0000-0000-0000-000000000000	1be4f45e-8150-4f05-b35c-0f3a86850a71	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 13:48:14.56963+00	
00000000-0000-0000-0000-000000000000	f45d5151-b4b8-408a-9809-ca59f1856d6b	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 17:11:57.379866+00	
00000000-0000-0000-0000-000000000000	537f424a-f00c-4f4e-a953-3076ea231aed	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 17:11:57.384638+00	
00000000-0000-0000-0000-000000000000	92bae1e6-f58d-4989-b8ff-1518ae8a8bae	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-22 19:27:54.490547+00	
00000000-0000-0000-0000-000000000000	d2eb0154-2301-4c81-8240-a236717994b4	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 16:52:45.286414+00	
00000000-0000-0000-0000-000000000000	1cca7fe7-9072-456e-9886-b71dbdfc749a	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 14:58:30.239644+00	
00000000-0000-0000-0000-000000000000	56b1b106-033e-40da-9d9e-20dc504f5820	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 14:58:30.241226+00	
00000000-0000-0000-0000-000000000000	17e6b3ac-c562-4553-9b7a-570389f910c8	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 17:39:43.936389+00	
00000000-0000-0000-0000-000000000000	a07ed4c3-2769-475b-9de5-5dfb4c7f7e22	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 17:39:43.94177+00	
00000000-0000-0000-0000-000000000000	cc095bc7-6144-4a0b-b874-cfb600168109	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-29 17:39:55.275242+00	
00000000-0000-0000-0000-000000000000	8bc4d8ac-b935-4e45-8ba5-779455e12d92	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 20:44:15.964103+00	
00000000-0000-0000-0000-000000000000	a64df97b-f971-4c03-ac4f-2dff37bebaf4	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 20:44:15.97119+00	
00000000-0000-0000-0000-000000000000	9bfea25b-a926-46e8-89c9-896ff5aeec4a	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 20:44:33.933854+00	
00000000-0000-0000-0000-000000000000	2388f77a-ebea-4fdb-b240-54d70aedcf85	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 20:44:33.934451+00	
00000000-0000-0000-0000-000000000000	0895849a-a7be-46ab-add2-c94652bb939d	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 16:58:18.585025+00	
00000000-0000-0000-0000-000000000000	ab474ae0-7d54-45ec-8ef6-698d67dd5a5c	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 16:58:18.588174+00	
00000000-0000-0000-0000-000000000000	85a74217-cf6a-4677-b1be-1adcd26f4362	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 17:03:24.78725+00	
00000000-0000-0000-0000-000000000000	5cec88db-65d1-4f3a-bc9c-1e630011ac8f	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 17:03:24.788987+00	
00000000-0000-0000-0000-000000000000	15e5af13-c20a-4b47-8fe5-7f773f843e83	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 17:49:49.835258+00	
00000000-0000-0000-0000-000000000000	ea022e1e-b5a4-4ce9-8046-b9df26819840	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 17:50:27.650847+00	
00000000-0000-0000-0000-000000000000	da28a8ac-a7b4-4ff5-93a0-071c39799cce	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 21:42:47.588601+00	
00000000-0000-0000-0000-000000000000	ff87e16f-ca6b-478d-9cd8-2e5f22601600	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 21:42:47.594504+00	
00000000-0000-0000-0000-000000000000	3b1eb8a7-1135-4ba6-87ff-ace135e4d91b	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 21:43:40.316945+00	
00000000-0000-0000-0000-000000000000	fd903f5e-1aff-46d7-a84e-f2c07334608f	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 21:43:40.320209+00	
00000000-0000-0000-0000-000000000000	23eb03a0-29e4-4b02-a4bf-934e77bd5afd	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-24 17:18:08.141689+00	
00000000-0000-0000-0000-000000000000	0834cdec-fcb8-48b0-a7b9-8b3832ba4355	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 17:18:25.662355+00	
00000000-0000-0000-0000-000000000000	267722e8-30a4-4344-9fe3-8a8149aa380f	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 18:28:13.026277+00	
00000000-0000-0000-0000-000000000000	f0e19107-657f-4a30-bdb0-9f69e00f8765	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-26 18:28:13.030735+00	
00000000-0000-0000-0000-000000000000	da02be4d-bbfb-4520-885e-012021cdf9c2	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-29 18:16:42.047009+00	
00000000-0000-0000-0000-000000000000	1bbcd505-ed7a-4b0a-849f-477fa9c8e1a8	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-23 10:36:03.411696+00	
00000000-0000-0000-0000-000000000000	2e5ebc4f-fb34-4d2a-bf85-a27298c37e0b	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 18:16:58.459288+00	
00000000-0000-0000-0000-000000000000	a330b55e-abbd-415f-a232-1058fea837ad	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 18:16:58.46415+00	
00000000-0000-0000-0000-000000000000	3e5c16d1-6aa1-4d6d-8e65-ed14f0ed289c	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-26 20:46:31.559988+00	
00000000-0000-0000-0000-000000000000	b56adef7-cd7f-4506-b1ed-8d457e94c8f3	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-29 18:26:36.22445+00	
00000000-0000-0000-0000-000000000000	b33746b5-86ef-472b-bed4-5f7c082ad0c2	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-23 10:53:39.318149+00	
00000000-0000-0000-0000-000000000000	203ba0f7-26ae-42d9-8eff-2a15c9222822	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 19:11:01.850422+00	
00000000-0000-0000-0000-000000000000	993a0576-35a4-4594-a1ff-8ca0f39b5acf	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 08:32:57.330931+00	
00000000-0000-0000-0000-000000000000	9f881b51-a848-469b-96dd-b786089dddc7	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 08:32:57.338028+00	
00000000-0000-0000-0000-000000000000	4f9c6f48-0a96-4817-b6ae-493c57620682	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 12:15:22.374239+00	
00000000-0000-0000-0000-000000000000	21f68784-5d4e-48e5-a618-b8e824bf4570	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 12:15:22.37893+00	
00000000-0000-0000-0000-000000000000	4a219a2b-7c0c-4efc-aab9-69c1ed3a9770	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 19:17:55.375411+00	
00000000-0000-0000-0000-000000000000	d83dc8af-71c9-4ea5-b5fc-bdb73842ce5b	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 19:17:55.37819+00	
00000000-0000-0000-0000-000000000000	acaa5db8-5e20-43cd-a360-2e4c13d4d021	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-27 09:07:21.931753+00	
00000000-0000-0000-0000-000000000000	45c3bcf0-895b-4647-a77d-a419fd0117b9	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 15:26:11.656128+00	
00000000-0000-0000-0000-000000000000	e5a0e181-3a60-4988-9df4-d91c97c44e97	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 15:26:11.659873+00	
00000000-0000-0000-0000-000000000000	d685b426-5405-4213-9255-6e099d005a4a	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 19:42:01.710039+00	
00000000-0000-0000-0000-000000000000	bafefe85-32e2-4b80-a3c6-791fd182550f	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-27 09:25:06.593227+00	
00000000-0000-0000-0000-000000000000	fe1edc9d-6545-4246-acef-db9b952c6188	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 15:35:06.51563+00	
00000000-0000-0000-0000-000000000000	465210d6-d1c4-4fb0-9d51-c9adcefaf594	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 15:35:06.519023+00	
00000000-0000-0000-0000-000000000000	7df0709c-45d1-4770-9fbd-113b014b9a21	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-24 19:44:15.725039+00	
00000000-0000-0000-0000-000000000000	517462d8-cad7-4964-8b31-f51af95d3b86	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-27 09:27:13.424902+00	
00000000-0000-0000-0000-000000000000	0afc6e1d-76b0-438f-882a-2113caab876d	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-23 15:37:42.192724+00	
00000000-0000-0000-0000-000000000000	20c1c0a1-b0cc-4608-bd1c-b0cbcb90fdb9	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-23 15:38:35.63118+00	
00000000-0000-0000-0000-000000000000	a9000bac-72cf-413c-b90a-48bb4708a776	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-23 15:39:01.684991+00	
00000000-0000-0000-0000-000000000000	4be73cc8-fcfe-4c15-b85e-1d29a2fd2172	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-23 15:39:04.942092+00	
00000000-0000-0000-0000-000000000000	7382b2a9-a7a9-40f8-ac41-33d2920f556c	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-23 15:39:34.258717+00	
00000000-0000-0000-0000-000000000000	0845a3d7-b11a-4283-93fe-3704afd4fd66	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-23 15:39:44.517857+00	
00000000-0000-0000-0000-000000000000	cfa1b4db-5458-4e55-abcf-e9a96c40848d	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 15:15:07.663391+00	
00000000-0000-0000-0000-000000000000	2b3c6b36-a797-4a30-aee6-9c0d21611bb1	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 09:34:48.319666+00	
00000000-0000-0000-0000-000000000000	b339a217-aac2-41ee-aff1-8cdd275257a3	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 09:34:48.324571+00	
00000000-0000-0000-0000-000000000000	783eb79d-81cb-4632-810b-5a2d546f2e97	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 16:43:14.223775+00	
00000000-0000-0000-0000-000000000000	204d4bf6-0673-4bdc-a876-b4174adc6704	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 16:43:14.227497+00	
00000000-0000-0000-0000-000000000000	00896c20-b18e-4559-a98a-0ed0e3abd3e4	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 15:48:52.550452+00	
00000000-0000-0000-0000-000000000000	a8dbade2-71fe-4f8f-8a7c-7f0e408ffe0b	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-25 15:49:15.730617+00	
00000000-0000-0000-0000-000000000000	14166771-9645-445e-b771-8bd306e2a72f	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 15:49:28.107553+00	
00000000-0000-0000-0000-000000000000	ef3bccce-db85-435e-a0aa-cb7a2b4e45d9	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 15:52:25.706029+00	
00000000-0000-0000-0000-000000000000	052a7871-6db1-4e92-8cc6-cf4c475ec1a6	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 10:27:47.487535+00	
00000000-0000-0000-0000-000000000000	ee35b56a-51ec-4022-ad03-9dc3a141a17d	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 10:27:47.491917+00	
00000000-0000-0000-0000-000000000000	2363f7df-acc0-4e93-b7c5-67361822c187	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 07:35:03.190902+00	
00000000-0000-0000-0000-000000000000	4224a1a9-3129-448f-aea1-244f2cdfe71c	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 07:35:27.051544+00	
00000000-0000-0000-0000-000000000000	630217d9-9c4a-47ae-a8bf-06e3d3f32da7	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-25 16:29:23.552758+00	
00000000-0000-0000-0000-000000000000	ca29831c-d5c1-4c3a-a741-84fc13c4ac41	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 16:29:33.601492+00	
00000000-0000-0000-0000-000000000000	f6af4c68-3ba3-4e7b-930e-9e45e10da159	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-25 16:31:06.220195+00	
00000000-0000-0000-0000-000000000000	5ad64195-da05-464f-96ad-0385f0fe8a74	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 16:32:02.639007+00	
00000000-0000-0000-0000-000000000000	35a97314-bff1-4333-a01c-f5da075bee28	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 10:34:21.86502+00	
00000000-0000-0000-0000-000000000000	06b42fc3-76f4-492e-ae1e-b547a8f06e4d	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 10:34:21.869151+00	
00000000-0000-0000-0000-000000000000	f9ff966d-35df-4af8-852b-f203c21fd62d	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-24 07:38:59.984123+00	
00000000-0000-0000-0000-000000000000	b318d9dd-d011-4d21-b34f-e6c63f00637f	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 16:48:33.053276+00	
00000000-0000-0000-0000-000000000000	35475584-9d85-4d12-b740-d34cee27263a	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 16:48:33.056722+00	
00000000-0000-0000-0000-000000000000	42293268-564e-4de6-aa4e-0717b265fe18	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-27 11:21:49.523488+00	
00000000-0000-0000-0000-000000000000	a16d6c07-6270-43ac-867b-0dc3bb11ce93	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-27 11:21:58.435068+00	
00000000-0000-0000-0000-000000000000	b93a29ca-3609-4a26-8262-09ef3db6ecd3	{"action":"user_confirmation_requested","actor_id":"117827b6-d850-4e43-8d58-088af26d5340","actor_username":"hassan-bb-user-two@mailinator.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-07-24 07:42:17.555571+00	
00000000-0000-0000-0000-000000000000	874db7ac-8feb-4278-b05c-af1b0bb269ad	{"action":"user_signedup","actor_id":"117827b6-d850-4e43-8d58-088af26d5340","actor_username":"hassan-bb-user-two@mailinator.com","actor_via_sso":false,"log_type":"team"}	2025-07-24 07:42:57.248602+00	
00000000-0000-0000-0000-000000000000	95490d92-5318-40b0-a451-80fe7cca11b8	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 17:31:09.017509+00	
00000000-0000-0000-0000-000000000000	9ff50c4d-947e-42a6-9dda-4cafd5ebf739	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 17:31:09.020804+00	
00000000-0000-0000-0000-000000000000	a761576a-b951-4c71-a928-4c377cf8756d	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 11:39:48.651491+00	
00000000-0000-0000-0000-000000000000	35bfdc57-ac22-49bf-90ec-85bf5d3983d3	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 11:39:48.654217+00	
00000000-0000-0000-0000-000000000000	4282f857-dc28-433d-81e8-822c43b782cb	{"action":"logout","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-24 07:52:41.973975+00	
00000000-0000-0000-0000-000000000000	87259947-331c-4742-aac5-e05433ab3137	{"action":"login","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 07:52:59.691592+00	
00000000-0000-0000-0000-000000000000	83c90fab-5265-40d4-8acc-95dfbe482c35	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-25 17:33:54.034468+00	
00000000-0000-0000-0000-000000000000	e6c22bab-1fef-4461-ba08-0faef2711d9b	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 17:33:59.512199+00	
00000000-0000-0000-0000-000000000000	06d7e3eb-ee0e-4379-b7cc-b4d520f9d55e	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-27 16:45:55.871719+00	
00000000-0000-0000-0000-000000000000	7d6790fa-39f7-4efd-8fd6-f1abd03e021f	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 08:59:05.957697+00	
00000000-0000-0000-0000-000000000000	57918a54-8b36-499c-a609-0e552224fc95	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 08:59:05.964635+00	
00000000-0000-0000-0000-000000000000	2336f63b-10e3-4a5f-8c37-05d57be75b08	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 17:59:26.61173+00	
00000000-0000-0000-0000-000000000000	80fda2e5-3be5-499e-ac46-2f2394459843	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 17:59:26.613879+00	
00000000-0000-0000-0000-000000000000	da6e5b41-2f61-4c4d-b1a8-ab9b3d86e3e4	{"action":"logout","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account"}	2025-07-25 18:00:27.503786+00	
00000000-0000-0000-0000-000000000000	3b87ab14-8b52-4ab2-8d2d-f8cfa6a3c1a8	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-25 18:00:49.450403+00	
00000000-0000-0000-0000-000000000000	a1c5d049-e67d-446a-aa87-11f5a4363504	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:55:09.933948+00	
00000000-0000-0000-0000-000000000000	d9620906-e5d7-4d3f-9cf4-c6ab6675e85b	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:55:09.93607+00	
00000000-0000-0000-0000-000000000000	774441b9-8955-4a8a-9cce-5806d90d132c	{"action":"token_refreshed","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:55:28.579087+00	
00000000-0000-0000-0000-000000000000	f4a50523-8cda-4324-a9d6-0fc74f651181	{"action":"token_revoked","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-27 16:55:28.579632+00	
00000000-0000-0000-0000-000000000000	dc1f3170-5cb4-4d2b-a8ab-0aec85a944f8	{"action":"login","actor_id":"e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d","actor_username":"dev_user@mailinator.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-24 13:29:28.601908+00	
00000000-0000-0000-0000-000000000000	9c474712-c0ae-45b7-913f-9c37374a823a	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 18:58:37.596621+00	
00000000-0000-0000-0000-000000000000	579a6d5a-7433-4676-a33e-07e76032f485	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 18:58:37.600974+00	
00000000-0000-0000-0000-000000000000	fac8b5fe-d45e-410a-8f60-aab847823978	{"action":"token_refreshed","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 13:25:50.437148+00	
00000000-0000-0000-0000-000000000000	c66dc968-c5fd-49bc-95ca-4535d456f82a	{"action":"token_revoked","actor_id":"5367e45d-636a-4c1d-a0f4-e1f9fddba3c6","actor_username":"dev_accountant@mailinator.com","actor_via_sso":false,"log_type":"token"}	2025-07-29 13:25:50.451172+00	
00000000-0000-0000-0000-000000000000	67044c59-1bdb-49a5-8e80-e283e6d547eb	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"talha3@mailinator.com","user_id":"d3b4681d-67f5-4def-9cb2-279572782b9a","user_phone":""}}	2025-07-22 18:29:07.6898+00	
00000000-0000-0000-0000-000000000000	5148c3f1-2e16-4cdc-92fe-6f95e6461bd6	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abc@mailinator.com","user_id":"f733c90a-e112-40ef-844b-e7af70934d15","user_phone":""}}	2025-07-22 18:29:07.699947+00	
00000000-0000-0000-0000-000000000000	1cb5fc32-120b-4a30-8c51-c1d4ff85646e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-bb-4@mailinator.com","user_id":"3430cbee-6c41-4668-9c8d-bbd8d61a6d10","user_phone":""}}	2025-07-22 18:29:07.706398+00	
00000000-0000-0000-0000-000000000000	b12fb982-0785-4233-8599-a070114fe940	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hassan-betterbook-3@mailinator.com","user_id":"47592c54-c10e-4ba2-8ae6-81df7e277b81","user_phone":""}}	2025-07-22 18:29:07.73698+00	
00000000-0000-0000-0000-000000000000	a73310e8-11f8-4b2d-b822-d1af9684b917	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pakistan2@mailinator.com","user_id":"f36a75dc-24e8-4740-a4e5-de37a39adbb5","user_phone":""}}	2025-07-22 18:29:07.744132+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	{"sub": "e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d", "role": "USER", "email": "dev_user@mailinator.com", "email_verified": true, "phone_verified": false}	email	2025-07-22 18:32:45.486786+00	2025-07-22 18:32:45.486851+00	2025-07-22 18:32:45.486851+00	a10e23cc-fd89-4155-80cc-6223e67821c6
5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	{"sub": "5367e45d-636a-4c1d-a0f4-e1f9fddba3c6", "email": "dev_accountant@mailinator.com", "email_verified": false, "phone_verified": false}	email	2025-07-22 18:35:40.443249+00	2025-07-22 18:35:40.443303+00	2025-07-22 18:35:40.443303+00	2772b7c4-3311-4829-8a4b-affb8dbecfeb
da960624-8ece-41eb-bb7f-a01ff1b17c56	da960624-8ece-41eb-bb7f-a01ff1b17c56	{"sub": "da960624-8ece-41eb-bb7f-a01ff1b17c56", "email": "dev_admn@mailinator.com", "email_verified": false, "phone_verified": false}	email	2025-07-22 18:37:56.379119+00	2025-07-22 18:37:56.379172+00	2025-07-22 18:37:56.379172+00	422c803f-83fc-4786-80f3-4277760c610d
117827b6-d850-4e43-8d58-088af26d5340	117827b6-d850-4e43-8d58-088af26d5340	{"sub": "117827b6-d850-4e43-8d58-088af26d5340", "role": "USER", "email": "hassan-bb-user-two@mailinator.com", "email_verified": true, "phone_verified": false}	email	2025-07-24 07:42:17.548013+00	2025-07-24 07:42:17.548061+00	2025-07-24 07:42:17.548061+00	9c8d7ed3-96c5-4d14-908e-2b3697348738
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
e4913bb0-0ab6-4246-9d42-922b2471c146	2025-07-22 18:38:31.098383+00	2025-07-22 18:38:31.098383+00	otp	19c9943b-4b47-4c23-bd35-15f63da1c3f6
52c159ad-77c1-4a46-9302-e4f272786b3a	2025-07-24 07:42:57.261069+00	2025-07-24 07:42:57.261069+00	otp	f04df0c3-dce3-44ba-bfde-4d5aa08024a7
c4cb944f-9a5b-4a50-8c1c-498a4d8d6e77	2025-07-27 11:21:58.443484+00	2025-07-27 11:21:58.443484+00	password	52cfd872-24b9-4d27-9e4b-6b4102f480ff
0bc522aa-9ac6-46bd-b7e4-8bd2a213870c	2025-07-27 16:45:55.919088+00	2025-07-27 16:45:55.919088+00	password	5890eafe-3f4f-435a-b695-e8aa8e390794
5ba2540d-00f9-4e84-837a-420cf0c259c5	2025-07-29 18:26:36.233752+00	2025-07-29 18:26:36.233752+00	password	4baa94d0-d9d5-4f21-a59a-0bf99062d4d8
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	550	5yjozh4dyubu	da960624-8ece-41eb-bb7f-a01ff1b17c56	f	2025-07-22 18:38:31.097253+00	2025-07-22 18:38:31.097253+00	\N	e4913bb0-0ab6-4246-9d42-922b2471c146
00000000-0000-0000-0000-000000000000	567	cutqsfb2wx6k	117827b6-d850-4e43-8d58-088af26d5340	f	2025-07-24 07:42:57.257672+00	2025-07-24 07:42:57.257672+00	\N	52c159ad-77c1-4a46-9302-e4f272786b3a
00000000-0000-0000-0000-000000000000	610	z5fms4acte6p	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	f	2025-07-27 16:45:55.89678+00	2025-07-27 16:45:55.89678+00	\N	0bc522aa-9ac6-46bd-b7e4-8bd2a213870c
00000000-0000-0000-0000-000000000000	608	pgg6bznrntiz	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	t	2025-07-27 11:21:58.440538+00	2025-07-27 16:55:28.580116+00	\N	c4cb944f-9a5b-4a50-8c1c-498a4d8d6e77
00000000-0000-0000-0000-000000000000	612	o5efqcw2m6ir	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	t	2025-07-27 16:55:28.580432+00	2025-07-29 15:49:42.436524+00	pgg6bznrntiz	c4cb944f-9a5b-4a50-8c1c-498a4d8d6e77
00000000-0000-0000-0000-000000000000	615	cmj5dblzkrum	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	f	2025-07-29 15:49:42.43849+00	2025-07-29 15:49:42.43849+00	o5efqcw2m6ir	c4cb944f-9a5b-4a50-8c1c-498a4d8d6e77
00000000-0000-0000-0000-000000000000	621	yuugv33r6hoe	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	f	2025-07-29 18:26:36.23012+00	2025-07-29 18:26:36.23012+00	\N	5ba2540d-00f9-4e84-837a-420cf0c259c5
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
e4913bb0-0ab6-4246-9d42-922b2471c146	da960624-8ece-41eb-bb7f-a01ff1b17c56	2025-07-22 18:38:31.095737+00	2025-07-22 18:38:31.095737+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	58.65.222.47	\N
52c159ad-77c1-4a46-9302-e4f272786b3a	117827b6-d850-4e43-8d58-088af26d5340	2025-07-24 07:42:57.254229+00	2025-07-24 07:42:57.254229+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2.196.171.237	\N
c4cb944f-9a5b-4a50-8c1c-498a4d8d6e77	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	2025-07-27 11:21:58.437727+00	2025-07-29 15:49:42.442041+00	\N	aal1	\N	2025-07-29 15:49:42.441974	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	58.65.222.47	\N
5ba2540d-00f9-4e84-837a-420cf0c259c5	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	2025-07-29 18:26:36.228151+00	2025-07-29 18:26:36.228151+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	39.37.183.145	\N
0bc522aa-9ac6-46bd-b7e4-8bd2a213870c	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	2025-07-27 16:45:55.885444+00	2025-07-27 16:45:55.885444+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	104.28.209.178	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	da960624-8ece-41eb-bb7f-a01ff1b17c56	authenticated	authenticated	dev_admn@mailinator.com	$2a$10$tynemdG7gYDOBHGpSt5JA.QZLSluiYoXm1fVlmVQ.KMo9MyfMFP5O	2025-07-22 18:37:56.382906+00	\N		\N		2025-07-22 18:38:10.441543+00			\N	2025-07-22 18:38:31.095667+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-07-22 18:37:56.378037+00	2025-07-22 18:38:31.098102+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	authenticated	authenticated	dev_user@mailinator.com	$2a$10$SC5dOYfex.nWl0cyafezlu.UqHB.BsW/YDyPhEUFEUW2zY/tiAxca	2025-07-22 18:33:05.573626+00	\N		2025-07-22 18:32:45.491328+00		\N			\N	2025-07-27 16:45:55.884743+00	{"provider": "email", "providers": ["email"]}	{"sub": "e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d", "role": "USER", "email": "dev_user@mailinator.com", "email_verified": true, "phone_verified": false}	\N	2025-07-22 18:32:45.47571+00	2025-07-29 15:49:42.440153+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	117827b6-d850-4e43-8d58-088af26d5340	authenticated	authenticated	hassan-bb-user-two@mailinator.com	$2a$10$k4P27YLjBbM9CMLJ/zWBHutb6lRnqihU1nTuqKm9y4LeEMt5hzQY6	2025-07-24 07:42:57.249899+00	\N		2025-07-24 07:42:17.562812+00		\N			\N	2025-07-24 07:42:57.254159+00	{"provider": "email", "providers": ["email"]}	{"sub": "117827b6-d850-4e43-8d58-088af26d5340", "role": "USER", "email": "hassan-bb-user-two@mailinator.com", "email_verified": true, "phone_verified": false}	\N	2025-07-24 07:42:17.534936+00	2025-07-24 07:42:57.260667+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	authenticated	authenticated	dev_accountant@mailinator.com	$2a$10$zRRQW7hX9kxw15.78u2BQ.vQlCmxlJcQORxu4ztX1oCnD2CM1pPLa	2025-07-22 18:35:40.44563+00	\N		\N		2025-07-22 18:36:37.891288+00			\N	2025-07-29 18:26:36.228069+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-07-22 18:35:40.441816+00	2025-07-29 18:26:36.233176+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: accountants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accountants (id, user_id, full_name, is_active) FROM stdin;
5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	Dev Accountant	t
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, company_id, actor_id, activity, details, created_at) FROM stdin;
2	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	USER_LOGIN	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T09:07:22.833Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "login_method": "email_password"}	2025-07-27 09:07:23.464705+00
3	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	USER_LOGIN	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T09:27:14.189Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "login_method": "email_password"}	2025-07-27 09:27:14.985182+00
4	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	DOCUMENT_UPLOADED	{"filename": "ShahidMehmood_NodeJS.pdf", "document_id": "bank_statements/9aofcadm6hq-1753612083864.pdf", "document_type": "BANK_STATEMENT"}	2025-07-27 10:28:08.925934+00
5	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	USER_LOGIN	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T11:21:59.111Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "login_method": "email_password"}	2025-07-27 11:21:59.43441+00
6	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	DOCUMENT_UPLOADED	{"email": "dev_user@mailinator.com", "filename": "samary report.pdf", "timestamp": "2025-07-27T11:40:19.172Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "document_id": "bank_statements/2c80ee8m4e6-1753616415665.pdf", "login_method": "document_upload", "document_type": "BANK_STATEMENT"}	2025-07-27 11:40:19.710783+00
7	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T11:40:58.649Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 11:40:58.909924+00
8	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T11:40:58.923Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 11:40:59.18381+00
9	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	USER_LOGIN	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T16:45:56.961Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "login_method": "email_password"}	2025-07-27 16:46:00.797004+00
10	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T16:46:27.298Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 16:46:30.142618+00
11	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T16:46:28.835Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 16:46:32.479378+00
12	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T16:46:53.457Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 16:46:56.000196+00
13	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T16:46:54.547Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 16:46:57.095395+00
14	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T16:55:37.945Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 16:55:39.10873+00
15	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T16:55:37.491Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 16:55:39.332734+00
16	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T17:23:43.248Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 17:23:46.183128+00
17	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	REPORT_GENERATED	{"email": "dev_user@mailinator.com", "timestamp": "2025-07-27T17:23:45.063Z", "company_id": "17a0831b-6d4d-40c7-aeb0-a40d7cd475cd", "net_profit": 0, "period_end": "2025-06-29", "report_type": "Profit & Loss Statement", "login_method": "report_generation", "period_start": "2025-05-31", "total_revenue": 0, "total_expenses": 0}	2025-07-27 17:23:46.939237+00
18	\N	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	USER_LOGIN	{"email": "dev_accountant@mailinator.com", "timestamp": "2025-07-29T14:14:50.394Z", "company_id": null, "login_method": "email_password"}	2025-07-29 14:14:50.631461+00
19	\N	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	USER_LOGIN	{"email": "dev_accountant@mailinator.com", "timestamp": "2025-07-29T17:49:50.559Z", "company_id": null, "login_method": "email_password"}	2025-07-29 17:49:50.785833+00
20	\N	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	USER_LOGIN	{"email": "dev_accountant@mailinator.com", "timestamp": "2025-07-29T17:50:27.922Z", "company_id": null, "login_method": "email_password"}	2025-07-29 17:50:30.092074+00
21	\N	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	USER_LOGIN	{"email": "dev_accountant@mailinator.com", "timestamp": "2025-07-29T18:26:36.846Z", "company_id": null, "login_method": "email_password"}	2025-07-29 18:26:36.993806+00
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, user_id, full_name, email, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coa_template; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coa_template (id, account_id, account_name, account_type, parent_id) FROM stdin;
1	1000	ASSETS	\N	\N
2	1100	Current Assets	\N	1
3	1110	Cash and Cash Equivalents	\N	2
4	1111	Business Operating Account	ASSET	3
5	1112	Business Savings Account	ASSET	3
6	1113	Payroll Account	ASSET	3
7	1114	Cash on Hand / Till	ASSET	3
8	1200	Accounts Receivable	\N	1
9	1210	Accounts Receivable	ASSET	8
10	1290	Allowance for Doubtful Accounts	ASSET	8
11	1400	Inventory	\N	1
12	1410	Inventory Asset	ASSET	11
13	1450	Prepaid Expenses	\N	1
14	1451	Prepaid Insurance	ASSET	13
15	1452	Prepaid Rent	ASSET	13
16	1500	Fixed Assets (Property, Plant & Equipment)	\N	1
17	1510	Computer & Office Equipment	ASSET	16
18	1515	Less: Acc. Depreciation - Computer & Office Equipment	ASSET	17
19	1520	Machinery & Equipment	ASSET	16
20	1525	Less: Acc. Depreciation - Machinery & Equipment	ASSET	19
21	1530	Furniture & Fixtures	ASSET	16
22	1535	Less: Acc. Depreciation - Furniture & Fixtures	ASSET	21
23	1540	Vehicles	ASSET	16
24	1545	Less: Acc. Depreciation - Vehicles	ASSET	23
25	2000	LIABILITIES	\N	\N
26	2100	Current Liabilities	\N	25
27	2110	Accounts Payable	LIABILITY	26
28	2120	Credit Card Payable	LIABILITY	26
29	2200	Accrued Expenses	LIABILITY	26
30	2300	Sales Tax Payable	LIABILITY	26
31	2400	Unearned / Deferred Revenue	LIABILITY	26
32	2450	Payroll Liabilities	\N	26
33	2451	Wages & Salaries Payable	LIABILITY	32
34	2452	Payroll Taxes Payable	LIABILITY	32
35	2500	Current Portion of Long-Term Debt	LIABILITY	26
36	2600	Long-Term Liabilities	\N	25
37	2610	Business Loan Payable	LIABILITY	36
38	3000	EQUITY	\N	\N
39	3100	Owner's Equity (Sole Prop./Single-Member LLC)	\N	38
40	3110	Owner's Contribution / Capital	EQUITY	39
41	3120	Owner's Draw	EQUITY	39
42	3200	Partner's Equity (Partnership/Multi-Member LLC)	\N	38
43	3210	Partner 1: Capital	EQUITY	42
44	3220	Partner 1: Draw	EQUITY	42
45	3300	Corporate Equity	\N	38
46	3310	Common Stock	EQUITY	45
47	3900	Retained Earnings	EQUITY	38
48	4000	REVENUE / INCOME	\N	\N
49	4100	Service Revenue	\N	48
50	4110	Consulting & Project Fees	REVENUE	49
51	4120	Retainer Income	REVENUE	49
52	4200	Sales Revenue	\N	48
53	4210	Product Sales	REVENUE	52
54	4220	Shipping & Handling Income	REVENUE	52
55	4900	Contra Revenue	\N	48
56	4910	Sales Returns & Allowances	CONTRA_REVENUE	55
57	4920	Sales Discounts	CONTRA_REVENUE	55
58	4950	Other Income	\N	48
59	4951	Interest Income	REVENUE	58
60	5000	COST OF GOODS SOLD (COGS)	\N	\N
61	5100	Cost of Goods Sold	COGS	60
62	5200	Purchases	COGS	60
63	5300	Freight-In / Shipping Costs	COGS	60
64	6000	OPERATING EXPENSES	\N	\N
65	6100	Payroll Expenses	\N	64
66	6110	Salaries & Wages	EXPENSE	65
67	6120	Contractor & Freelancer Payments	EXPENSE	65
68	6130	Payroll Taxes (Employer Portion)	EXPENSE	65
69	6140	Employee Benefits	EXPENSE	65
70	6200	Sales & Marketing	\N	64
71	6210	Advertising	EXPENSE	70
72	6220	Marketing & Promotion	EXPENSE	70
73	6230	Website & SEO	EXPENSE	70
74	6300	General & Administrative Expenses	\N	64
75	6310	Rent & Lease (Office/Store)	EXPENSE	74
76	6315	Home Office Expense	EXPENSE	74
77	6320	Utilities (Electricity, Water, Gas)	EXPENSE	74
78	6400	Software & Subscriptions	\N	64
79	6410	Accounting & Payroll Software	EXPENSE	78
80	6420	Productivity & Communication Software	EXPENSE	78
81	6430	Design & Creative Software	EXPENSE	78
82	6500	Professional Fees	\N	64
83	6510	Accounting Fees	EXPENSE	82
84	6520	Legal Fees	EXPENSE	82
85	6600	Insurance	\N	64
86	6610	General Liability Insurance	EXPENSE	85
87	6620	Professional Liability (E&O)	EXPENSE	85
88	6700	Bank & Processing Fees	\N	64
89	6710	Bank Service Charges	EXPENSE	88
90	6720	Credit Card Processing Fees	EXPENSE	88
91	6800	Office Supplies & Expenses	EXPENSE	64
92	6900	Dues & Subscriptions (Professional)	EXPENSE	64
93	7000	Other Expenses	\N	\N
94	7100	Repairs & Maintenance	EXPENSE	93
95	7200	Business Travel	EXPENSE	93
96	7210	Meals & Entertainment	EXPENSE	93
97	7300	Depreciation Expense	EXPENSE	93
98	7400	Interest Expense	EXPENSE	93
99	7500	Business Licenses & Permits	EXPENSE	93
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, user_id, assigned_accountant_id, name, type, is_active, created_at, account_balance, opening_balance, closing_balance, total_debit, total_credit, tax_id_number, filing_status, tax_year_end) FROM stdin;
821d371c-16ff-436c-8fbb-4c43aa23280e	117827b6-d850-4e43-8d58-088af26d5340	\N	Hassan BB Two	INDEPENDENT_WORKER	t	2025-07-24 07:44:23.325991+00	100000.00	100000.00	100000.00	0.00	0.00	561561515	SOLE_PROPRIETOR	2025-06-30
17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	Dev Company	PROFESSIONAL_SERVICES	t	2025-07-22 18:34:24.181025+00	1000.00	1000.00	1000.00	0.00	0.00	123-567-890	C_CORP	2025-07-21
\.


--
-- Data for Name: company_coa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_coa (id, account_id, account_name, account_type, parent_id, company_id, credit_balance, debit_balance, created_at, updated_at, template_id) FROM stdin;
3869	1000	ASSETS	\N	\N	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	1
3870	1100	Current Assets	\N	1	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	2
3871	1110	Cash and Cash Equivalents	\N	2	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	3
3872	1111	Business Operating Account	ASSET	3	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	4
3873	1112	Business Savings Account	ASSET	3	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	5
3874	1113	Payroll Account	ASSET	3	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	6
3875	1114	Cash on Hand / Till	ASSET	3	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	7
3876	1200	Accounts Receivable	\N	1	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	8
3877	1210	Accounts Receivable	ASSET	8	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	9
3878	1290	Allowance for Doubtful Accounts	ASSET	8	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	10
3879	1400	Inventory	\N	1	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	11
3880	1410	Inventory Asset	ASSET	11	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	12
3881	1450	Prepaid Expenses	\N	1	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	13
3882	1451	Prepaid Insurance	ASSET	13	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	14
3883	1452	Prepaid Rent	ASSET	13	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	15
3884	1500	Fixed Assets (Property, Plant & Equipment)	\N	1	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	16
3885	1510	Computer & Office Equipment	ASSET	16	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	17
3886	1515	Less: Acc. Depreciation - Computer & Office Equipment	ASSET	17	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	18
3887	1520	Machinery & Equipment	ASSET	16	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	19
3888	1525	Less: Acc. Depreciation - Machinery & Equipment	ASSET	19	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	20
3889	1530	Furniture & Fixtures	ASSET	16	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	21
3890	1535	Less: Acc. Depreciation - Furniture & Fixtures	ASSET	21	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	22
3891	1540	Vehicles	ASSET	16	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	23
3892	1545	Less: Acc. Depreciation - Vehicles	ASSET	23	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	24
3893	2000	LIABILITIES	\N	\N	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	25
3894	2100	Current Liabilities	\N	25	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	26
3895	2110	Accounts Payable	LIABILITY	26	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	27
3896	2120	Credit Card Payable	LIABILITY	26	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	28
3897	2200	Accrued Expenses	LIABILITY	26	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	29
3898	2300	Sales Tax Payable	LIABILITY	26	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	30
3899	2400	Unearned / Deferred Revenue	LIABILITY	26	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	31
3900	2450	Payroll Liabilities	\N	26	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	32
3901	2451	Wages & Salaries Payable	LIABILITY	32	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	33
3902	2452	Payroll Taxes Payable	LIABILITY	32	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	34
3903	2500	Current Portion of Long-Term Debt	LIABILITY	26	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	35
3904	2600	Long-Term Liabilities	\N	25	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	36
3905	2610	Business Loan Payable	LIABILITY	36	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	37
3906	3000	EQUITY	\N	\N	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	38
3907	3100	Owner's Equity (Sole Prop./Single-Member LLC)	\N	38	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	39
3908	3110	Owner's Contribution / Capital	EQUITY	39	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	40
3909	3120	Owner's Draw	EQUITY	39	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	41
3910	3200	Partner's Equity (Partnership/Multi-Member LLC)	\N	38	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	42
3911	3210	Partner 1: Capital	EQUITY	42	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	43
3912	3220	Partner 1: Draw	EQUITY	42	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	44
3913	3300	Corporate Equity	\N	38	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	45
3914	3310	Common Stock	EQUITY	45	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	46
3915	3900	Retained Earnings	EQUITY	38	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	47
3916	4000	REVENUE / INCOME	\N	\N	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	48
3917	4100	Service Revenue	\N	48	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	49
3918	4110	Consulting & Project Fees	REVENUE	49	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	50
3919	4120	Retainer Income	REVENUE	49	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	51
3920	4200	Sales Revenue	\N	48	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	52
3921	4210	Product Sales	REVENUE	52	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	53
3922	4220	Shipping & Handling Income	REVENUE	52	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	54
3923	4900	Contra Revenue	\N	48	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	55
3924	4910	Sales Returns & Allowances	CONTRA_REVENUE	55	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	56
3925	4920	Sales Discounts	CONTRA_REVENUE	55	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	57
3926	4950	Other Income	\N	48	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	58
3927	4951	Interest Income	REVENUE	58	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	59
3928	5000	COST OF GOODS SOLD (COGS)	\N	\N	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	60
3929	5100	Cost of Goods Sold	COGS	60	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	61
3930	5200	Purchases	COGS	60	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	62
3931	5300	Freight-In / Shipping Costs	COGS	60	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	63
3932	6000	OPERATING EXPENSES	\N	\N	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	64
3933	6100	Payroll Expenses	\N	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	65
3934	6110	Salaries & Wages	EXPENSE	65	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	66
3935	6120	Contractor & Freelancer Payments	EXPENSE	65	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	67
3936	6130	Payroll Taxes (Employer Portion)	EXPENSE	65	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	68
3937	6140	Employee Benefits	EXPENSE	65	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	69
3938	6200	Sales & Marketing	\N	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	70
3939	6210	Advertising	EXPENSE	70	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	71
3940	6220	Marketing & Promotion	EXPENSE	70	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	72
3941	6230	Website & SEO	EXPENSE	70	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	73
3942	6300	General & Administrative Expenses	\N	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	74
3943	6310	Rent & Lease (Office/Store)	EXPENSE	74	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	75
3944	6315	Home Office Expense	EXPENSE	74	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	76
3945	6320	Utilities (Electricity, Water, Gas)	EXPENSE	74	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	77
3946	6400	Software & Subscriptions	\N	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	78
3947	6410	Accounting & Payroll Software	EXPENSE	78	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	79
3948	6420	Productivity & Communication Software	EXPENSE	78	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	80
3949	6430	Design & Creative Software	EXPENSE	78	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	81
3950	6500	Professional Fees	\N	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	82
3951	6510	Accounting Fees	EXPENSE	82	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	83
3952	6520	Legal Fees	EXPENSE	82	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	84
3953	6600	Insurance	\N	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	85
3954	6610	General Liability Insurance	EXPENSE	85	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	86
3955	6620	Professional Liability (E&O)	EXPENSE	85	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	87
3956	6700	Bank & Processing Fees	\N	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	88
3957	6710	Bank Service Charges	EXPENSE	88	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	89
3958	6720	Credit Card Processing Fees	EXPENSE	88	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	90
3959	6800	Office Supplies & Expenses	EXPENSE	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	91
3960	6900	Dues & Subscriptions (Professional)	EXPENSE	64	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	92
3961	7000	Other Expenses	\N	\N	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	93
3962	7100	Repairs & Maintenance	EXPENSE	93	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	94
3963	7200	Business Travel	EXPENSE	93	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	95
3964	7210	Meals & Entertainment	EXPENSE	93	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	96
3965	7300	Depreciation Expense	EXPENSE	93	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	97
3966	7400	Interest Expense	EXPENSE	93	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	98
3967	7500	Business Licenses & Permits	EXPENSE	93	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	0	0	2025-07-22 18:34:25.547434+00	2025-07-22 18:34:25.547434+00	99
3968	1000	ASSETS	\N	\N	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	1
3969	1100	Current Assets	\N	1	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	2
3970	1110	Cash and Cash Equivalents	\N	2	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	3
3971	1111	Business Operating Account	ASSET	3	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	4
3972	1112	Business Savings Account	ASSET	3	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	5
3973	1113	Payroll Account	ASSET	3	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	6
3974	1114	Cash on Hand / Till	ASSET	3	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	7
3975	1200	Accounts Receivable	\N	1	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	8
3976	1210	Accounts Receivable	ASSET	8	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	9
3977	1290	Allowance for Doubtful Accounts	ASSET	8	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	10
3978	1400	Inventory	\N	1	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	11
3979	1410	Inventory Asset	ASSET	11	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	12
3980	1450	Prepaid Expenses	\N	1	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	13
3981	1451	Prepaid Insurance	ASSET	13	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	14
3982	1452	Prepaid Rent	ASSET	13	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	15
3983	1500	Fixed Assets (Property, Plant & Equipment)	\N	1	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	16
3984	1510	Computer & Office Equipment	ASSET	16	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	17
3985	1515	Less: Acc. Depreciation - Computer & Office Equipment	ASSET	17	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	18
3986	1520	Machinery & Equipment	ASSET	16	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	19
3987	1525	Less: Acc. Depreciation - Machinery & Equipment	ASSET	19	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	20
3988	1530	Furniture & Fixtures	ASSET	16	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	21
3989	1535	Less: Acc. Depreciation - Furniture & Fixtures	ASSET	21	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	22
3990	1540	Vehicles	ASSET	16	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	23
3991	1545	Less: Acc. Depreciation - Vehicles	ASSET	23	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	24
3992	2000	LIABILITIES	\N	\N	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	25
3993	2100	Current Liabilities	\N	25	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	26
3994	2110	Accounts Payable	LIABILITY	26	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	27
3995	2120	Credit Card Payable	LIABILITY	26	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	28
3996	2200	Accrued Expenses	LIABILITY	26	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	29
3997	2300	Sales Tax Payable	LIABILITY	26	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	30
3998	2400	Unearned / Deferred Revenue	LIABILITY	26	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	31
3999	2450	Payroll Liabilities	\N	26	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	32
4000	2451	Wages & Salaries Payable	LIABILITY	32	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	33
4001	2452	Payroll Taxes Payable	LIABILITY	32	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	34
4002	2500	Current Portion of Long-Term Debt	LIABILITY	26	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	35
4003	2600	Long-Term Liabilities	\N	25	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	36
4004	2610	Business Loan Payable	LIABILITY	36	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	37
4005	3000	EQUITY	\N	\N	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	38
4006	3100	Owner's Equity (Sole Prop./Single-Member LLC)	\N	38	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	39
4007	3110	Owner's Contribution / Capital	EQUITY	39	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	40
4008	3120	Owner's Draw	EQUITY	39	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	41
4009	3200	Partner's Equity (Partnership/Multi-Member LLC)	\N	38	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	42
4010	3210	Partner 1: Capital	EQUITY	42	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	43
4011	3220	Partner 1: Draw	EQUITY	42	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	44
4012	3300	Corporate Equity	\N	38	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	45
4013	3310	Common Stock	EQUITY	45	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	46
4014	3900	Retained Earnings	EQUITY	38	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	47
4015	4000	REVENUE / INCOME	\N	\N	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	48
4016	4100	Service Revenue	\N	48	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	49
4017	4110	Consulting & Project Fees	REVENUE	49	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	50
4018	4120	Retainer Income	REVENUE	49	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	51
4019	4200	Sales Revenue	\N	48	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	52
4020	4210	Product Sales	REVENUE	52	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	53
4021	4220	Shipping & Handling Income	REVENUE	52	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	54
4022	4900	Contra Revenue	\N	48	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	55
4023	4910	Sales Returns & Allowances	CONTRA_REVENUE	55	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	56
4024	4920	Sales Discounts	CONTRA_REVENUE	55	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	57
4025	4950	Other Income	\N	48	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	58
4026	4951	Interest Income	REVENUE	58	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	59
4027	5000	COST OF GOODS SOLD (COGS)	\N	\N	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	60
4028	5100	Cost of Goods Sold	COGS	60	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	61
4029	5200	Purchases	COGS	60	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	62
4030	5300	Freight-In / Shipping Costs	COGS	60	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	63
4031	6000	OPERATING EXPENSES	\N	\N	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	64
4032	6100	Payroll Expenses	\N	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	65
4033	6110	Salaries & Wages	EXPENSE	65	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	66
4034	6120	Contractor & Freelancer Payments	EXPENSE	65	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	67
4035	6130	Payroll Taxes (Employer Portion)	EXPENSE	65	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	68
4036	6140	Employee Benefits	EXPENSE	65	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	69
4037	6200	Sales & Marketing	\N	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	70
4038	6210	Advertising	EXPENSE	70	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	71
4039	6220	Marketing & Promotion	EXPENSE	70	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	72
4040	6230	Website & SEO	EXPENSE	70	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	73
4041	6300	General & Administrative Expenses	\N	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	74
4042	6310	Rent & Lease (Office/Store)	EXPENSE	74	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	75
4043	6315	Home Office Expense	EXPENSE	74	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	76
4044	6320	Utilities (Electricity, Water, Gas)	EXPENSE	74	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	77
4045	6400	Software & Subscriptions	\N	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	78
4046	6410	Accounting & Payroll Software	EXPENSE	78	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	79
4047	6420	Productivity & Communication Software	EXPENSE	78	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	80
4048	6430	Design & Creative Software	EXPENSE	78	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	81
4049	6500	Professional Fees	\N	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	82
4050	6510	Accounting Fees	EXPENSE	82	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	83
4051	6520	Legal Fees	EXPENSE	82	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	84
4052	6600	Insurance	\N	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	85
4053	6610	General Liability Insurance	EXPENSE	85	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	86
4054	6620	Professional Liability (E&O)	EXPENSE	85	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	87
4055	6700	Bank & Processing Fees	\N	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	88
4056	6710	Bank Service Charges	EXPENSE	88	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	89
4057	6720	Credit Card Processing Fees	EXPENSE	88	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	90
4058	6800	Office Supplies & Expenses	EXPENSE	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	91
4059	6900	Dues & Subscriptions (Professional)	EXPENSE	64	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	92
4060	7000	Other Expenses	\N	\N	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	93
4061	7100	Repairs & Maintenance	EXPENSE	93	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	94
4062	7200	Business Travel	EXPENSE	93	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	95
4063	7210	Meals & Entertainment	EXPENSE	93	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	96
4064	7300	Depreciation Expense	EXPENSE	93	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	97
4065	7400	Interest Expense	EXPENSE	93	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	98
4066	7500	Business Licenses & Permits	EXPENSE	93	821d371c-16ff-436c-8fbb-4c43aa23280e	0	0	2025-07-24 07:44:24.089225+00	2025-07-24 07:44:24.089225+00	99
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, company_id, uploaded_by_user_id, file_path, original_filename, status, type, uploaded_at) FROM stdin;
ee27f36f-ad88-4d19-bb43-aac9a33d5f95	821d371c-16ff-436c-8fbb-4c43aa23280e	117827b6-d850-4e43-8d58-088af26d5340	bank_statements/8lqfmf30w4a-1753343384734.pdf	invoice flg.pdf	PENDING_REVIEW	BANK_STATEMENT	2025-07-24 07:49:46.148873+00
82d3e05d-50cd-4e42-9ee8-99ee0c5cc1f2	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	tax_documents/returns/z7mu348seo-1753344741849.pdf	card flg.pdf	COMPLETED	TAX_RETURN	2025-07-24 08:12:22.993732+00
e02a47f3-15a8-442f-b727-0d3e1a5b68dd	821d371c-16ff-436c-8fbb-4c43aa23280e	117827b6-d850-4e43-8d58-088af26d5340	invoices/h44ydiuozn7-1753344873747.png	meezan.png	PENDING_REVIEW	INVOICE	2025-07-24 08:14:35.589365+00
b87e0b53-79b0-4a47-9a84-e086495e749c	821d371c-16ff-436c-8fbb-4c43aa23280e	117827b6-d850-4e43-8d58-088af26d5340	invoices/jpb4lpg4lxr-1753344873747.png	urdu.png	PENDING_REVIEW	INVOICE	2025-07-24 08:14:35.589365+00
1350c4de-bb25-4b98-8c9d-b68a4190f8f5	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	bank_statements/qyypb2sgd5l-1753211961229.pdf	samary report.pdf	IN_PROGRESS	BANK_STATEMENT	2025-07-22 19:19:25.419488+00
c6e87e07-459d-428c-b5d3-3e7305431537	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	bank_statements/c38z66oma0i-1753376000317.pdf	samary report.pdf	USER_INPUT_NEEDED	BANK_STATEMENT	2025-07-24 16:53:24.370098+00
9c51b213-5abf-45fe-bed1-08a621e98193	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	bank_statements/9aofcadm6hq-1753612083864.pdf	ShahidMehmood_NodeJS.pdf	PENDING_REVIEW	BANK_STATEMENT	2025-07-27 10:28:07.727001+00
fc7f58e0-9c8c-49d5-8054-ef3f7c9cf208	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	bank_statements/2c80ee8m4e6-1753616415665.pdf	samary report.pdf	PENDING_REVIEW	BANK_STATEMENT	2025-07-27 11:40:19.009029+00
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entries (id, company_id, entry_date, description, created_by, source_document_id, is_adjusting_entry, created_at) FROM stdin;
a9661d5b-41f2-4c4d-9c69-616c1ebf17d3	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	2025-07-21	Opening Balance	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	\N	f	2025-07-22 18:34:26.182554+00
54abba35-61a5-4bc3-828f-ce32eb73c762	821d371c-16ff-436c-8fbb-4c43aa23280e	2025-07-01	Opening Balance	117827b6-d850-4e43-8d58-088af26d5340	\N	f	2025-07-24 07:44:24.677637+00
295a8cbc-4030-4191-a13b-a0bac07ccce3	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	2025-07-24	Journal entry for samary report.pdf	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	f	2025-07-24 16:48:24.202041+00
d46ec89e-4bf1-42b3-a5a4-24d615c653a6	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	2025-07-24	Journal entry for samary report.pdf	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	c6e87e07-459d-428c-b5d3-3e7305431537	f	2025-07-24 17:10:46.011225+00
\.


--
-- Data for Name: journal_entry_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entry_lines (id, journal_entry_id, account_id, type, amount) FROM stdin;
fc42c954-abb6-487a-bbe8-5a13190633ad	a9661d5b-41f2-4c4d-9c69-616c1ebf17d3	3871	DEBIT	1000.00
36a4a587-8f2a-4115-90da-a2d18e1c099c	54abba35-61a5-4bc3-828f-ce32eb73c762	3970	DEBIT	100000.00
60618ffa-9f0c-4637-8455-b45584edfc68	295a8cbc-4030-4191-a13b-a0bac07ccce3	3869	DEBIT	1000.00
d4c99a9f-a148-4b47-99cf-55314856b885	295a8cbc-4030-4191-a13b-a0bac07ccce3	3874	CREDIT	1000.00
7250c724-4a4c-472f-a571-95ff4e657c85	d46ec89e-4bf1-42b3-a5a4-24d615c653a6	3870	DEBIT	100.00
a8c124c5-b190-4f4b-b727-cfed978367a6	d46ec89e-4bf1-42b3-a5a4-24d615c653a6	3881	CREDIT	100.00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, company_id, sender_id, recipient_id, related_document_id, content, is_read, created_at, updated_at) FROM stdin;
aa3af35f-bae5-4ef7-932e-69d7b902dc0c	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	How are you ?	f	2025-07-22 20:50:38.681597+00	2025-07-22 20:57:17.671566+00
962bb50b-f0ad-4520-93f3-811805ed0784	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	Hi	f	2025-07-22 20:49:05.781209+00	2025-07-22 20:57:17.671566+00
c574d7b5-7aad-4b47-9484-f9d4e2e0a510	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	I am good	f	2025-07-22 21:15:58.269063+00	2025-07-22 21:15:58.269063+00
8b874e17-04ce-4d55-8a8f-e190045b4089	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	what about you ?	f	2025-07-22 21:18:51.145868+00	2025-07-22 21:18:51.145868+00
a22b316b-c95a-4033-8969-7b11effed1c8	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	Also good too	f	2025-07-22 21:39:28.852134+00	2025-07-22 21:41:20.792358+00
3b3746c6-633b-4caf-b52e-06d5687e4942	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	ok	f	2025-07-22 21:42:28.982765+00	2025-07-22 21:42:28.982765+00
40aaa8e5-2974-4a53-9b95-ae29f7f08cd2	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	Hi	f	2025-07-23 16:44:04.517955+00	2025-07-23 16:44:04.517955+00
92a870ab-6bde-468a-b941-3a9e1c810868	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	1350c4de-bb25-4b98-8c9d-b68a4190f8f5	HI	f	2025-07-23 16:49:24.661699+00	2025-07-23 16:49:24.661699+00
5dbe4dac-37e5-4b8c-aea8-176bba5e7d70	821d371c-16ff-436c-8fbb-4c43aa23280e	117827b6-d850-4e43-8d58-088af26d5340	117827b6-d850-4e43-8d58-088af26d5340	ee27f36f-ad88-4d19-bb43-aac9a33d5f95	This document only have 2 week bank statement	f	2025-07-24 07:50:40.157083+00	2025-07-24 07:50:40.157083+00
681d6941-1121-46c1-a513-ce8a0f1a267f	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	c6e87e07-459d-428c-b5d3-3e7305431537	Yes , it is valid document	f	2025-07-25 15:53:05.256304+00	2025-07-25 15:53:05.256304+00
aba8db77-fa38-4634-8c4a-e9d4da69cd5a	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	c6e87e07-459d-428c-b5d3-3e7305431537	Yes , it is valid document	f	2025-07-25 15:54:18.881583+00	2025-07-25 15:54:18.881583+00
b9238eb3-1876-46aa-b39c-63a8c6bda75a	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	c6e87e07-459d-428c-b5d3-3e7305431537	I want to ask, is this a valid document?	t	2025-07-25 15:51:39.415444+00	2025-07-25 16:06:26.237804+00
1344ff68-74a2-4adb-ac74-b981204875c4	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	c6e87e07-459d-428c-b5d3-3e7305431537	hlo	t	2025-07-25 15:31:53.858831+00	2025-07-25 16:07:26.148904+00
ba23efce-83f3-4418-b34a-6893dd6f73c4	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	c6e87e07-459d-428c-b5d3-3e7305431537	HI	t	2025-07-25 15:16:45.530634+00	2025-07-25 16:10:34.329057+00
225f835d-1b40-41ea-83f8-cb1608faef6d	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	c6e87e07-459d-428c-b5d3-3e7305431537	This is good document	f	2025-07-25 16:11:32.853296+00	2025-07-25 16:11:32.853296+00
05c55625-e457-45ff-9256-922c0ea5ee18	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	c6e87e07-459d-428c-b5d3-3e7305431537	Yes	f	2025-07-25 16:12:05.017398+00	2025-07-25 16:12:05.017398+00
378940ec-c8a8-48bd-920e-56cc2e1a9126	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	c6e87e07-459d-428c-b5d3-3e7305431537	yup	f	2025-07-25 16:16:59.378424+00	2025-07-25 16:16:59.378424+00
8508f79b-c641-4593-b789-41a649e11bb9	17a0831b-6d4d-40c7-aeb0-a40d7cd475cd	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	c6e87e07-459d-428c-b5d3-3e7305431537	Hi	f	2025-07-25 16:22:52.232558+00	2025-07-25 16:22:52.232558+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, full_name, avatar_url, is_active) FROM stdin;
117827b6-d850-4e43-8d58-088af26d5340			t
e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	Dev User		t
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-05-06 13:20:16
20211116045059	2025-05-06 13:20:19
20211116050929	2025-05-06 13:20:21
20211116051442	2025-05-06 13:20:23
20211116212300	2025-05-06 13:20:26
20211116213355	2025-05-06 13:20:28
20211116213934	2025-05-06 13:20:30
20211116214523	2025-05-06 13:20:33
20211122062447	2025-05-06 13:20:35
20211124070109	2025-05-06 13:20:37
20211202204204	2025-05-06 13:20:39
20211202204605	2025-05-06 13:20:41
20211210212804	2025-05-06 13:20:47
20211228014915	2025-05-06 13:20:49
20220107221237	2025-05-06 13:20:51
20220228202821	2025-05-06 13:20:53
20220312004840	2025-05-06 13:20:55
20220603231003	2025-05-06 13:20:58
20220603232444	2025-05-06 13:21:00
20220615214548	2025-05-06 13:21:03
20220712093339	2025-05-06 13:21:05
20220908172859	2025-05-06 13:21:07
20220916233421	2025-05-06 13:21:09
20230119133233	2025-05-06 13:21:11
20230128025114	2025-05-06 13:21:14
20230128025212	2025-05-06 13:21:16
20230227211149	2025-05-06 13:21:18
20230228184745	2025-05-06 13:21:20
20230308225145	2025-05-06 13:21:22
20230328144023	2025-05-06 13:21:24
20231018144023	2025-05-06 13:21:26
20231204144023	2025-05-06 13:21:29
20231204144024	2025-05-06 13:21:31
20231204144025	2025-05-06 13:21:33
20240108234812	2025-05-06 13:21:35
20240109165339	2025-05-06 13:21:37
20240227174441	2025-05-06 13:21:39
20240311171622	2025-05-06 13:21:40
20240321100241	2025-05-06 13:21:42
20240401105812	2025-05-06 13:21:45
20240418121054	2025-05-06 13:21:46
20240523004032	2025-05-06 13:21:49
20240618124746	2025-05-06 13:21:50
20240801235015	2025-05-06 13:21:51
20240805133720	2025-05-06 13:21:52
20240827160934	2025-05-06 13:21:53
20240919163303	2025-05-06 13:21:55
20240919163305	2025-05-06 13:21:56
20241019105805	2025-05-06 13:21:57
20241030150047	2025-05-06 13:22:01
20241108114728	2025-05-06 13:22:02
20241121104152	2025-05-06 13:22:03
20241130184212	2025-05-06 13:22:05
20241220035512	2025-05-06 13:22:06
20241220123912	2025-05-06 13:22:07
20241224161212	2025-05-06 13:22:09
20250107150512	2025-05-06 13:22:10
20250110162412	2025-05-06 13:22:12
20250123174212	2025-05-06 13:22:13
20250128220012	2025-05-06 13:22:14
20250506224012	2025-05-22 11:03:19
20250523164012	2025-06-27 16:16:16
20250714121412	2025-07-22 19:08:07
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
documents	documents	\N	2025-07-10 21:23:49.576907+00	2025-07-10 21:23:49.576907+00	f	f	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-05-06 13:20:13.892576
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-05-06 13:20:13.896813
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-05-06 13:20:13.899646
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-05-06 13:20:13.921973
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-05-06 13:20:13.945819
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-05-06 13:20:13.949842
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-05-06 13:20:13.953588
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-05-06 13:20:13.957535
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-05-06 13:20:13.960726
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-05-06 13:20:13.964464
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-05-06 13:20:13.968862
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-05-06 13:20:13.973482
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-05-06 13:20:13.978798
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-05-06 13:20:13.982312
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-05-06 13:20:13.986294
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-05-06 13:20:14.018237
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-05-06 13:20:14.021896
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-05-06 13:20:14.025022
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-05-06 13:20:14.028872
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-05-06 13:20:14.034061
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-05-06 13:20:14.037634
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-05-06 13:20:14.046885
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-05-06 13:20:14.075481
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-05-06 13:20:14.101976
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-05-06 13:20:14.105539
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-05-06 13:20:14.109167
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
9a333f64-a7d9-487b-8ebd-a60950551a14	documents	invoices/s7r5bvqppk-1752239424529.png	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-11 13:10:28.26084+00	2025-07-11 13:10:28.26084+00	2025-07-11 13:10:28.26084+00	{"eTag": "\\"faafd10e589bba28ac25ee97c4cfe079\\"", "size": 294760, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-11T13:10:29.000Z", "contentLength": 294760, "httpStatusCode": 200}	622bfdaf-1140-44e1-b944-0fee15283d37	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
e4582b90-d501-4cb2-8331-f1de5a4cf8dd	documents	receipts/9mdkyswrjxn-1752239481180.png	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-11 13:11:23.949847+00	2025-07-11 13:11:23.949847+00	2025-07-11 13:11:23.949847+00	{"eTag": "\\"fffe6336258366e56c976e7dd0cee2c6\\"", "size": 287894, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-11T13:11:24.000Z", "contentLength": 287894, "httpStatusCode": 200}	306bafbb-218c-406d-bec1-47dd5a1e76d1	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
5a45c0a3-70f9-4ac2-962a-f7544437dd7b	documents	bank_statements/k0pr3bcz3sb-1752239506386.png	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-11 13:11:48.371409+00	2025-07-11 13:11:48.371409+00	2025-07-11 13:11:48.371409+00	{"eTag": "\\"4e5d17df5608d3090c32f36a96142851\\"", "size": 35504, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-11T13:11:49.000Z", "contentLength": 35504, "httpStatusCode": 200}	502dc95c-708d-4be5-b47f-a7d9529795d5	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
94e038c6-5665-414c-bc3b-3eebbc726b0f	documents	receipts/r3eo3cysd9q-1752241292987.png	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-11 13:41:36.08937+00	2025-07-11 13:41:36.08937+00	2025-07-11 13:41:36.08937+00	{"eTag": "\\"faafd10e589bba28ac25ee97c4cfe079\\"", "size": 294760, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-11T13:41:36.000Z", "contentLength": 294760, "httpStatusCode": 200}	58a3585b-11ec-4cf7-8d1c-e089fe218efd	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
a6ac4b3b-df31-4934-9f0b-e1e5ddc837f4	documents	invoices/78r5v5hlgr-1752438816335.png	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-13 20:33:39.813265+00	2025-07-13 20:33:39.813265+00	2025-07-13 20:33:39.813265+00	{"eTag": "\\"faafd10e589bba28ac25ee97c4cfe079\\"", "size": 294760, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-13T20:33:40.000Z", "contentLength": 294760, "httpStatusCode": 200}	24b03adb-33c5-4c6d-ae8f-73dabf9d89b1	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
19762254-4156-42ea-b554-63af86ae2490	documents	bank_statements/8pj8gntn5z6-1752601585589.png	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-15 17:46:28.778695+00	2025-07-15 17:46:28.778695+00	2025-07-15 17:46:28.778695+00	{"eTag": "\\"fffe6336258366e56c976e7dd0cee2c6\\"", "size": 287894, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T17:46:29.000Z", "contentLength": 287894, "httpStatusCode": 200}	48b8fb02-e25d-47d8-bed6-3b9f26748015	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
d7536e91-e4a1-4d4f-a165-830bb8c20172	documents	.emptyFolderPlaceholder	\N	2025-07-11 07:15:37.229398+00	2025-07-11 07:15:37.229398+00	2025-07-11 07:15:37.229398+00	{"eTag": "\\"d41d8cd98f00b204e9800998ecf8427e\\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-07-11T07:15:38.000Z", "contentLength": 0, "httpStatusCode": 200}	79ebb988-5969-4a71-af4f-bc81fcb00266	\N	{}
cc550af4-3238-43f1-b81e-bbce0a492853	documents	bank_statements/avag79us7m-1752602510853.pdf	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-15 18:01:54.088093+00	2025-07-15 18:01:54.088093+00	2025-07-15 18:01:54.088093+00	{"eTag": "\\"6e9f9e02d95d6f634a8e06ec339db823\\"", "size": 333057, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T18:01:54.000Z", "contentLength": 333057, "httpStatusCode": 200}	6f474c5c-32a1-4b02-b3b9-f3eb73e42ee8	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
da92f97d-f446-4cbf-b106-012ba37a27a0	documents	invoices/tdrhyil5fn-1752606268114.jpeg	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-15 19:04:29.951136+00	2025-07-15 19:04:29.951136+00	2025-07-15 19:04:29.951136+00	{"eTag": "\\"110b358b5fb3c38669bd8f527e610068\\"", "size": 7207, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T19:04:30.000Z", "contentLength": 7207, "httpStatusCode": 200}	eb7af6c2-3caa-463f-8c0d-a18e9918ccaf	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
8daa978a-0445-4145-8d2e-a4c85b866f9d	documents	bank_statements/ari8ssd9dm8-1752606417229.csv	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-15 19:06:59.076886+00	2025-07-15 19:06:59.076886+00	2025-07-15 19:06:59.076886+00	{"eTag": "\\"94c83f034c5a2ec72f46e51cea512a68\\"", "size": 10295, "mimetype": "text/csv", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T19:07:00.000Z", "contentLength": 10295, "httpStatusCode": 200}	180c6515-c1a9-465e-b293-c0c5f7c29156	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
d9349f3e-7040-40d3-b663-eca8fd24b58f	documents	tax_documents/vouchers/1jte82etui7-1752608218627.jpeg	6c37a735-1990-43f4-858f-a268d52a350d	2025-07-15 19:37:00.498101+00	2025-07-15 19:37:00.498101+00	2025-07-15 19:37:00.498101+00	{"eTag": "\\"110b358b5fb3c38669bd8f527e610068\\"", "size": 7207, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T19:37:01.000Z", "contentLength": 7207, "httpStatusCode": 200}	d7538249-68b5-47f7-8e5a-90911eca531b	6c37a735-1990-43f4-858f-a268d52a350d	{}
c25af4d6-c43f-495e-a335-16c20a045c54	documents	tax_documents/vouchers/26iwtmwn69a-1752608352224.jpeg	6c37a735-1990-43f4-858f-a268d52a350d	2025-07-15 19:39:14.103205+00	2025-07-15 19:39:14.103205+00	2025-07-15 19:39:14.103205+00	{"eTag": "\\"110b358b5fb3c38669bd8f527e610068\\"", "size": 7207, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T19:39:15.000Z", "contentLength": 7207, "httpStatusCode": 200}	6d6e8aba-c1c9-4268-9f75-53e502f1364a	6c37a735-1990-43f4-858f-a268d52a350d	{}
77019a4f-3e75-42a6-822b-62c2257fc80f	documents	tax_documents/returns/s21q5qe9uk-1752609852921.pdf	6c37a735-1990-43f4-858f-a268d52a350d	2025-07-15 20:04:15.300799+00	2025-07-15 20:04:15.300799+00	2025-07-15 20:04:15.300799+00	{"eTag": "\\"c324fbe25342263766503264549ba527\\"", "size": 147139, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T20:04:16.000Z", "contentLength": 147139, "httpStatusCode": 200}	499470ac-78a9-47e5-861e-f994a062d845	6c37a735-1990-43f4-858f-a268d52a350d	{}
fc7adcf5-3a08-4abf-884b-3e1301d8751b	documents	receipts/o6l6j5je6l-1752609948778.png	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-15 20:05:51.78718+00	2025-07-15 20:05:51.78718+00	2025-07-15 20:05:51.78718+00	{"eTag": "\\"faafd10e589bba28ac25ee97c4cfe079\\"", "size": 294760, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T20:05:52.000Z", "contentLength": 294760, "httpStatusCode": 200}	a95dee17-0163-402f-82b1-b40060a6c6a3	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
e6e4323c-6e6e-4f1c-a9ef-95228ffd19fc	documents	tax_documents/summaries/d8j6d9zzbhs-1752611412275.pdf	6c37a735-1990-43f4-858f-a268d52a350d	2025-07-15 20:30:15.133694+00	2025-07-15 20:30:15.133694+00	2025-07-15 20:30:15.133694+00	{"eTag": "\\"c324fbe25342263766503264549ba527\\"", "size": 147139, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-15T20:30:16.000Z", "contentLength": 147139, "httpStatusCode": 200}	062d89a2-cb91-4a5b-aca0-5507d002713b	6c37a735-1990-43f4-858f-a268d52a350d	{}
5f9190b3-7ec7-4fdf-8c1b-f1a95b7b813e	documents	bank_statements/u25iaifhi8-1752687901999.pdf	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	2025-07-16 17:45:04.571227+00	2025-07-16 17:45:04.571227+00	2025-07-16 17:45:04.571227+00	{"eTag": "\\"47eda63dfdee8830bfe3e9b63365a5e6\\"", "size": 183623, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-16T17:45:05.000Z", "contentLength": 183623, "httpStatusCode": 200}	83394db2-7f5d-4270-a15a-2e68fde8b707	6813a4dc-bc5c-4f56-8bf3-5dbce03d4366	{}
ff42ab43-3273-406e-979d-cdea3432b0ec	documents	tax_documents/summaries/fursq3liy2n-1752688326281.pdf	6c37a735-1990-43f4-858f-a268d52a350d	2025-07-16 17:52:08.590941+00	2025-07-16 17:52:08.590941+00	2025-07-16 17:52:08.590941+00	{"eTag": "\\"47eda63dfdee8830bfe3e9b63365a5e6\\"", "size": 183623, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-16T17:52:09.000Z", "contentLength": 183623, "httpStatusCode": 200}	3d8c831e-1fc9-4fc6-9675-e13a1cb0243e	6c37a735-1990-43f4-858f-a268d52a350d	{}
4923987d-41cd-4a18-b48c-315e33291771	documents	invoices/tgjilqfstva-1752756974703.png	1d469088-85f9-4b9d-a40c-84361f50ce55	2025-07-17 12:56:14.769277+00	2025-07-17 12:56:14.769277+00	2025-07-17 12:56:14.769277+00	{"eTag": "\\"d718ac3a0c201a5c7e10c2cc225f2e27\\"", "size": 167547, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-17T12:56:15.000Z", "contentLength": 167547, "httpStatusCode": 200}	9db847dd-cfca-4f30-b79b-5b8b1b813117	1d469088-85f9-4b9d-a40c-84361f50ce55	{}
ff0e44d0-4e2d-4ddf-ab87-db725ec945a6	documents	invoices/v1pucuh1br-1752756974703.png	1d469088-85f9-4b9d-a40c-84361f50ce55	2025-07-17 12:56:14.875533+00	2025-07-17 12:56:14.875533+00	2025-07-17 12:56:14.875533+00	{"eTag": "\\"fffe6336258366e56c976e7dd0cee2c6\\"", "size": 287894, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-17T12:56:15.000Z", "contentLength": 287894, "httpStatusCode": 200}	b054c34b-2ddc-43d8-bd03-b2d7fdaf29ca	1d469088-85f9-4b9d-a40c-84361f50ce55	{}
41719221-e258-49ad-ba13-be44a6bd40bf	documents	receipts/gygoyv647ze-1752757001388.png	1d469088-85f9-4b9d-a40c-84361f50ce55	2025-07-17 12:56:41.327464+00	2025-07-17 12:56:41.327464+00	2025-07-17 12:56:41.327464+00	{"eTag": "\\"f1207b511609c2ffdcc66c8cd337c4c5\\"", "size": 152568, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-17T12:56:42.000Z", "contentLength": 152568, "httpStatusCode": 200}	6b77f28f-1ad6-44ff-8c82-79a757487ce9	1d469088-85f9-4b9d-a40c-84361f50ce55	{}
2b09de74-b9bc-4f50-afef-de32c85e2ea0	documents	receipts/kvz84rl0ht-1752757001388.png	1d469088-85f9-4b9d-a40c-84361f50ce55	2025-07-17 12:56:41.585943+00	2025-07-17 12:56:41.585943+00	2025-07-17 12:56:41.585943+00	{"eTag": "\\"c99ae5e4ce61a7c917b21166b208df1b\\"", "size": 650020, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-17T12:56:42.000Z", "contentLength": 650020, "httpStatusCode": 200}	e76a2795-e8f3-469d-956c-e888d34192af	1d469088-85f9-4b9d-a40c-84361f50ce55	{}
7bc5367e-4fd3-4404-bcaf-d6d555659a38	documents	bank_statements/8hzk17p05kf-1752757086338.pdf	1d469088-85f9-4b9d-a40c-84361f50ce55	2025-07-17 12:58:06.622192+00	2025-07-17 12:58:06.622192+00	2025-07-17 12:58:06.622192+00	{"eTag": "\\"7ef47235b0c3919dde715a692203f74c\\"", "size": 945680, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-17T12:58:07.000Z", "contentLength": 945680, "httpStatusCode": 200}	af9dade1-8c24-4637-8ab0-da5a600e0ef7	1d469088-85f9-4b9d-a40c-84361f50ce55	{}
6b24f084-e779-4923-9677-ffe57830816a	documents	tax_documents/returns/ofou93iegmi-1752758434905.pdf	6c37a735-1990-43f4-858f-a268d52a350d	2025-07-17 13:20:34.948929+00	2025-07-17 13:20:34.948929+00	2025-07-17 13:20:34.948929+00	{"eTag": "\\"59fc254d91376558484fe42c6fffbdde\\"", "size": 102621, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-17T13:20:35.000Z", "contentLength": 102621, "httpStatusCode": 200}	f5cbc568-0117-4f1e-8bb2-f8c1fa78a47e	6c37a735-1990-43f4-858f-a268d52a350d	{}
3b2593fe-e438-4111-946a-31bf86e29a85	documents	bank_statements/qyypb2sgd5l-1753211961229.pdf	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	2025-07-22 19:19:24.091271+00	2025-07-22 19:19:24.091271+00	2025-07-22 19:19:24.091271+00	{"eTag": "\\"47eda63dfdee8830bfe3e9b63365a5e6\\"", "size": 183623, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-22T19:19:24.000Z", "contentLength": 183623, "httpStatusCode": 200}	2f0ca5f4-6763-4b0d-a294-4ee9d77ed9aa	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	{}
264364b8-8af8-4172-bac9-288df742bc56	documents	bank_statements/8lqfmf30w4a-1753343384734.pdf	117827b6-d850-4e43-8d58-088af26d5340	2025-07-24 07:49:45.898134+00	2025-07-24 07:49:45.898134+00	2025-07-24 07:49:45.898134+00	{"eTag": "\\"59fc254d91376558484fe42c6fffbdde\\"", "size": 102621, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-24T07:49:46.000Z", "contentLength": 102621, "httpStatusCode": 200}	d6f41480-5055-4c6b-aec3-8f3e8605fd23	117827b6-d850-4e43-8d58-088af26d5340	{}
21026770-ffd8-4a08-b12c-71b574fe9744	documents	tax_documents/returns/z7mu348seo-1753344741849.pdf	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	2025-07-24 08:12:22.758305+00	2025-07-24 08:12:22.758305+00	2025-07-24 08:12:22.758305+00	{"eTag": "\\"08579fe84f78c283c56b0de51a79fd68\\"", "size": 84437, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-24T08:12:23.000Z", "contentLength": 84437, "httpStatusCode": 200}	df7f77ed-a7dd-4ff3-b82a-0e1b232a6875	5367e45d-636a-4c1d-a0f4-e1f9fddba3c6	{}
42c8706a-727b-4c68-a98c-95630bc95f23	documents	invoices/h44ydiuozn7-1753344873747.png	117827b6-d850-4e43-8d58-088af26d5340	2025-07-24 08:14:35.100488+00	2025-07-24 08:14:35.100488+00	2025-07-24 08:14:35.100488+00	{"eTag": "\\"f1207b511609c2ffdcc66c8cd337c4c5\\"", "size": 152568, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-24T08:14:36.000Z", "contentLength": 152568, "httpStatusCode": 200}	ca51889a-512f-415c-a196-e1368e4b02ed	117827b6-d850-4e43-8d58-088af26d5340	{}
1e7a9546-7699-4230-aa4c-592bce4e2a97	documents	invoices/jpb4lpg4lxr-1753344873747.png	117827b6-d850-4e43-8d58-088af26d5340	2025-07-24 08:14:35.162069+00	2025-07-24 08:14:35.162069+00	2025-07-24 08:14:35.162069+00	{"eTag": "\\"fffe6336258366e56c976e7dd0cee2c6\\"", "size": 287894, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-24T08:14:36.000Z", "contentLength": 287894, "httpStatusCode": 200}	c9218944-eb1a-46b0-9e97-0ceeeece634e	117827b6-d850-4e43-8d58-088af26d5340	{}
a0aa6600-86b9-4b50-a1d9-f838e54c46ad	documents	bank_statements/c38z66oma0i-1753376000317.pdf	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	2025-07-24 16:53:23.661699+00	2025-07-24 16:53:23.661699+00	2025-07-24 16:53:23.661699+00	{"eTag": "\\"47eda63dfdee8830bfe3e9b63365a5e6\\"", "size": 183623, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-24T16:53:24.000Z", "contentLength": 183623, "httpStatusCode": 200}	60e851c7-4573-4f36-b391-8246933c0fc6	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	{}
0632faeb-a0d2-4600-a0fa-363f5e05e8dc	documents	bank_statements/9aofcadm6hq-1753612083864.pdf	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	2025-07-27 10:28:06.507843+00	2025-07-27 10:28:06.507843+00	2025-07-27 10:28:06.507843+00	{"eTag": "\\"c324fbe25342263766503264549ba527\\"", "size": 147139, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-27T10:28:07.000Z", "contentLength": 147139, "httpStatusCode": 200}	02db187b-11b4-4c7e-b8bd-f38f71be7139	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	{}
9dff7734-6f33-4ef9-8608-7ebf2a779d6d	documents	bank_statements/2c80ee8m4e6-1753616415665.pdf	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	2025-07-27 11:40:17.801744+00	2025-07-27 11:40:17.801744+00	2025-07-27 11:40:17.801744+00	{"eTag": "\\"47eda63dfdee8830bfe3e9b63365a5e6\\"", "size": 183623, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-07-27T11:40:18.000Z", "contentLength": 183623, "httpStatusCode": 200}	730adfa6-4606-41f7-ba9c-5c32b309e596	e0d2a4fd-2dc2-4d83-90e1-3471369ecc2d	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 621, true);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 21, true);


--
-- Name: coa_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coa_template_id_seq', 1, false);


--
-- Name: company_coa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_coa_id_seq', 4066, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accountants accountants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accountants
    ADD CONSTRAINT accountants_pkey PRIMARY KEY (id);


--
-- Name: accountants accountants_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accountants
    ADD CONSTRAINT accountants_user_id_key UNIQUE (user_id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_user_id_key UNIQUE (user_id);


--
-- Name: coa_template coa_template_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_template
    ADD CONSTRAINT coa_template_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_coa company_coa_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_coa
    ADD CONSTRAINT company_coa_id_key UNIQUE (id);


--
-- Name: company_coa company_coa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_coa
    ADD CONSTRAINT company_coa_pkey PRIMARY KEY (id);


--
-- Name: company_coa company_coa_template_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_coa
    ADD CONSTRAINT company_coa_template_company_unique UNIQUE (template_id, company_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_entry_lines journal_entry_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_activity_logs_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_company_id ON public.activity_logs USING btree (company_id);


--
-- Name: idx_admins_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admins_user_id ON public.admins USING btree (user_id);


--
-- Name: idx_companies_account_balance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_account_balance ON public.companies USING btree (account_balance);


--
-- Name: idx_companies_total_credit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_total_credit ON public.companies USING btree (total_credit);


--
-- Name: idx_companies_total_debit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_total_debit ON public.companies USING btree (total_debit);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: messages update_messages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_messages_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: accountants accountants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accountants
    ADD CONSTRAINT accountants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: activity_logs activity_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: activity_logs activity_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: admins admins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: coa_template coa_template_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coa_template
    ADD CONSTRAINT coa_template_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.coa_template(id) ON DELETE SET NULL;


--
-- Name: companies companies_assigned_accountant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_assigned_accountant_id_fkey FOREIGN KEY (assigned_accountant_id) REFERENCES public.accountants(id) ON DELETE SET NULL;


--
-- Name: companies companies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: company_coa company_coa_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_coa
    ADD CONSTRAINT company_coa_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: documents documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_user_id_fkey1 FOREIGN KEY (uploaded_by_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: journal_entry_lines journal_entry_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.company_coa(id) ON DELETE RESTRICT;


--
-- Name: journal_entry_lines journal_entry_lines_journal_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- Name: messages messages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: messages messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id);


--
-- Name: messages messages_related_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_related_document_id_fkey FOREIGN KEY (related_document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: accountants Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.accountants USING (true) WITH CHECK (true);


--
-- Name: activity_logs Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.activity_logs USING (true) WITH CHECK (true);


--
-- Name: admins Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.admins USING (true) WITH CHECK (true);


--
-- Name: coa_template Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.coa_template USING (true) WITH CHECK (true);


--
-- Name: companies Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.companies TO authenticated USING (true) WITH CHECK (true);


--
-- Name: company_coa Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.company_coa USING (true) WITH CHECK (true);


--
-- Name: documents Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.documents USING (true) WITH CHECK (true);


--
-- Name: journal_entries Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.journal_entries USING (true) WITH CHECK (true);


--
-- Name: journal_entry_lines Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.journal_entry_lines USING (true) WITH CHECK (true);


--
-- Name: messages Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.messages USING (true) WITH CHECK (true);


--
-- Name: profiles Enable all access to all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access to all authenticated users" ON public.profiles USING (true) WITH CHECK (true);


--
-- Name: accountants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accountants ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: admins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

--
-- Name: coa_template; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coa_template ENABLE ROW LEVEL SECURITY;

--
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- Name: company_coa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_coa ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entry_lines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow authenticated users to upload documents flreew_0; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to upload documents flreew_0" ON storage.objects FOR SELECT USING ((bucket_id = 'documents'::text));


--
-- Name: objects Allow authenticated users to upload documents flreew_1; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to upload documents flreew_1" ON storage.objects FOR INSERT WITH CHECK ((bucket_id = 'documents'::text));


--
-- Name: objects Allow authenticated users to upload documents flreew_2; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to upload documents flreew_2" ON storage.objects FOR UPDATE USING ((bucket_id = 'documents'::text));


--
-- Name: objects Allow authenticated users to upload documents flreew_3; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to upload documents flreew_3" ON storage.objects FOR DELETE USING ((bucket_id = 'documents'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

