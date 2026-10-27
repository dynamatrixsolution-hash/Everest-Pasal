-- ==============================================================================
-- EVEREST PASAL - COMPLETE 21-SCHEMA / 183-TABLE PRODUCTION DDL SPECIFICATION
-- Authoritative Source: Everest_Pasal_Database_Design_Documentation.docx
-- Engine: PostgreSQL 15+ / 16+
-- ==============================================================================

-- 1. CREATE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE ALL 21 SCHEMAS
CREATE SCHEMA IF NOT EXISTS ep_system;
CREATE SCHEMA IF NOT EXISTS ep_geo;
CREATE SCHEMA IF NOT EXISTS ep_identity;
CREATE SCHEMA IF NOT EXISTS ep_customer;
CREATE SCHEMA IF NOT EXISTS ep_merchant;
CREATE SCHEMA IF NOT EXISTS ep_catalog;
CREATE SCHEMA IF NOT EXISTS ep_inventory;
CREATE SCHEMA IF NOT EXISTS ep_pricing;
CREATE SCHEMA IF NOT EXISTS ep_commerce;
CREATE SCHEMA IF NOT EXISTS ep_payment;
CREATE SCHEMA IF NOT EXISTS ep_finance;
CREATE SCHEMA IF NOT EXISTS ep_fulfillment;
CREATE SCHEMA IF NOT EXISTS ep_logistics;
CREATE SCHEMA IF NOT EXISTS ep_returns;
CREATE SCHEMA IF NOT EXISTS ep_growth;
CREATE SCHEMA IF NOT EXISTS ep_content;
CREATE SCHEMA IF NOT EXISTS ep_comms;
CREATE SCHEMA IF NOT EXISTS ep_integration;
CREATE SCHEMA IF NOT EXISTS ep_support;
CREATE SCHEMA IF NOT EXISTS ep_audit;
CREATE SCHEMA IF NOT EXISTS ep_kyc;

-- ==============================================================================
-- SCHEMA 01: ep_system (11 Tables)
-- ==============================================================================

-- 1. ep_system.tb_ep_system_company_company_master
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_company_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    company_name varchar(150) NOT NULL,
    legal_name varchar(200),
    registration_no varchar(80),
    tax_registration_no varchar(80),
    country_code varchar(10) NOT NULL,
    currency_code varchar(10) NOT NULL,
    timezone varchar(60) NOT NULL,
    default_language_code varchar(10),
    current_fiscal_year_code varchar(20),
    logo_url text,
    website_url text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_company_code UNIQUE (company_code),
    CONSTRAINT chk_ep_system_company_master_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 2. ep_system.tb_ep_system_company_company_address_detail
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_company_address_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    address_type varchar(30) NOT NULL,
    address_line1 varchar(200) NOT NULL,
    address_line2 varchar(200),
    country_code varchar(10) NOT NULL,
    province_code varchar(20),
    district_code varchar(20),
    city_code varchar(20),
    postal_code varchar(20),
    latitude numeric(10,7),
    longitude numeric(10,7),
    is_primary boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_system_company_address_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 3. ep_system.tb_ep_system_company_fiscal_year_master
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_fiscal_year_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    fiscal_year_name varchar(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_current boolean NOT NULL DEFAULT false,
    is_closed boolean NOT NULL DEFAULT false,
    closed_at timestamptz,
    closed_by uuid,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_fy_code UNIQUE (company_code, fiscal_year_code),
    CONSTRAINT chk_ep_system_fy_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 4. ep_system.tb_ep_system_company_ftp_setup
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_ftp_setup (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    setup_code varchar(40) NOT NULL,
    setup_name varchar(100) NOT NULL,
    protocol varchar(10) NOT NULL,
    host varchar(200) NOT NULL,
    port integer NOT NULL,
    username_reference varchar(200),
    secret_reference varchar(250),
    remote_path varchar(500),
    archive_path varchar(500),
    connection_timeout_sec integer,
    is_default boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_ftp_code UNIQUE (company_code, setup_code),
    CONSTRAINT chk_ep_system_ftp_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 5. ep_system.tb_ep_system_company_communication_setup
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_communication_setup (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    setup_code varchar(40) NOT NULL,
    communication_type varchar(20) NOT NULL,
    provider_code varchar(40) NOT NULL,
    setup_name varchar(100) NOT NULL,
    sender_name varchar(100),
    sender_address varchar(200),
    api_endpoint text,
    credential_reference varchar(250),
    configuration_json jsonb,
    is_default boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_comm_code UNIQUE (company_code, setup_code),
    CONSTRAINT chk_ep_system_comm_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 6. ep_system.tb_ep_system_company_database_link_setup
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_database_link_setup (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    database_link_code varchar(50) NOT NULL,
    database_name varchar(120) NOT NULL,
    database_role varchar(30) NOT NULL,
    database_type varchar(30) NOT NULL,
    host varchar(200),
    port integer,
    connection_reference varchar(250),
    credential_reference varchar(250),
    is_primary boolean NOT NULL DEFAULT false,
    read_write_mode varchar(20) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_dblink_code UNIQUE (company_code, database_link_code),
    CONSTRAINT chk_ep_system_dblink_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 7. ep_system.tb_ep_system_company_database_route_setup
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_database_route_setup (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    route_code varchar(50) NOT NULL,
    module_code varchar(40),
    content_type varchar(50),
    country_code varchar(10),
    province_code varchar(20),
    city_code varchar(20),
    branch_code varchar(30),
    warehouse_code varchar(30),
    database_link_code varchar(50) NOT NULL,
    priority integer NOT NULL DEFAULT 100,
    route_mode varchar(20) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_system_dbroute_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE INDEX IF NOT EXISTS idx_ep_sys_db_route_lookup ON ep_system.tb_ep_system_company_database_route_setup (company_code, module_code, content_type, city_code, priority);

-- 8. ep_system.tb_ep_system_company_setting_master
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_company_setting_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    setting_group varchar(50) NOT NULL,
    setting_key varchar(100) NOT NULL,
    setting_value text,
    value_type varchar(20) NOT NULL,
    is_sensitive boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_setting_key UNIQUE (company_code, setting_group, setting_key),
    CONSTRAINT chk_ep_system_setting_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 9. ep_system.tb_ep_system_document_number_series_master
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_document_number_series_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    series_code varchar(40) NOT NULL,
    document_type varchar(40) NOT NULL,
    prefix varchar(30),
    suffix varchar(30),
    next_number bigint NOT NULL DEFAULT 1,
    padding_length integer NOT NULL DEFAULT 8,
    reset_policy varchar(20) NOT NULL,
    last_reset_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_doc_series UNIQUE (company_code, series_code),
    CONSTRAINT chk_ep_system_doc_series_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 10. ep_system.tb_ep_system_branch_branch_master
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_branch_branch_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    branch_code varchar(30) NOT NULL,
    branch_name varchar(120) NOT NULL,
    branch_type varchar(30) NOT NULL,
    country_code varchar(10) NOT NULL,
    province_code varchar(20),
    city_code varchar(20),
    address_text text,
    phone varchar(40),
    email varchar(150),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_branch_code UNIQUE (company_code, branch_code),
    CONSTRAINT chk_ep_system_branch_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 11. ep_system.tb_ep_system_feature_feature_flag_setup
CREATE TABLE IF NOT EXISTS ep_system.tb_ep_system_feature_feature_flag_setup (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    feature_code varchar(80) NOT NULL,
    feature_name varchar(120) NOT NULL,
    enabled boolean NOT NULL DEFAULT false,
    configuration_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_system_feature_code UNIQUE (company_code, feature_code),
    CONSTRAINT chk_ep_system_feature_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 02: ep_geo (8 Tables)
-- ==============================================================================

-- 12. ep_geo.tb_ep_geo_country_country_master
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_country_country_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    country_code varchar(10) NOT NULL,
    country_name varchar(100) NOT NULL,
    iso2 varchar(2),
    iso3 varchar(3),
    phone_code varchar(10),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_geo_country_code UNIQUE (company_code, country_code),
    CONSTRAINT chk_ep_geo_country_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 13. ep_geo.tb_ep_geo_province_province_master
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_province_province_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    province_code varchar(20) NOT NULL,
    province_name varchar(100) NOT NULL,
    country_code varchar(10) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_geo_province_code UNIQUE (company_code, country_code, province_code),
    CONSTRAINT chk_ep_geo_province_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 14. ep_geo.tb_ep_geo_district_district_master
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_district_district_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    district_code varchar(20) NOT NULL,
    district_name varchar(100) NOT NULL,
    province_code varchar(20) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_geo_district_code UNIQUE (company_code, province_code, district_code),
    CONSTRAINT chk_ep_geo_district_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 15. ep_geo.tb_ep_geo_city_city_master
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_city_city_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    city_code varchar(20) NOT NULL,
    city_name varchar(120) NOT NULL,
    district_code varchar(20),
    province_code varchar(20),
    country_code varchar(10) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_geo_city_code UNIQUE (company_code, country_code, city_code),
    CONSTRAINT chk_ep_geo_city_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 16. ep_geo.tb_ep_geo_postal_postal_code_master
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_postal_postal_code_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    postal_code varchar(20) NOT NULL,
    city_code varchar(20) NOT NULL,
    serviceable boolean NOT NULL DEFAULT true,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_geo_postal_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE INDEX IF NOT EXISTS idx_ep_geo_postal_lookup ON ep_geo.tb_ep_geo_postal_postal_code_master (company_code, postal_code);

-- 17. ep_geo.tb_ep_geo_service_service_area_master
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_service_service_area_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    service_area_code varchar(30) NOT NULL,
    service_area_name varchar(120) NOT NULL,
    city_code varchar(20) NOT NULL,
    area_type varchar(30) NOT NULL,
    polygon_geojson jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_geo_service_area UNIQUE (company_code, service_area_code),
    CONSTRAINT chk_ep_geo_service_area_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 18. ep_geo.tb_ep_geo_zone_delivery_zone_master
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_zone_delivery_zone_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    zone_code varchar(30) NOT NULL,
    zone_name varchar(120) NOT NULL,
    zone_type varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_geo_zone_code UNIQUE (company_code, zone_code),
    CONSTRAINT chk_ep_geo_zone_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 19. ep_geo.tb_ep_geo_zone_delivery_zone_area_map
CREATE TABLE IF NOT EXISTS ep_geo.tb_ep_geo_zone_delivery_zone_area_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    zone_code varchar(30) NOT NULL,
    service_area_code varchar(30),
    city_code varchar(20),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_geo_zone_area_map UNIQUE (company_code, zone_code, service_area_code, city_code),
    CONSTRAINT chk_ep_geo_zone_map_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 03: ep_identity (11 Tables)
-- ==============================================================================

-- 20. ep_identity.tb_ep_identity_user_user_master
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_user_user_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_code varchar(40) NOT NULL,
    email varchar(180),
    mobile_no varchar(30),
    display_name varchar(150) NOT NULL,
    user_type varchar(30) NOT NULL,
    email_verified boolean NOT NULL DEFAULT false,
    mobile_verified boolean NOT NULL DEFAULT false,
    last_login_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_identity_user_code UNIQUE (company_code, user_code),
    CONSTRAINT chk_ep_identity_user_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ep_identity_user_email ON ep_identity.tb_ep_identity_user_user_master (company_code, email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ep_identity_user_mobile ON ep_identity.tb_ep_identity_user_user_master (company_code, mobile_no) WHERE mobile_no IS NOT NULL;

-- 21. ep_identity.tb_ep_identity_auth_credential_master
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_auth_credential_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    credential_type varchar(30) NOT NULL,
    password_hash text,
    provider_name varchar(50),
    provider_subject varchar(200),
    password_changed_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_identity_cred_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 22. ep_identity.tb_ep_identity_role_role_master
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_role_role_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    role_code varchar(50) NOT NULL,
    role_name varchar(120) NOT NULL,
    role_scope varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_identity_role_code UNIQUE (company_code, role_code),
    CONSTRAINT chk_ep_identity_role_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 23. ep_identity.tb_ep_identity_permission_permission_master
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_permission_permission_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    permission_code varchar(100) NOT NULL,
    permission_name varchar(150) NOT NULL,
    module_code varchar(40) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_identity_perm_code UNIQUE (company_code, permission_code),
    CONSTRAINT chk_ep_identity_perm_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 24. ep_identity.tb_ep_identity_role_user_role_map
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_role_user_role_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    role_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_role_role_master(id) ON DELETE RESTRICT,
    scope_type varchar(30),
    scope_id uuid,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_identity_user_role_scope UNIQUE (company_code, user_id, role_id, scope_type, scope_id),
    CONSTRAINT chk_ep_identity_user_role_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 25. ep_identity.tb_ep_identity_role_role_permission_map
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_role_role_permission_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    role_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_role_role_master(id) ON DELETE RESTRICT,
    permission_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_permission_permission_master(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_identity_role_perm UNIQUE (company_code, role_id, permission_id),
    CONSTRAINT chk_ep_identity_role_perm_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 26. ep_identity.tb_ep_admin_log_session_master
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_admin_log_session_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    session_token_hash text NOT NULL,
    refresh_token_hash text,
    ip_address inet,
    user_agent text,
    device_id uuid,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_admin_session_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 27. ep_identity.tb_ep_identity_auth_otp_txn
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_auth_otp_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    destination varchar(200) NOT NULL,
    purpose varchar(30) NOT NULL,
    otp_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    attempt_count integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_identity_otp_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 28. ep_identity.tb_ep_identity_auth_password_history
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_auth_password_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    password_hash text NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_identity_pwd_hist_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 29. ep_identity.tb_ep_identity_device_device_master
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_device_device_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    device_fingerprint varchar(200) NOT NULL,
    device_type varchar(30) NOT NULL,
    os_name varchar(50),
    push_token text,
    last_seen_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_identity_device_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 30. ep_identity.tb_ep_identity_api_api_key_master
CREATE TABLE IF NOT EXISTS ep_identity.tb_ep_identity_api_api_key_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    api_key_code varchar(50) NOT NULL,
    owner_type varchar(30) NOT NULL,
    owner_id uuid,
    key_hash text NOT NULL,
    scopes_json jsonb,
    expires_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_identity_api_key UNIQUE (company_code, api_key_code),
    CONSTRAINT chk_ep_identity_api_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 04: ep_customer (6 Tables)
-- ==============================================================================

-- 31. ep_customer.tb_ep_customer_profile_customer_master
CREATE TABLE IF NOT EXISTS ep_customer.tb_ep_customer_profile_customer_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_code varchar(40) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    first_name varchar(80) NOT NULL,
    last_name varchar(80),
    date_of_birth date,
    gender varchar(20),
    preferred_language_code varchar(10),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_customer_code UNIQUE (company_code, customer_code),
    CONSTRAINT uq_ep_customer_user_id UNIQUE (company_code, user_id),
    CONSTRAINT chk_ep_customer_profile_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 32. ep_customer.tb_ep_customer_address_address_detail
CREATE TABLE IF NOT EXISTS ep_customer.tb_ep_customer_address_address_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    address_type varchar(30) NOT NULL,
    recipient_name varchar(150) NOT NULL,
    recipient_phone varchar(30) NOT NULL,
    address_line1 varchar(200) NOT NULL,
    address_line2 varchar(200),
    city_code varchar(20) NOT NULL,
    postal_code varchar(20),
    latitude numeric(10,7),
    longitude numeric(10,7),
    is_default boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_customer_addr_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 33. ep_customer.tb_ep_customer_pref_preference_master
CREATE TABLE IF NOT EXISTS ep_customer.tb_ep_customer_pref_preference_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    preference_key varchar(100) NOT NULL,
    preference_value text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_customer_pref_key UNIQUE (company_code, customer_id, preference_key),
    CONSTRAINT chk_ep_customer_pref_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 34. ep_customer.tb_ep_customer_saved_payment_reference
CREATE TABLE IF NOT EXISTS ep_customer.tb_ep_customer_saved_payment_reference (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    provider_code varchar(40) NOT NULL,
    payment_token_reference varchar(250) NOT NULL,
    payment_method_type varchar(30) NOT NULL,
    masked_display varchar(80),
    is_default boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_customer_pm_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 35. ep_customer.tb_ep_customer_fav_favorite_store_map
CREATE TABLE IF NOT EXISTS ep_customer.tb_ep_customer_fav_favorite_store_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    store_id uuid NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_customer_fav_store UNIQUE (company_code, customer_id, store_id),
    CONSTRAINT chk_ep_customer_fav_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 36. ep_customer.tb_ep_customer_recent_product_view_log
CREATE TABLE IF NOT EXISTS ep_customer.tb_ep_customer_recent_product_view_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    product_id uuid NOT NULL,
    viewed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_customer_view_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 05: ep_merchant (11 Tables)
-- ==============================================================================

-- 37. ep_merchant.tb_ep_merchant_vendor_merchant_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_vendor_merchant_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_code varchar(40) NOT NULL,
    merchant_name varchar(160) NOT NULL,
    legal_name varchar(200),
    registration_no varchar(80),
    tax_no varchar(80),
    merchant_type varchar(30) NOT NULL,
    onboarding_status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_merchant_code UNIQUE (company_code, merchant_code),
    CONSTRAINT chk_ep_merchant_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 38. ep_merchant.tb_ep_merchant_vendor_member_map
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_vendor_member_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    merchant_role varchar(40) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_merchant_user_member UNIQUE (company_code, merchant_id, user_id),
    CONSTRAINT chk_ep_merchant_member_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 39. ep_merchant.tb_ep_merchant_store_store_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_store_store_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    store_code varchar(40) NOT NULL,
    store_name varchar(160) NOT NULL,
    slug varchar(160),
    store_type varchar(30) NOT NULL,
    default_warehouse_id uuid,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_merchant_store_code UNIQUE (company_code, store_code),
    CONSTRAINT chk_ep_merchant_store_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ep_merchant_store_slug ON ep_merchant.tb_ep_merchant_store_store_master (company_code, slug) WHERE slug IS NOT NULL;

-- 40. ep_merchant.tb_ep_merchant_address_address_detail
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_address_address_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    address_type varchar(30) NOT NULL,
    address_line1 varchar(200) NOT NULL,
    address_line2 varchar(200),
    city_code varchar(20) NOT NULL,
    postal_code varchar(20),
    is_primary boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_merchant_addr_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 41. ep_merchant.tb_ep_merchant_kyc_document_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_kyc_document_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    document_type varchar(40) NOT NULL,
    document_no varchar(100),
    file_url text NOT NULL,
    verification_status varchar(30) NOT NULL,
    verified_at timestamptz,
    verified_by uuid,
    kyc_subject_id uuid,
    kyc_case_id uuid,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_merch_kyc_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 42. ep_merchant.tb_ep_merchant_bank_bank_account_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_bank_bank_account_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    bank_name varchar(150) NOT NULL,
    account_name varchar(150) NOT NULL,
    account_no_masked varchar(80) NOT NULL,
    account_reference varchar(250),
    branch_name varchar(120),
    is_default boolean NOT NULL DEFAULT false,
    verification_status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_merch_bank_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 43. ep_merchant.tb_ep_merchant_contract_contract_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_contract_contract_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    contract_no varchar(60) NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    document_url text,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_merchant_contract_no UNIQUE (company_code, contract_no),
    CONSTRAINT chk_ep_merch_contract_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 44. ep_merchant.tb_ep_merchant_setting_setting_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_setting_setting_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    setting_key varchar(100) NOT NULL,
    setting_value text,
    value_type varchar(20) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_merchant_setting_key UNIQUE (company_code, merchant_id, setting_key),
    CONSTRAINT chk_ep_merch_setting_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 45. ep_merchant.tb_ep_merchant_commission_plan_map
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_commission_plan_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    commission_rule_id uuid NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_merch_comm_map_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 46. ep_merchant.tb_ep_merchant_prd_listing_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_prd_listing_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    store_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_store_store_master(id) ON DELETE RESTRICT,
    product_id uuid NOT NULL,
    listing_code varchar(60) NOT NULL,
    listing_title varchar(220),
    approval_status varchar(30) NOT NULL,
    seller_sku_prefix varchar(60),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_merchant_listing_code UNIQUE (company_code, listing_code),
    CONSTRAINT chk_ep_merch_listing_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 47. ep_merchant.tb_ep_merchant_prd_listing_variant_master
CREATE TABLE IF NOT EXISTS ep_merchant.tb_ep_merchant_prd_listing_variant_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    listing_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_prd_listing_master(id) ON DELETE RESTRICT,
    variant_id uuid NOT NULL,
    seller_sku varchar(80) NOT NULL,
    barcode_override varchar(80),
    condition_code varchar(30) NOT NULL,
    lead_time_days integer,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_merchant_listing_var UNIQUE (company_code, listing_id, variant_id),
    CONSTRAINT uq_ep_merchant_seller_sku UNIQUE (company_code, seller_sku),
    CONSTRAINT chk_ep_merch_list_var_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 06: ep_catalog (12 Tables)
-- ==============================================================================

-- 48. ep_catalog.tb_ep_catalog_cat_category_master
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_cat_category_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    category_code varchar(40) NOT NULL,
    category_name varchar(150) NOT NULL,
    slug varchar(180),
    parent_category_id uuid REFERENCES ep_catalog.tb_ep_catalog_cat_category_master(id) ON DELETE RESTRICT,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_catalog_category_code UNIQUE (company_code, category_code),
    CONSTRAINT chk_ep_cat_category_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 49. ep_catalog.tb_ep_catalog_brand_brand_master
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_brand_brand_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    brand_code varchar(40) NOT NULL,
    brand_name varchar(150) NOT NULL,
    slug varchar(180),
    logo_url text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_catalog_brand_code UNIQUE (company_code, brand_code),
    CONSTRAINT chk_ep_cat_brand_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 50. ep_catalog.tb_ep_catalog_prd_product_master
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_prd_product_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    product_code varchar(50) NOT NULL,
    product_name varchar(220) NOT NULL,
    brand_id uuid REFERENCES ep_catalog.tb_ep_catalog_brand_brand_master(id) ON DELETE RESTRICT,
    category_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_cat_category_master(id) ON DELETE RESTRICT,
    product_type varchar(30) NOT NULL,
    description text,
    tax_class_code varchar(30),
    approval_status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_catalog_product_code UNIQUE (company_code, product_code),
    CONSTRAINT chk_ep_cat_product_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 51. ep_catalog.tb_ep_catalog_prd_product_variant_master
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_prd_product_variant_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    product_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_master(id) ON DELETE RESTRICT,
    variant_code varchar(60) NOT NULL,
    variant_name varchar(180) NOT NULL,
    barcode varchar(80),
    weight_kg numeric(12,3),
    length_cm numeric(12,2),
    width_cm numeric(12,2),
    height_cm numeric(12,2),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_catalog_variant_code UNIQUE (company_code, variant_code),
    CONSTRAINT chk_ep_cat_variant_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 52. ep_catalog.tb_ep_catalog_attr_attribute_master
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_attr_attribute_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    attribute_code varchar(50) NOT NULL,
    attribute_name varchar(120) NOT NULL,
    data_type varchar(20) NOT NULL,
    is_variant_axis boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_catalog_attr_code UNIQUE (company_code, attribute_code),
    CONSTRAINT chk_ep_cat_attr_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 53. ep_catalog.tb_ep_catalog_attr_attribute_value_master
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_attr_attribute_value_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    attribute_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_attr_attribute_master(id) ON DELETE RESTRICT,
    value_code varchar(50) NOT NULL,
    value_label varchar(120) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_catalog_attr_val_code UNIQUE (company_code, attribute_id, value_code),
    CONSTRAINT chk_ep_cat_attr_val_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 54. ep_catalog.tb_ep_catalog_attr_product_attribute_map
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_attr_product_attribute_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    product_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_master(id) ON DELETE RESTRICT,
    attribute_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_attr_attribute_master(id) ON DELETE RESTRICT,
    attribute_value_id uuid REFERENCES ep_catalog.tb_ep_catalog_attr_attribute_value_master(id) ON DELETE RESTRICT,
    value_text text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_cat_prod_attr_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 55. ep_catalog.tb_ep_catalog_attr_variant_attribute_map
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_attr_variant_attribute_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    variant_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_variant_master(id) ON DELETE RESTRICT,
    attribute_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_attr_attribute_master(id) ON DELETE RESTRICT,
    attribute_value_id uuid REFERENCES ep_catalog.tb_ep_catalog_attr_attribute_value_master(id) ON DELETE RESTRICT,
    value_text text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_cat_var_attr_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 56. ep_catalog.tb_ep_catalog_media_product_media_detail
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_media_product_media_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    product_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_master(id) ON DELETE RESTRICT,
    variant_id uuid REFERENCES ep_catalog.tb_ep_catalog_prd_product_variant_master(id) ON DELETE RESTRICT,
    media_type varchar(20) NOT NULL,
    media_url text NOT NULL,
    alt_text varchar(250),
    sort_order integer NOT NULL DEFAULT 0,
    is_primary boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_cat_media_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 57. ep_catalog.tb_ep_catalog_doc_product_document_detail
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_doc_product_document_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    product_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_master(id) ON DELETE RESTRICT,
    document_type varchar(40) NOT NULL,
    document_name varchar(180) NOT NULL,
    document_url text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_cat_doc_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 58. ep_catalog.tb_ep_catalog_taxonomy_product_category_map
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_taxonomy_product_category_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    product_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_master(id) ON DELETE RESTRICT,
    category_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_cat_category_master(id) ON DELETE RESTRICT,
    is_primary boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_catalog_prod_cat_map UNIQUE (company_code, product_id, category_id),
    CONSTRAINT chk_ep_cat_tax_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 59. ep_catalog.tb_ep_catalog_review_product_review_master
CREATE TABLE IF NOT EXISTS ep_catalog.tb_ep_catalog_review_product_review_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    product_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_master(id) ON DELETE RESTRICT,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    order_item_id uuid,
    rating smallint NOT NULL,
    review_title varchar(180),
    review_text text,
    moderation_status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_cat_review_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 07: ep_inventory (12 Tables)
-- ==============================================================================

-- 60. ep_inventory.tb_ep_inventory_wh_warehouse_master
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_wh_warehouse_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    warehouse_code varchar(40) NOT NULL,
    warehouse_name varchar(150) NOT NULL,
    merchant_id uuid REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    branch_code varchar(30),
    city_code varchar(20) NOT NULL,
    warehouse_type varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_inventory_wh_code UNIQUE (company_code, warehouse_code),
    CONSTRAINT chk_ep_inv_wh_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 61. ep_inventory.tb_ep_inventory_wh_warehouse_zone_master
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_wh_warehouse_zone_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    zone_code varchar(40) NOT NULL,
    zone_name varchar(120) NOT NULL,
    zone_type varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_inventory_zone_code UNIQUE (company_code, warehouse_id, zone_code),
    CONSTRAINT chk_ep_inv_zone_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 62. ep_inventory.tb_ep_inventory_stk_stock_item_master
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_stk_stock_item_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    variant_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_variant_master(id) ON DELETE RESTRICT,
    merchant_id uuid REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    sku varchar(80) NOT NULL,
    track_batch boolean NOT NULL DEFAULT false,
    track_serial boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_inventory_stock_pos UNIQUE (company_code, warehouse_id, variant_id, merchant_id),
    CONSTRAINT chk_ep_inv_stk_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 63. ep_inventory.tb_ep_inventory_stk_stock_movement_txn
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_stk_stock_movement_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    movement_type varchar(30) NOT NULL,
    quantity numeric(18,3) NOT NULL,
    reference_type varchar(40),
    reference_id uuid,
    occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    unit_cost numeric(18,4),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_inv_mov_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 64. ep_inventory.tb_ep_inventory_stk_stock_reservation_txn
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_stk_stock_reservation_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    reservation_type varchar(30) NOT NULL,
    reference_id uuid NOT NULL,
    quantity numeric(18,3) NOT NULL,
    reserved_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    expires_at timestamptz,
    released_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_inv_res_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 65. ep_inventory.tb_ep_inventory_stk_stock_adjustment_txn
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_stk_stock_adjustment_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    adjustment_reason varchar(60) NOT NULL,
    quantity_delta numeric(18,3) NOT NULL,
    approved_by uuid,
    approved_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_inv_adj_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 66. ep_inventory.tb_ep_inventory_trf_transfer_master
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_trf_transfer_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    transfer_no varchar(60) NOT NULL,
    source_warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    destination_warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL,
    requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    dispatched_at timestamptz,
    received_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_inventory_trf_no UNIQUE (company_code, transfer_no),
    CONSTRAINT chk_ep_inv_trf_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 67. ep_inventory.tb_ep_inventory_trf_transfer_detail
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_trf_transfer_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    transfer_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_trf_transfer_master(id) ON DELETE RESTRICT,
    variant_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_variant_master(id) ON DELETE RESTRICT,
    quantity_requested numeric(18,3) NOT NULL,
    quantity_dispatched numeric(18,3),
    quantity_received numeric(18,3),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_inv_trf_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 68. ep_inventory.tb_ep_inventory_count_stock_count_master
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_count_stock_count_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    count_no varchar(60) NOT NULL,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    count_type varchar(30) NOT NULL,
    status varchar(30) NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_inventory_count_no UNIQUE (company_code, count_no),
    CONSTRAINT chk_ep_inv_count_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 69. ep_inventory.tb_ep_inventory_count_stock_count_detail
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_count_stock_count_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    stock_count_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_count_stock_count_master(id) ON DELETE RESTRICT,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    expected_qty numeric(18,3) NOT NULL,
    counted_qty numeric(18,3),
    variance_qty numeric(18,3),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_inv_count_det_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 70. ep_inventory.tb_ep_inventory_batch_inventory_batch_master
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_batch_inventory_batch_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    batch_no varchar(80) NOT NULL,
    manufactured_date date,
    expiry_date date,
    received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_inventory_batch_no UNIQUE (company_code, stock_item_id, batch_no),
    CONSTRAINT chk_ep_inv_batch_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 71. ep_inventory.tb_ep_inventory_reorder_reorder_rule_setup
CREATE TABLE IF NOT EXISTS ep_inventory.tb_ep_inventory_reorder_reorder_rule_setup (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    min_qty numeric(18,3) NOT NULL,
    max_qty numeric(18,3),
    reorder_qty numeric(18,3) NOT NULL,
    lead_time_days integer,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_inventory_reorder_rule UNIQUE (company_code, stock_item_id),
    CONSTRAINT chk_ep_inv_reorder_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 08: ep_pricing (10 Tables)
-- ==============================================================================

-- 72. ep_pricing.tb_ep_pricing_price_price_list_master
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_price_price_list_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    price_list_code varchar(40) NOT NULL,
    price_list_name varchar(120) NOT NULL,
    currency_code varchar(10) NOT NULL,
    channel_code varchar(30),
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_pricing_price_list UNIQUE (company_code, price_list_code),
    CONSTRAINT chk_ep_pricing_plist_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 73. ep_pricing.tb_ep_pricing_price_product_price_detail
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_price_product_price_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    price_list_id uuid NOT NULL REFERENCES ep_pricing.tb_ep_pricing_price_price_list_master(id) ON DELETE RESTRICT,
    listing_variant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_prd_listing_variant_master(id) ON DELETE RESTRICT,
    list_price numeric(18,4) NOT NULL,
    sale_price numeric(18,4),
    minimum_price numeric(18,4),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_pricing_price_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 74. ep_pricing.tb_ep_pricing_discount_discount_rule_master
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_discount_discount_rule_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    discount_code varchar(50) NOT NULL,
    discount_name varchar(150) NOT NULL,
    discount_type varchar(30) NOT NULL,
    value numeric(18,4) NOT NULL,
    max_discount numeric(18,4),
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_pricing_discount_code UNIQUE (company_code, discount_code),
    CONSTRAINT chk_ep_pricing_disc_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 75. ep_pricing.tb_ep_pricing_promo_promotion_master
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_promo_promotion_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    promotion_code varchar(50) NOT NULL,
    promotion_name varchar(150) NOT NULL,
    priority integer NOT NULL DEFAULT 100,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    stackable boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_pricing_promo_code UNIQUE (company_code, promotion_code),
    CONSTRAINT chk_ep_pricing_promo_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 76. ep_pricing.tb_ep_pricing_promo_promotion_condition_detail
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_promo_promotion_condition_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    promotion_id uuid NOT NULL REFERENCES ep_pricing.tb_ep_pricing_promo_promotion_master(id) ON DELETE RESTRICT,
    condition_type varchar(40) NOT NULL,
    operator varchar(20) NOT NULL,
    condition_value_json jsonb NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_pricing_pcond_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 77. ep_pricing.tb_ep_pricing_promo_promotion_reward_detail
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_promo_promotion_reward_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    promotion_id uuid NOT NULL REFERENCES ep_pricing.tb_ep_pricing_promo_promotion_master(id) ON DELETE RESTRICT,
    reward_type varchar(40) NOT NULL,
    reward_value numeric(18,4),
    reward_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_pricing_preward_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 78. ep_pricing.tb_ep_pricing_coupon_coupon_master
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_coupon_coupon_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    coupon_code varchar(60) NOT NULL,
    promotion_id uuid REFERENCES ep_pricing.tb_ep_pricing_promo_promotion_master(id) ON DELETE RESTRICT,
    max_redemptions integer,
    max_per_customer integer,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_pricing_coupon_code UNIQUE (company_code, coupon_code),
    CONSTRAINT chk_ep_pricing_coupon_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 79. ep_pricing.tb_ep_pricing_coupon_coupon_redemption_txn
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_coupon_coupon_redemption_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    coupon_id uuid NOT NULL REFERENCES ep_pricing.tb_ep_pricing_coupon_coupon_master(id) ON DELETE RESTRICT,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    order_id uuid NOT NULL,
    redeemed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    discount_amount numeric(18,4) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_pricing_redemption_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 80. ep_pricing.tb_ep_pricing_tax_tax_rule_master
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_tax_tax_rule_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    tax_rule_code varchar(40) NOT NULL,
    tax_class_code varchar(30) NOT NULL,
    country_code varchar(10) NOT NULL,
    province_code varchar(20),
    tax_rate numeric(9,6) NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_pricing_tax_rule UNIQUE (company_code, tax_rule_code),
    CONSTRAINT chk_ep_pricing_tax_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 81. ep_pricing.tb_ep_pricing_shipping_shipping_rate_rule_master
CREATE TABLE IF NOT EXISTS ep_pricing.tb_ep_pricing_shipping_shipping_rate_rule_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    rate_rule_code varchar(50) NOT NULL,
    origin_zone_code varchar(30),
    destination_zone_code varchar(30),
    service_code varchar(40),
    base_charge numeric(18,4) NOT NULL,
    per_kg_charge numeric(18,4),
    cod_charge_rule_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_pricing_ship_rule UNIQUE (company_code, rate_rule_code),
    CONSTRAINT chk_ep_pricing_ship_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 09: ep_commerce (14 Tables)
-- ==============================================================================

-- 82. ep_commerce.tb_ep_commerce_cart_cart_master
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_cart_cart_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    session_key varchar(120),
    currency_code varchar(10) NOT NULL,
    expires_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_cart_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 83. ep_commerce.tb_ep_commerce_cart_cart_item_detail
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_cart_cart_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    cart_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_cart_cart_master(id) ON DELETE RESTRICT,
    listing_variant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_prd_listing_variant_master(id) ON DELETE RESTRICT,
    quantity numeric(18,3) NOT NULL,
    unit_price_snapshot numeric(18,4),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_cart_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 84. ep_commerce.tb_ep_commerce_wishlist_wishlist_master
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_wishlist_wishlist_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    wishlist_name varchar(100) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_wish_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 85. ep_commerce.tb_ep_commerce_wishlist_wishlist_item_detail
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_wishlist_wishlist_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    wishlist_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_wishlist_wishlist_master(id) ON DELETE RESTRICT,
    listing_variant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_prd_listing_variant_master(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_commerce_wishlist_item UNIQUE (company_code, wishlist_id, listing_variant_id),
    CONSTRAINT chk_ep_comm_wish_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 86. ep_commerce.tb_ep_commerce_checkout_checkout_session
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_checkout_checkout_session (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    cart_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_cart_cart_master(id) ON DELETE RESTRICT,
    currency_code varchar(10) NOT NULL,
    pricing_snapshot_json jsonb NOT NULL,
    shipping_selection_json jsonb,
    expires_at timestamptz NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_checkout_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 87. ep_commerce.tb_ep_commerce_ord_order_master
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_no varchar(60) NOT NULL,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    currency_code varchar(10) NOT NULL,
    order_status varchar(30) NOT NULL,
    payment_status varchar(30) NOT NULL,
    fulfillment_status varchar(30) NOT NULL,
    subtotal_amount numeric(18,4) NOT NULL,
    discount_amount numeric(18,4) NOT NULL DEFAULT 0,
    shipping_amount numeric(18,4) NOT NULL DEFAULT 0,
    tax_amount numeric(18,4) NOT NULL DEFAULT 0,
    grand_total numeric(18,4) NOT NULL,
    placed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_commerce_order_no UNIQUE (company_code, order_no),
    CONSTRAINT chk_ep_comm_order_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE INDEX IF NOT EXISTS idx_ep_comm_ord_cust_placed ON ep_commerce.tb_ep_commerce_ord_order_master (company_code, customer_id, placed_at DESC);

-- 88. ep_commerce.tb_ep_commerce_ord_merchant_order_master
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_merchant_order_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    merchant_order_no varchar(70) NOT NULL,
    status varchar(30) NOT NULL,
    subtotal_amount numeric(18,4) NOT NULL,
    discount_amount numeric(18,4) NOT NULL DEFAULT 0,
    tax_amount numeric(18,4) NOT NULL DEFAULT 0,
    total_amount numeric(18,4) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_commerce_merch_ord_no UNIQUE (company_code, merchant_order_no),
    CONSTRAINT chk_ep_comm_merch_ord_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 89. ep_commerce.tb_ep_commerce_ord_order_item_detail
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    merchant_order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_merchant_order_master(id) ON DELETE RESTRICT,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    product_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_master(id) ON DELETE RESTRICT,
    variant_id uuid NOT NULL REFERENCES ep_catalog.tb_ep_catalog_prd_product_variant_master(id) ON DELETE RESTRICT,
    listing_variant_id uuid REFERENCES ep_merchant.tb_ep_merchant_prd_listing_variant_master(id) ON DELETE RESTRICT,
    product_name_snapshot varchar(220) NOT NULL,
    sku_snapshot varchar(80),
    quantity numeric(18,3) NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    discount_amount numeric(18,4) NOT NULL DEFAULT 0,
    tax_amount numeric(18,4) NOT NULL DEFAULT 0,
    line_total numeric(18,4) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_ord_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 90. ep_commerce.tb_ep_commerce_ord_order_address_snapshot
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_address_snapshot (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    address_type varchar(30) NOT NULL,
    recipient_name varchar(150) NOT NULL,
    recipient_phone varchar(30) NOT NULL,
    address_line1 varchar(200) NOT NULL,
    address_line2 varchar(200),
    city_name varchar(120) NOT NULL,
    province_name varchar(120),
    country_code varchar(10) NOT NULL,
    postal_code varchar(20),
    latitude numeric(10,7),
    longitude numeric(10,7),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_ord_addr_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 91. ep_commerce.tb_ep_commerce_ord_order_charge_detail
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_charge_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    merchant_order_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_merchant_order_master(id) ON DELETE RESTRICT,
    charge_type varchar(40) NOT NULL,
    charge_amount numeric(18,4) NOT NULL,
    tax_amount numeric(18,4) NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_ord_charge_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 92. ep_commerce.tb_ep_commerce_ord_order_discount_detail
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_discount_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    order_item_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_order_item_detail(id) ON DELETE RESTRICT,
    discount_type varchar(40) NOT NULL,
    promotion_id uuid,
    coupon_id uuid,
    discount_amount numeric(18,4) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_ord_disc_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 93. ep_commerce.tb_ep_commerce_ord_order_status_history
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    merchant_order_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_merchant_order_master(id) ON DELETE RESTRICT,
    from_status varchar(30),
    to_status varchar(30) NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    changed_by uuid,
    reason varchar(500),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_ord_hist_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 94. ep_commerce.tb_ep_commerce_ord_order_note_detail
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_note_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    note_type varchar(30) NOT NULL,
    note_text text NOT NULL,
    visibility varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_ord_note_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 95. ep_commerce.tb_ep_commerce_ord_order_cancellation_txn
CREATE TABLE IF NOT EXISTS ep_commerce.tb_ep_commerce_ord_order_cancellation_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    merchant_order_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_merchant_order_master(id) ON DELETE RESTRICT,
    order_item_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_order_item_detail(id) ON DELETE RESTRICT,
    requested_by_type varchar(30) NOT NULL,
    reason_code varchar(40) NOT NULL,
    reason_text text,
    status varchar(30) NOT NULL,
    approved_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comm_ord_cancel_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 10: ep_payment (7 Tables)
-- ==============================================================================

-- 96. ep_payment.tb_ep_payment_provider_provider_master
CREATE TABLE IF NOT EXISTS ep_payment.tb_ep_payment_provider_provider_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    provider_code varchar(40) NOT NULL,
    provider_name varchar(120) NOT NULL,
    provider_type varchar(30) NOT NULL,
    supports_refund boolean NOT NULL DEFAULT false,
    supports_webhook boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_payment_provider_code UNIQUE (company_code, provider_code),
    CONSTRAINT chk_ep_pay_provider_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 97. ep_payment.tb_ep_payment_intent_payment_intent_master
CREATE TABLE IF NOT EXISTS ep_payment.tb_ep_payment_intent_payment_intent_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    payment_intent_no varchar(70) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    provider_id uuid NOT NULL REFERENCES ep_payment.tb_ep_payment_provider_provider_master(id) ON DELETE RESTRICT,
    amount numeric(18,4) NOT NULL,
    currency_code varchar(10) NOT NULL,
    status varchar(30) NOT NULL,
    provider_reference varchar(200),
    expires_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_payment_intent_no UNIQUE (company_code, payment_intent_no),
    CONSTRAINT chk_ep_pay_intent_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 98. ep_payment.tb_ep_payment_txn_payment_transaction_txn
CREATE TABLE IF NOT EXISTS ep_payment.tb_ep_payment_txn_payment_transaction_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    payment_intent_id uuid NOT NULL REFERENCES ep_payment.tb_ep_payment_intent_payment_intent_master(id) ON DELETE RESTRICT,
    transaction_type varchar(30) NOT NULL,
    amount numeric(18,4) NOT NULL,
    currency_code varchar(10) NOT NULL,
    status varchar(30) NOT NULL,
    provider_transaction_id varchar(200),
    provider_response_json jsonb,
    processed_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_pay_txn_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 99. ep_payment.tb_ep_payment_refund_refund_master
CREATE TABLE IF NOT EXISTS ep_payment.tb_ep_payment_refund_refund_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    refund_no varchar(70) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    payment_intent_id uuid NOT NULL REFERENCES ep_payment.tb_ep_payment_intent_payment_intent_master(id) ON DELETE RESTRICT,
    amount numeric(18,4) NOT NULL,
    reason_code varchar(40) NOT NULL,
    status varchar(30) NOT NULL,
    requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_payment_refund_no UNIQUE (company_code, refund_no),
    CONSTRAINT chk_ep_pay_refund_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 100. ep_payment.tb_ep_payment_refund_refund_transaction_txn
CREATE TABLE IF NOT EXISTS ep_payment.tb_ep_payment_refund_refund_transaction_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    refund_id uuid NOT NULL REFERENCES ep_payment.tb_ep_payment_refund_refund_master(id) ON DELETE RESTRICT,
    provider_transaction_id varchar(200),
    status varchar(30) NOT NULL,
    amount numeric(18,4) NOT NULL,
    processed_at timestamptz,
    provider_response_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_pay_refund_txn_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 101. ep_payment.tb_ep_payment_cod_cod_receivable_master
CREATE TABLE IF NOT EXISTS ep_payment.tb_ep_payment_cod_cod_receivable_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    shipment_id uuid NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    cod_amount numeric(18,4) NOT NULL,
    collection_status varchar(30) NOT NULL,
    collected_at timestamptz,
    collector_type varchar(30),
    collector_id uuid,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_pay_cod_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 102. ep_payment.tb_ep_payment_webhook_payment_webhook_event
CREATE TABLE IF NOT EXISTS ep_payment.tb_ep_payment_webhook_payment_webhook_event (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    provider_id uuid NOT NULL REFERENCES ep_payment.tb_ep_payment_provider_provider_master(id) ON DELETE RESTRICT,
    external_event_id varchar(200) NOT NULL,
    event_type varchar(80) NOT NULL,
    payload_json jsonb NOT NULL,
    received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    processed_at timestamptz,
    processing_status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_payment_webhook_evt UNIQUE (company_code, provider_id, external_event_id),
    CONSTRAINT chk_ep_pay_webhook_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 11: ep_finance (9 Tables)
-- ==============================================================================

-- 103. ep_finance.tb_ep_finance_ledger_account_master
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_ledger_account_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    account_code varchar(50) NOT NULL,
    account_name varchar(160) NOT NULL,
    account_type varchar(30) NOT NULL,
    parent_account_id uuid REFERENCES ep_finance.tb_ep_finance_ledger_account_master(id) ON DELETE RESTRICT,
    currency_code varchar(10),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_finance_account_code UNIQUE (company_code, account_code),
    CONSTRAINT chk_ep_fin_acct_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 104. ep_finance.tb_ep_finance_journal_journal_master
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_journal_journal_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    journal_no varchar(70) NOT NULL,
    journal_type varchar(30) NOT NULL,
    reference_type varchar(40),
    reference_id uuid,
    journal_date date NOT NULL,
    description varchar(300),
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_finance_journal_no UNIQUE (company_code, journal_no),
    CONSTRAINT chk_ep_fin_jrnl_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 105. ep_finance.tb_ep_finance_journal_journal_line_detail
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_journal_journal_line_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    journal_id uuid NOT NULL REFERENCES ep_finance.tb_ep_finance_journal_journal_master(id) ON DELETE RESTRICT,
    account_id uuid NOT NULL REFERENCES ep_finance.tb_ep_finance_ledger_account_master(id) ON DELETE RESTRICT,
    merchant_id uuid REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    customer_id uuid REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    debit_amount numeric(18,4) NOT NULL DEFAULT 0,
    credit_amount numeric(18,4) NOT NULL DEFAULT 0,
    currency_code varchar(10) NOT NULL,
    memo varchar(300),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_fin_jrnl_line_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 106. ep_finance.tb_ep_finance_settlement_merchant_settlement_master
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_settlement_merchant_settlement_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    settlement_no varchar(70) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    period_from date NOT NULL,
    period_to date NOT NULL,
    gross_sales numeric(18,4) NOT NULL,
    commission_amount numeric(18,4) NOT NULL,
    refund_amount numeric(18,4) NOT NULL DEFAULT 0,
    shipping_amount numeric(18,4) NOT NULL DEFAULT 0,
    tax_amount numeric(18,4) NOT NULL DEFAULT 0,
    net_payable numeric(18,4) NOT NULL,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_finance_settle_no UNIQUE (company_code, settlement_no),
    CONSTRAINT chk_ep_fin_settle_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 107. ep_finance.tb_ep_finance_settlement_settlement_item_detail
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_settlement_settlement_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    settlement_id uuid NOT NULL REFERENCES ep_finance.tb_ep_finance_settlement_merchant_settlement_master(id) ON DELETE RESTRICT,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    merchant_order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_merchant_order_master(id) ON DELETE RESTRICT,
    component_type varchar(40) NOT NULL,
    amount numeric(18,4) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_fin_settle_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 108. ep_finance.tb_ep_finance_payout_merchant_payout_master
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_payout_merchant_payout_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    payout_no varchar(70) NOT NULL,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    settlement_id uuid NOT NULL REFERENCES ep_finance.tb_ep_finance_settlement_merchant_settlement_master(id) ON DELETE RESTRICT,
    bank_account_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_bank_bank_account_master(id) ON DELETE RESTRICT,
    amount numeric(18,4) NOT NULL,
    status varchar(30) NOT NULL,
    requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    paid_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_finance_payout_no UNIQUE (company_code, payout_no),
    CONSTRAINT chk_ep_fin_payout_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 109. ep_finance.tb_ep_finance_payout_payout_transaction_txn
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_payout_payout_transaction_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    payout_id uuid NOT NULL REFERENCES ep_finance.tb_ep_finance_payout_merchant_payout_master(id) ON DELETE RESTRICT,
    provider_reference varchar(200),
    amount numeric(18,4) NOT NULL,
    status varchar(30) NOT NULL,
    processed_at timestamptz,
    response_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_fin_payout_txn_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 110. ep_finance.tb_ep_finance_commission_commission_rule_master
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_commission_commission_rule_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    commission_rule_code varchar(50) NOT NULL,
    commission_type varchar(30) NOT NULL,
    basis_type varchar(30) NOT NULL,
    rate numeric(18,6),
    fixed_amount numeric(18,4),
    valid_from date NOT NULL,
    valid_to date,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_finance_comm_rule UNIQUE (company_code, commission_rule_code),
    CONSTRAINT chk_ep_fin_comm_rule_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 111. ep_finance.tb_ep_finance_commission_commission_entry_txn
CREATE TABLE IF NOT EXISTS ep_finance.tb_ep_finance_commission_commission_entry_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    commission_rule_id uuid NOT NULL REFERENCES ep_finance.tb_ep_finance_commission_commission_rule_master(id) ON DELETE RESTRICT,
    beneficiary_type varchar(30) NOT NULL,
    beneficiary_id uuid NOT NULL,
    order_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    order_item_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_order_item_detail(id) ON DELETE RESTRICT,
    amount numeric(18,4) NOT NULL,
    status varchar(30) NOT NULL,
    earned_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_fin_comm_entry_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 12: ep_fulfillment (7 Tables)
-- ==============================================================================

-- 112. ep_fulfillment.tb_ep_fulfillment_alloc_stock_allocation_master
CREATE TABLE IF NOT EXISTS ep_fulfillment.tb_ep_fulfillment_alloc_stock_allocation_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    order_item_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_item_detail(id) ON DELETE RESTRICT,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    quantity numeric(18,3) NOT NULL,
    reservation_id uuid REFERENCES ep_inventory.tb_ep_inventory_stk_stock_reservation_txn(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_ful_alloc_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 113. ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master
CREATE TABLE IF NOT EXISTS ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    fulfillment_no varchar(70) NOT NULL,
    merchant_order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_merchant_order_master(id) ON DELETE RESTRICT,
    merchant_id uuid NOT NULL REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL,
    started_at timestamptz,
    ready_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_fulfillment_ful_no UNIQUE (company_code, fulfillment_no),
    CONSTRAINT chk_ep_ful_master_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 114. ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_item_detail
CREATE TABLE IF NOT EXISTS ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fulfillment_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master(id) ON DELETE RESTRICT,
    order_item_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_item_detail(id) ON DELETE RESTRICT,
    quantity numeric(18,3) NOT NULL,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_ful_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 115. ep_fulfillment.tb_ep_fulfillment_pick_pick_list_master
CREATE TABLE IF NOT EXISTS ep_fulfillment.tb_ep_fulfillment_pick_pick_list_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    pick_list_no varchar(70) NOT NULL,
    fulfillment_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master(id) ON DELETE RESTRICT,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    assigned_user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_fulfillment_pick_no UNIQUE (company_code, pick_list_no),
    CONSTRAINT chk_ep_ful_pick_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 116. ep_fulfillment.tb_ep_fulfillment_pick_pick_list_item_detail
CREATE TABLE IF NOT EXISTS ep_fulfillment.tb_ep_fulfillment_pick_pick_list_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    pick_list_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_pick_pick_list_master(id) ON DELETE RESTRICT,
    fulfillment_item_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_item_detail(id) ON DELETE RESTRICT,
    stock_item_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_stk_stock_item_master(id) ON DELETE RESTRICT,
    zone_id uuid REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_zone_master(id) ON DELETE RESTRICT,
    quantity_required numeric(18,3) NOT NULL,
    quantity_picked numeric(18,3) DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_ful_pick_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 117. ep_fulfillment.tb_ep_fulfillment_pkg_package_master
CREATE TABLE IF NOT EXISTS ep_fulfillment.tb_ep_fulfillment_pkg_package_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    package_no varchar(70) NOT NULL,
    fulfillment_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master(id) ON DELETE RESTRICT,
    package_type varchar(30),
    weight_kg numeric(12,3),
    length_cm numeric(12,2),
    width_cm numeric(12,2),
    height_cm numeric(12,2),
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_fulfillment_pkg_no UNIQUE (company_code, package_no),
    CONSTRAINT chk_ep_ful_pkg_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 118. ep_fulfillment.tb_ep_fulfillment_pkg_package_item_detail
CREATE TABLE IF NOT EXISTS ep_fulfillment.tb_ep_fulfillment_pkg_package_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    package_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_pkg_package_master(id) ON DELETE RESTRICT,
    order_item_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_item_detail(id) ON DELETE RESTRICT,
    quantity numeric(18,3) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_ful_pkg_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 13: ep_logistics (17 Tables)
-- ==============================================================================

-- 119. ep_logistics.tb_ep_logistics_carrier_carrier_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_carrier_carrier_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    carrier_code varchar(40) NOT NULL,
    carrier_name varchar(150) NOT NULL,
    carrier_type varchar(30) NOT NULL,
    integration_provider_code varchar(50),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_carrier_code UNIQUE (company_code, carrier_code),
    CONSTRAINT chk_ep_log_carrier_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 120. ep_logistics.tb_ep_logistics_carrier_service_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_carrier_service_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    carrier_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_carrier_carrier_master(id) ON DELETE RESTRICT,
    service_code varchar(40) NOT NULL,
    service_name varchar(120) NOT NULL,
    service_type varchar(30) NOT NULL,
    supports_cod boolean NOT NULL DEFAULT false,
    supports_reverse boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_carrier_svc UNIQUE (company_code, carrier_id, service_code),
    CONSTRAINT chk_ep_log_carrier_svc_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 121. ep_logistics.tb_ep_logistics_rate_shipment_rate_quote
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_rate_shipment_rate_quote (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    order_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    package_id uuid REFERENCES ep_fulfillment.tb_ep_fulfillment_pkg_package_master(id) ON DELETE RESTRICT,
    carrier_service_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_carrier_service_master(id) ON DELETE RESTRICT,
    quoted_amount numeric(18,4) NOT NULL,
    currency_code varchar(10) NOT NULL,
    estimated_days integer,
    expires_at timestamptz,
    quote_payload_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_log_quote_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 122. ep_logistics.tb_ep_logistics_shp_shipment_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_shp_shipment_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    shipment_no varchar(70) NOT NULL,
    fulfillment_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_ful_fulfillment_master(id) ON DELETE RESTRICT,
    carrier_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_carrier_carrier_master(id) ON DELETE RESTRICT,
    carrier_service_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_carrier_service_master(id) ON DELETE RESTRICT,
    tracking_no varchar(120),
    status varchar(30) NOT NULL,
    cod_amount numeric(18,4) NOT NULL DEFAULT 0,
    declared_value numeric(18,4),
    shipped_at timestamptz,
    delivered_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_shipment_no UNIQUE (company_code, shipment_no),
    CONSTRAINT chk_ep_log_shp_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE INDEX IF NOT EXISTS idx_ep_log_shp_tracking ON ep_logistics.tb_ep_logistics_shp_shipment_master (company_code, tracking_no);

-- 123. ep_logistics.tb_ep_logistics_shp_shipment_package_map
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_shp_shipment_package_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    shipment_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    package_id uuid NOT NULL REFERENCES ep_fulfillment.tb_ep_fulfillment_pkg_package_master(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_shp_pkg UNIQUE (company_code, shipment_id, package_id),
    CONSTRAINT chk_ep_log_shp_pkg_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 124. ep_logistics.tb_ep_logistics_label_shipment_label_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_label_shipment_label_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    shipment_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    label_type varchar(30) NOT NULL,
    label_url text NOT NULL,
    label_format varchar(20) NOT NULL,
    generated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_log_label_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 125. ep_logistics.tb_ep_logistics_track_tracking_event_txn
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_track_tracking_event_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    shipment_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    event_code varchar(50) NOT NULL,
    event_status varchar(30) NOT NULL,
    event_time timestamptz NOT NULL DEFAULT clock_timestamp(),
    location_text varchar(200),
    city_code varchar(20),
    source varchar(30) NOT NULL,
    external_event_id varchar(160),
    remarks text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_log_track_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE INDEX IF NOT EXISTS idx_ep_log_track_shp_time ON ep_logistics.tb_ep_logistics_track_tracking_event_txn (company_code, shipment_id, event_time DESC);

-- 126. ep_logistics.tb_ep_logistics_pickup_pickup_request_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_pickup_pickup_request_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    pickup_no varchar(70) NOT NULL,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    carrier_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_carrier_carrier_master(id) ON DELETE RESTRICT,
    requested_date date NOT NULL,
    time_window_from time,
    time_window_to time,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_pickup_no UNIQUE (company_code, pickup_no),
    CONSTRAINT chk_ep_log_pickup_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 127. ep_logistics.tb_ep_logistics_hub_hub_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_hub_hub_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    hub_code varchar(40) NOT NULL,
    hub_name varchar(150) NOT NULL,
    branch_code varchar(30),
    city_code varchar(20) NOT NULL,
    hub_type varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_hub_code UNIQUE (company_code, hub_code),
    CONSTRAINT chk_ep_log_hub_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 128. ep_logistics.tb_ep_logistics_route_route_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_route_route_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    route_code varchar(50) NOT NULL,
    route_name varchar(150) NOT NULL,
    origin_hub_id uuid REFERENCES ep_logistics.tb_ep_logistics_hub_hub_master(id) ON DELETE RESTRICT,
    destination_hub_id uuid REFERENCES ep_logistics.tb_ep_logistics_hub_hub_master(id) ON DELETE RESTRICT,
    route_type varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_route_code UNIQUE (company_code, route_code),
    CONSTRAINT chk_ep_log_route_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 129. ep_logistics.tb_ep_logistics_bag_bag_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_bag_bag_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    bag_no varchar(70) NOT NULL,
    origin_hub_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_hub_hub_master(id) ON DELETE RESTRICT,
    destination_hub_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_hub_hub_master(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL,
    closed_at timestamptz,
    opened_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_bag_no UNIQUE (company_code, bag_no),
    CONSTRAINT chk_ep_log_bag_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 130. ep_logistics.tb_ep_logistics_bag_bag_item_detail
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_bag_bag_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    bag_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_bag_bag_master(id) ON DELETE RESTRICT,
    shipment_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    added_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    removed_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_log_bag_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 131. ep_logistics.tb_ep_logistics_manifest_manifest_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_manifest_manifest_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    manifest_no varchar(70) NOT NULL,
    route_id uuid REFERENCES ep_logistics.tb_ep_logistics_route_route_master(id) ON DELETE RESTRICT,
    origin_hub_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_hub_hub_master(id) ON DELETE RESTRICT,
    destination_hub_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_hub_hub_master(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL,
    departed_at timestamptz,
    arrived_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_manifest_no UNIQUE (company_code, manifest_no),
    CONSTRAINT chk_ep_log_manifest_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 132. ep_logistics.tb_ep_logistics_manifest_manifest_item_detail
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_manifest_manifest_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    manifest_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_manifest_manifest_master(id) ON DELETE RESTRICT,
    bag_id uuid REFERENCES ep_logistics.tb_ep_logistics_bag_bag_master(id) ON DELETE RESTRICT,
    shipment_id uuid REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_log_mnf_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 133. ep_logistics.tb_ep_logistics_rider_rider_master
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_rider_rider_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    rider_code varchar(40) NOT NULL,
    user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    carrier_id uuid REFERENCES ep_logistics.tb_ep_logistics_carrier_carrier_master(id) ON DELETE RESTRICT,
    branch_code varchar(30),
    vehicle_type varchar(30),
    license_no varchar(80),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_logistics_rider_code UNIQUE (company_code, rider_code),
    CONSTRAINT chk_ep_log_rider_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 134. ep_logistics.tb_ep_logistics_rider_rider_assignment_txn
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_rider_rider_assignment_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    rider_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_rider_rider_master(id) ON DELETE RESTRICT,
    shipment_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    route_id uuid REFERENCES ep_logistics.tb_ep_logistics_route_route_master(id) ON DELETE RESTRICT,
    assigned_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    accepted_at timestamptz,
    completed_at timestamptz,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_log_rider_assign_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 135. ep_logistics.tb_ep_logistics_pod_proof_of_delivery_txn
CREATE TABLE IF NOT EXISTS ep_logistics.tb_ep_logistics_pod_proof_of_delivery_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    shipment_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    rider_id uuid REFERENCES ep_logistics.tb_ep_logistics_rider_rider_master(id) ON DELETE RESTRICT,
    pod_type varchar(30) NOT NULL,
    recipient_name varchar(150),
    proof_url text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    captured_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    remarks text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_log_pod_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 14: ep_returns (6 Tables)
-- ==============================================================================

-- 136. ep_returns.tb_ep_returns_reason_return_reason_master
CREATE TABLE IF NOT EXISTS ep_returns.tb_ep_returns_reason_return_reason_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    reason_code varchar(40) NOT NULL,
    reason_name varchar(120) NOT NULL,
    customer_visible boolean NOT NULL DEFAULT true,
    requires_evidence boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_returns_reason_code UNIQUE (company_code, reason_code),
    CONSTRAINT chk_ep_ret_reason_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 137. ep_returns.tb_ep_returns_req_return_request_master
CREATE TABLE IF NOT EXISTS ep_returns.tb_ep_returns_req_return_request_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    return_no varchar(70) NOT NULL,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    customer_id uuid NOT NULL REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    status varchar(30) NOT NULL,
    requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    resolution_type varchar(30),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_returns_return_no UNIQUE (company_code, return_no),
    CONSTRAINT chk_ep_ret_req_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 138. ep_returns.tb_ep_returns_req_return_item_detail
CREATE TABLE IF NOT EXISTS ep_returns.tb_ep_returns_req_return_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    return_id uuid NOT NULL REFERENCES ep_returns.tb_ep_returns_req_return_request_master(id) ON DELETE RESTRICT,
    order_item_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_item_detail(id) ON DELETE RESTRICT,
    reason_id uuid NOT NULL REFERENCES ep_returns.tb_ep_returns_reason_return_reason_master(id) ON DELETE RESTRICT,
    quantity numeric(18,3) NOT NULL,
    customer_note text,
    evidence_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_ret_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 139. ep_returns.tb_ep_returns_inspect_return_inspection_txn
CREATE TABLE IF NOT EXISTS ep_returns.tb_ep_returns_inspect_return_inspection_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    return_item_id uuid NOT NULL REFERENCES ep_returns.tb_ep_returns_req_return_item_detail(id) ON DELETE RESTRICT,
    inspected_by uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    condition_code varchar(40) NOT NULL,
    decision varchar(30) NOT NULL,
    remarks text,
    inspected_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_ret_inspect_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 140. ep_returns.tb_ep_returns_reverse_reverse_shipment_map
CREATE TABLE IF NOT EXISTS ep_returns.tb_ep_returns_reverse_reverse_shipment_map (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    return_id uuid NOT NULL REFERENCES ep_returns.tb_ep_returns_req_return_request_master(id) ON DELETE RESTRICT,
    shipment_id uuid NOT NULL REFERENCES ep_logistics.tb_ep_logistics_shp_shipment_master(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_returns_rev_shp_map UNIQUE (company_code, return_id, shipment_id),
    CONSTRAINT chk_ep_ret_rev_shp_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 141. ep_returns.tb_ep_returns_stock_restock_action_txn
CREATE TABLE IF NOT EXISTS ep_returns.tb_ep_returns_stock_restock_action_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    return_item_id uuid NOT NULL REFERENCES ep_returns.tb_ep_returns_req_return_item_detail(id) ON DELETE RESTRICT,
    warehouse_id uuid NOT NULL REFERENCES ep_inventory.tb_ep_inventory_wh_warehouse_master(id) ON DELETE RESTRICT,
    action_type varchar(30) NOT NULL,
    quantity numeric(18,3) NOT NULL,
    stock_movement_id uuid REFERENCES ep_inventory.tb_ep_inventory_stk_stock_movement_txn(id) ON DELETE RESTRICT,
    processed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_ret_restock_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 15: ep_growth (7 Tables)
-- ==============================================================================

-- 142. ep_growth.tb_ep_growth_agent_agent_master
CREATE TABLE IF NOT EXISTS ep_growth.tb_ep_growth_agent_agent_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    agent_code varchar(40) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    agent_type varchar(30) NOT NULL,
    city_code varchar(20),
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_growth_agent_code UNIQUE (company_code, agent_code),
    CONSTRAINT chk_ep_growth_agent_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 143. ep_growth.tb_ep_growth_influencer_influencer_master
CREATE TABLE IF NOT EXISTS ep_growth.tb_ep_growth_influencer_influencer_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    influencer_code varchar(40) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    display_name varchar(150) NOT NULL,
    platforms_json jsonb,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_growth_influencer_code UNIQUE (company_code, influencer_code),
    CONSTRAINT chk_ep_growth_influencer_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 144. ep_growth.tb_ep_growth_campaign_campaign_master
CREATE TABLE IF NOT EXISTS ep_growth.tb_ep_growth_campaign_campaign_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    campaign_code varchar(50) NOT NULL,
    campaign_name varchar(150) NOT NULL,
    campaign_type varchar(30) NOT NULL,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    budget_amount numeric(18,4),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_growth_camp_code UNIQUE (company_code, campaign_code),
    CONSTRAINT chk_ep_growth_camp_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 145. ep_growth.tb_ep_growth_referral_referral_code_master
CREATE TABLE IF NOT EXISTS ep_growth.tb_ep_growth_referral_referral_code_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    referral_code varchar(60) NOT NULL,
    campaign_id uuid REFERENCES ep_growth.tb_ep_growth_campaign_campaign_master(id) ON DELETE RESTRICT,
    owner_type varchar(30) NOT NULL,
    owner_id uuid NOT NULL,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_growth_ref_code UNIQUE (company_code, referral_code),
    CONSTRAINT chk_ep_growth_ref_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 146. ep_growth.tb_ep_growth_track_tracking_link_master
CREATE TABLE IF NOT EXISTS ep_growth.tb_ep_growth_track_tracking_link_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    link_code varchar(60) NOT NULL,
    campaign_id uuid REFERENCES ep_growth.tb_ep_growth_campaign_campaign_master(id) ON DELETE RESTRICT,
    owner_type varchar(30),
    owner_id uuid,
    target_url text NOT NULL,
    utm_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_growth_link_code UNIQUE (company_code, link_code),
    CONSTRAINT chk_ep_growth_link_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 147. ep_growth.tb_ep_growth_attr_attribution_txn
CREATE TABLE IF NOT EXISTS ep_growth.tb_ep_growth_attr_attribution_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    customer_id uuid REFERENCES ep_customer.tb_ep_customer_profile_customer_master(id) ON DELETE RESTRICT,
    order_id uuid REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    campaign_id uuid REFERENCES ep_growth.tb_ep_growth_campaign_campaign_master(id) ON DELETE RESTRICT,
    referral_code_id uuid REFERENCES ep_growth.tb_ep_growth_referral_referral_code_master(id) ON DELETE RESTRICT,
    attributed_owner_type varchar(30),
    attributed_owner_id uuid,
    attributed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    model varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_growth_attr_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 148. ep_growth.tb_ep_growth_commission_commission_event_txn
CREATE TABLE IF NOT EXISTS ep_growth.tb_ep_growth_commission_commission_event_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    fiscal_year_code varchar(20) NOT NULL,
    attribution_id uuid NOT NULL REFERENCES ep_growth.tb_ep_growth_attr_attribution_txn(id) ON DELETE RESTRICT,
    order_id uuid NOT NULL REFERENCES ep_commerce.tb_ep_commerce_ord_order_master(id) ON DELETE RESTRICT,
    beneficiary_type varchar(30) NOT NULL,
    beneficiary_id uuid NOT NULL,
    eligible_amount numeric(18,4) NOT NULL,
    commission_amount numeric(18,4) NOT NULL,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_growth_comm_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 16: ep_content (5 Tables)
-- ==============================================================================

-- 149. ep_content.tb_ep_content_page_page_master
CREATE TABLE IF NOT EXISTS ep_content.tb_ep_content_page_page_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    page_code varchar(50) NOT NULL,
    page_title varchar(180) NOT NULL,
    slug varchar(180) NOT NULL,
    page_type varchar(30) NOT NULL,
    content_json jsonb NOT NULL,
    seo_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_content_page_code UNIQUE (company_code, page_code),
    CONSTRAINT uq_ep_content_page_slug UNIQUE (company_code, slug),
    CONSTRAINT chk_ep_content_page_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 150. ep_content.tb_ep_content_banner_banner_master
CREATE TABLE IF NOT EXISTS ep_content.tb_ep_content_banner_banner_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    banner_code varchar(50) NOT NULL,
    banner_name varchar(150) NOT NULL,
    placement_code varchar(50) NOT NULL,
    image_url text NOT NULL,
    target_url text,
    valid_from timestamptz,
    valid_to timestamptz,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_content_banner_code UNIQUE (company_code, banner_code),
    CONSTRAINT chk_ep_content_banner_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 151. ep_content.tb_ep_content_menu_menu_master
CREATE TABLE IF NOT EXISTS ep_content.tb_ep_content_menu_menu_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    menu_code varchar(50) NOT NULL,
    menu_name varchar(120) NOT NULL,
    channel_code varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_content_menu_code UNIQUE (company_code, menu_code),
    CONSTRAINT chk_ep_content_menu_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 152. ep_content.tb_ep_content_menu_menu_item_detail
CREATE TABLE IF NOT EXISTS ep_content.tb_ep_content_menu_menu_item_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    menu_id uuid NOT NULL REFERENCES ep_content.tb_ep_content_menu_menu_master(id) ON DELETE RESTRICT,
    parent_item_id uuid REFERENCES ep_content.tb_ep_content_menu_menu_item_detail(id) ON DELETE RESTRICT,
    label varchar(120) NOT NULL,
    target_type varchar(30) NOT NULL,
    target_value text,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_content_menu_item_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 153. ep_content.tb_ep_content_faq_faq_master
CREATE TABLE IF NOT EXISTS ep_content.tb_ep_content_faq_faq_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    faq_code varchar(50) NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    audience_type varchar(30) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_content_faq_code UNIQUE (company_code, faq_code),
    CONSTRAINT chk_ep_content_faq_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 17: ep_comms (5 Tables)
-- ==============================================================================

-- 154. ep_comms.tb_ep_comms_template_template_master
CREATE TABLE IF NOT EXISTS ep_comms.tb_ep_comms_template_template_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    template_code varchar(60) NOT NULL,
    communication_type varchar(20) NOT NULL,
    template_name varchar(120) NOT NULL,
    subject_template varchar(250),
    body_template text NOT NULL,
    language_code varchar(10),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_comms_template_code UNIQUE (company_code, template_code),
    CONSTRAINT chk_ep_comms_template_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 155. ep_comms.tb_ep_comms_notify_notification_master
CREATE TABLE IF NOT EXISTS ep_comms.tb_ep_comms_notify_notification_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    template_id uuid REFERENCES ep_comms.tb_ep_comms_template_template_master(id) ON DELETE RESTRICT,
    notification_type varchar(30) NOT NULL,
    reference_type varchar(40),
    reference_id uuid,
    title varchar(250),
    body text NOT NULL,
    scheduled_at timestamptz,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comms_notify_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 156. ep_comms.tb_ep_comms_notify_notification_recipient_detail
CREATE TABLE IF NOT EXISTS ep_comms.tb_ep_comms_notify_notification_recipient_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    notification_id uuid NOT NULL REFERENCES ep_comms.tb_ep_comms_notify_notification_master(id) ON DELETE RESTRICT,
    user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    recipient_address varchar(200),
    communication_type varchar(20) NOT NULL,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comms_recip_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 157. ep_comms.tb_ep_comms_delivery_delivery_attempt_txn
CREATE TABLE IF NOT EXISTS ep_comms.tb_ep_comms_delivery_delivery_attempt_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    notification_recipient_id uuid NOT NULL REFERENCES ep_comms.tb_ep_comms_notify_notification_recipient_detail(id) ON DELETE RESTRICT,
    provider_code varchar(40) NOT NULL,
    attempt_no integer NOT NULL DEFAULT 1,
    status varchar(30) NOT NULL,
    provider_message_id varchar(200),
    response_json jsonb,
    attempted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_comms_attempt_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 158. ep_comms.tb_ep_comms_pref_user_channel_preference
CREATE TABLE IF NOT EXISTS ep_comms.tb_ep_comms_pref_user_channel_preference (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    communication_type varchar(20) NOT NULL,
    purpose_code varchar(40) NOT NULL,
    opted_in boolean NOT NULL DEFAULT true,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_comms_user_pref UNIQUE (company_code, user_id, communication_type, purpose_code),
    CONSTRAINT chk_ep_comms_pref_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 18: ep_integration (7 Tables)
-- ==============================================================================

-- 159. ep_integration.tb_ep_integration_provider_provider_connection_master
CREATE TABLE IF NOT EXISTS ep_integration.tb_ep_integration_provider_provider_connection_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    connection_code varchar(50) NOT NULL,
    provider_type varchar(30) NOT NULL,
    provider_code varchar(50) NOT NULL,
    base_url text,
    credential_reference varchar(250),
    configuration_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_integration_conn_code UNIQUE (company_code, connection_code),
    CONSTRAINT chk_ep_int_conn_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 160. ep_integration.tb_ep_integration_outbox_outbox_event_queue
CREATE TABLE IF NOT EXISTS ep_integration.tb_ep_integration_outbox_outbox_event_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    event_id uuid NOT NULL,
    aggregate_type varchar(50) NOT NULL,
    aggregate_id uuid NOT NULL,
    event_type varchar(80) NOT NULL,
    payload_json jsonb NOT NULL,
    occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    published_at timestamptz,
    attempt_count integer NOT NULL DEFAULT 0,
    last_error text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_integration_outbox_evt UNIQUE (company_code, event_id),
    CONSTRAINT chk_ep_int_outbox_act_pub CHECK (NOT (active = false AND publish = true))
);
CREATE INDEX IF NOT EXISTS idx_ep_int_outbox_poll ON ep_integration.tb_ep_integration_outbox_outbox_event_queue (company_code, published_at, occurred_at);

-- 161. ep_integration.tb_ep_integration_inbox_inbox_event_log
CREATE TABLE IF NOT EXISTS ep_integration.tb_ep_integration_inbox_inbox_event_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    source_code varchar(50) NOT NULL,
    external_event_id varchar(200) NOT NULL,
    event_type varchar(80) NOT NULL,
    payload_hash varchar(128),
    received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    processed_at timestamptz,
    status varchar(30) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_integration_inbox_evt UNIQUE (company_code, source_code, external_event_id),
    CONSTRAINT chk_ep_int_inbox_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 162. ep_integration.tb_ep_integration_webhook_webhook_subscription_master
CREATE TABLE IF NOT EXISTS ep_integration.tb_ep_integration_webhook_webhook_subscription_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    subscription_code varchar(50) NOT NULL,
    subscriber_name varchar(120) NOT NULL,
    endpoint_url text NOT NULL,
    secret_reference varchar(250),
    event_types_json jsonb NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_integration_sub_code UNIQUE (company_code, subscription_code),
    CONSTRAINT chk_ep_int_sub_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 163. ep_integration.tb_ep_integration_webhook_webhook_delivery_queue
CREATE TABLE IF NOT EXISTS ep_integration.tb_ep_integration_webhook_webhook_delivery_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    subscription_id uuid NOT NULL REFERENCES ep_integration.tb_ep_integration_webhook_webhook_subscription_master(id) ON DELETE RESTRICT,
    event_id uuid NOT NULL,
    payload_json jsonb NOT NULL,
    attempt_count integer NOT NULL DEFAULT 0,
    next_attempt_at timestamptz,
    last_status_code integer,
    last_error text,
    delivered_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_int_hook_queue_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 164. ep_integration.tb_ep_integration_job_import_job_master
CREATE TABLE IF NOT EXISTS ep_integration.tb_ep_integration_job_import_job_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    job_no varchar(70) NOT NULL,
    import_type varchar(40) NOT NULL,
    source_file_url text NOT NULL,
    status varchar(30) NOT NULL,
    total_rows integer,
    success_rows integer,
    error_rows integer,
    started_at timestamptz,
    completed_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_integration_import_job UNIQUE (company_code, job_no),
    CONSTRAINT chk_ep_int_import_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 165. ep_integration.tb_ep_integration_job_export_job_master
CREATE TABLE IF NOT EXISTS ep_integration.tb_ep_integration_job_export_job_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    job_no varchar(70) NOT NULL,
    export_type varchar(40) NOT NULL,
    filter_json jsonb,
    status varchar(30) NOT NULL,
    output_file_url text,
    started_at timestamptz,
    completed_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_integration_export_job UNIQUE (company_code, job_no),
    CONSTRAINT chk_ep_int_export_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 19: ep_support (4 Tables)
-- ==============================================================================

-- 166. ep_support.tb_ep_support_ticket_ticket_master
CREATE TABLE IF NOT EXISTS ep_support.tb_ep_support_ticket_ticket_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    ticket_no varchar(70) NOT NULL,
    requester_user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    requester_type varchar(30) NOT NULL,
    subject varchar(220) NOT NULL,
    category_code varchar(50),
    priority varchar(20) NOT NULL,
    status varchar(30) NOT NULL,
    assigned_user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    reference_type varchar(40),
    reference_id uuid,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT uq_ep_support_ticket_no UNIQUE (company_code, ticket_no),
    CONSTRAINT chk_ep_sup_ticket_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 167. ep_support.tb_ep_support_ticket_ticket_message_detail
CREATE TABLE IF NOT EXISTS ep_support.tb_ep_support_ticket_ticket_message_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    ticket_id uuid NOT NULL REFERENCES ep_support.tb_ep_support_ticket_ticket_master(id) ON DELETE RESTRICT,
    sender_user_id uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    message_text text NOT NULL,
    visibility varchar(20) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_sup_msg_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 168. ep_support.tb_ep_support_ticket_ticket_attachment_detail
CREATE TABLE IF NOT EXISTS ep_support.tb_ep_support_ticket_ticket_attachment_detail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    ticket_id uuid NOT NULL REFERENCES ep_support.tb_ep_support_ticket_ticket_master(id) ON DELETE RESTRICT,
    message_id uuid REFERENCES ep_support.tb_ep_support_ticket_ticket_message_detail(id) ON DELETE RESTRICT,
    file_name varchar(220) NOT NULL,
    file_url text NOT NULL,
    mime_type varchar(100),
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_sup_attach_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 169. ep_support.tb_ep_support_ticket_ticket_status_history
CREATE TABLE IF NOT EXISTS ep_support.tb_ep_support_ticket_ticket_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    ticket_id uuid NOT NULL REFERENCES ep_support.tb_ep_support_ticket_ticket_master(id) ON DELETE RESTRICT,
    from_status varchar(30),
    to_status varchar(30) NOT NULL,
    changed_by uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    remarks text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_sup_hist_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 20: ep_audit (4 Tables)
-- ==============================================================================

-- 170. ep_audit.tb_ep_audit_activity_activity_log
CREATE TABLE IF NOT EXISTS ep_audit.tb_ep_audit_activity_activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    activity_type varchar(60) NOT NULL,
    module_code varchar(40) NOT NULL,
    reference_type varchar(40),
    reference_id uuid,
    ip_address inet,
    activity_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    metadata_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_audit_act_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 171. ep_audit.tb_ep_audit_entity_entity_change_log
CREATE TABLE IF NOT EXISTS ep_audit.tb_ep_audit_entity_entity_change_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    entity_schema varchar(80) NOT NULL,
    entity_table varchar(150) NOT NULL,
    entity_id uuid NOT NULL,
    operation_type varchar(20) NOT NULL,
    changed_by uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    before_json jsonb,
    after_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_audit_entity_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 172. ep_audit.tb_ep_audit_security_security_event_log
CREATE TABLE IF NOT EXISTS ep_audit.tb_ep_audit_security_security_event_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    event_type varchar(60) NOT NULL,
    severity varchar(20) NOT NULL,
    ip_address inet,
    event_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    details_json jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_audit_sec_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 173. ep_audit.tb_ep_audit_access_data_access_log
CREATE TABLE IF NOT EXISTS ep_audit.tb_ep_audit_access_data_access_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    resource_type varchar(60) NOT NULL,
    resource_id uuid,
    action varchar(30) NOT NULL,
    accessed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    ip_address inet,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_audit_access_act_pub CHECK (NOT (active = false AND publish = true))
);

-- ==============================================================================
-- SCHEMA 21: ep_kyc (10 Tables)
-- ==============================================================================

-- 174. ep_kyc.tb_ep_kyc_subject_subject_master
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_subject_subject_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    subject_type varchar(30) NOT NULL,
    user_id uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    merchant_id uuid REFERENCES ep_merchant.tb_ep_merchant_vendor_merchant_master(id) ON DELETE RESTRICT,
    agent_id uuid,
    influencer_id uuid,
    rider_id uuid,
    subject_kind varchar(20) NOT NULL,
    legal_name varchar(200) NOT NULL,
    country_code varchar(10) NOT NULL,
    current_status varchar(30) NOT NULL,
    current_risk_level varchar(20) NOT NULL,
    verified_at timestamptz,
    verification_expires_at timestamptz,
    next_review_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_subject_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 175. ep_kyc.tb_ep_kyc_requirement_requirement_setup
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_requirement_requirement_setup (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    requirement_code varchar(50) NOT NULL,
    subject_type varchar(30) NOT NULL,
    country_code varchar(10),
    document_type varchar(50),
    check_type varchar(50),
    mandatory boolean NOT NULL DEFAULT true,
    validity_days integer,
    sort_order integer NOT NULL DEFAULT 0,
    effective_from date,
    effective_to date,
    rule_config jsonb,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_req_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 176. ep_kyc.tb_ep_kyc_case_verification_case_master
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_case_verification_case_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    subject_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_subject_subject_master(id) ON DELETE RESTRICT,
    case_no varchar(50) NOT NULL,
    case_type varchar(30) NOT NULL,
    status varchar(30) NOT NULL,
    source_channel varchar(20) NOT NULL,
    risk_level varchar(20) NOT NULL,
    assigned_to uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    initiated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    submitted_at timestamptz,
    decision_at timestamptz,
    valid_until timestamptz,
    reverify_due_at timestamptz,
    case_summary text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_case_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 177. ep_kyc.tb_ep_kyc_document_document_master
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_document_document_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    case_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_case_verification_case_master(id) ON DELETE RESTRICT,
    requirement_id uuid REFERENCES ep_kyc.tb_ep_kyc_requirement_requirement_setup(id) ON DELETE RESTRICT,
    document_type varchar(50) NOT NULL,
    document_no_masked varchar(120),
    document_no_hash varchar(128),
    document_no_encrypted bytea,
    issuing_country_code varchar(10),
    issued_on date,
    expires_on date,
    storage_provider varchar(30) NOT NULL,
    file_reference text NOT NULL,
    checksum_sha256 varchar(64) NOT NULL,
    verification_status varchar(30) NOT NULL,
    verified_at timestamptz,
    verified_by uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_doc_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 178. ep_kyc.tb_ep_kyc_check_verification_check_txn
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_check_verification_check_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    case_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_case_verification_case_master(id) ON DELETE RESTRICT,
    document_id uuid REFERENCES ep_kyc.tb_ep_kyc_document_document_master(id) ON DELETE RESTRICT,
    provider_id uuid,
    check_type varchar(50) NOT NULL,
    status varchar(30) NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    result_code varchar(60),
    result_score numeric(10,4),
    result_summary text,
    evidence_reference text,
    manual_review_required boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_check_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 179. ep_kyc.tb_ep_kyc_provider_provider_master
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_provider_provider_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    provider_code varchar(50) NOT NULL,
    provider_name varchar(150) NOT NULL,
    provider_type varchar(30) NOT NULL,
    integration_connection_id uuid,
    supported_checks jsonb,
    is_default boolean NOT NULL DEFAULT false,
    timeout_seconds integer,
    retry_limit integer,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_prov_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 180. ep_kyc.tb_ep_kyc_provider_provider_response_log
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_provider_provider_response_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    check_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_check_verification_check_txn(id) ON DELETE RESTRICT,
    provider_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_provider_provider_master(id) ON DELETE RESTRICT,
    external_request_id varchar(120),
    external_reference varchar(150),
    http_status integer,
    response_code varchar(80),
    received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    request_hash varchar(128),
    response_hash varchar(128),
    payload_reference text,
    retry_no integer NOT NULL DEFAULT 1,
    error_message text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_resp_log_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 181. ep_kyc.tb_ep_kyc_risk_risk_flag_txn
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_risk_risk_flag_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    case_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_case_verification_case_master(id) ON DELETE RESTRICT,
    check_id uuid REFERENCES ep_kyc.tb_ep_kyc_check_verification_check_txn(id) ON DELETE RESTRICT,
    risk_type varchar(50) NOT NULL,
    severity varchar(20) NOT NULL,
    source_code varchar(50),
    description text NOT NULL,
    status varchar(20) NOT NULL,
    raised_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    raised_by uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    resolved_at timestamptz,
    resolved_by uuid REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    resolution_note text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_risk_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 182. ep_kyc.tb_ep_kyc_decision_decision_history
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_decision_decision_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    case_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_case_verification_case_master(id) ON DELETE RESTRICT,
    decision varchar(30) NOT NULL,
    decision_reason_code varchar(60),
    decision_note text,
    decided_by uuid NOT NULL REFERENCES ep_identity.tb_ep_identity_user_user_master(id) ON DELETE RESTRICT,
    decided_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    valid_until timestamptz,
    supersedes_decision_id uuid REFERENCES ep_kyc.tb_ep_kyc_decision_decision_history(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_decision_act_pub CHECK (NOT (active = false AND publish = true))
);

-- 183. ep_kyc.tb_ep_kyc_consent_consent_txn
CREATE TABLE IF NOT EXISTS ep_kyc.tb_ep_kyc_consent_consent_txn (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code varchar(20) NOT NULL,
    subject_id uuid NOT NULL REFERENCES ep_kyc.tb_ep_kyc_subject_subject_master(id) ON DELETE RESTRICT,
    case_id uuid REFERENCES ep_kyc.tb_ep_kyc_case_verification_case_master(id) ON DELETE RESTRICT,
    consent_type varchar(50) NOT NULL,
    consent_version varchar(30) NOT NULL,
    accepted boolean NOT NULL DEFAULT false,
    accepted_at timestamptz,
    revoked_at timestamptz,
    channel varchar(20) NOT NULL,
    ip_address inet,
    device_id uuid,
    evidence_reference text,
    active boolean NOT NULL DEFAULT true,
    publish boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    created_by uuid,
    updated_at timestamptz,
    updated_by uuid,
    deactivated_at timestamptz,
    deactivated_by uuid,
    deactivation_reason varchar(500),
    CONSTRAINT chk_ep_kyc_consent_act_pub CHECK (NOT (active = false AND publish = true))
);
