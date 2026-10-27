-- ==============================================================================
-- EVEREST PASAL - 10 MANDATORY DEVELOPMENT RULES DATABASE ENFORCEMENT
-- Enforces data integrity, soft-deletes, append-only ledgers, balancing, and immutability
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- RULE 1 & 2: AUTOMATIC PUBLISH=FALSE WHEN ACTIVE=FALSE & DEACTIVATION AUDIT
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ep_system.fn_enforce_active_publish_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
    -- If active is being set to false, force publish to false
    IF NEW.active = false THEN
        NEW.publish := false;
        IF NEW.deactivated_at IS NULL THEN
            NEW.deactivated_at := clock_timestamp();
        END IF;
    END IF;

    -- If active is true and deactivated_at was set previously, clean or preserve per update
    IF NEW.active = true AND (OLD IS NULL OR OLD.active = false) THEN
        NEW.deactivated_at := NULL;
        NEW.deactivated_by := NULL;
        NEW.deactivation_reason := NULL;
    END IF;

    NEW.updated_at := clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- RULE 1: PREVENT PHYSICAL DELETIONS ON BUSINESS TABLES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ep_system.fn_prevent_physical_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'PHYSICAL DELETE IS PROHIBITED on table %.%. Set active=false and publish=false instead.', TG_TABLE_SCHEMA, TG_TABLE_NAME;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- RULE 8: FINANCIAL JOURNAL DEBIT = CREDIT BALANCING BEFORE POSTING
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ep_finance.fn_validate_journal_balance_before_post()
RETURNS TRIGGER AS $$
DECLARE
    v_total_debit numeric(18,4);
    v_total_credit numeric(18,4);
    v_line_count integer;
BEGIN
    -- Only validate when transitioning to 'POSTED'
    IF NEW.status = 'POSTED' AND (OLD IS NULL OR OLD.status != 'POSTED') THEN
        SELECT 
            COALESCE(SUM(debit_amount), 0),
            COALESCE(SUM(credit_amount), 0),
            COUNT(*)
        INTO v_total_debit, v_total_credit, v_line_count
        FROM ep_finance.tb_ep_finance_journal_journal_line_detail
        WHERE journal_id = NEW.id;

        IF v_line_count = 0 THEN
            RAISE EXCEPTION 'Journal % cannot be posted without line items.', NEW.journal_no;
        END IF;

        IF v_total_debit != v_total_credit THEN
            RAISE EXCEPTION 'Journal % is UNBALANCED. Total Debit: %, Total Credit: %. Diff: %',
                NEW.journal_no, v_total_debit, v_total_credit, (v_total_debit - v_total_credit);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_journal_balance ON ep_finance.tb_ep_finance_journal_journal_master;
CREATE TRIGGER trg_validate_journal_balance
    BEFORE UPDATE OF status ON ep_finance.tb_ep_finance_journal_journal_master
    FOR EACH ROW
    EXECUTE FUNCTION ep_finance.fn_validate_journal_balance_before_post();

-- ------------------------------------------------------------------------------
-- RULE 9 & 10: IMMUTABLE APPEND-ONLY ENFORCEMENT ON LEDGERS & STATUS HISTORIES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ep_system.fn_enforce_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'APPEND-ONLY VIOLATION: Updates and Deletions are forbidden on %.%. Records in this ledger are immutable.', TG_TABLE_SCHEMA, TG_TABLE_NAME;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- RULE 10: ORDER STATUS STATE MACHINE TRANSITION VALIDATION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ep_commerce.fn_validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.order_status = NEW.order_status THEN
        RETURN NEW;
    END IF;

    -- Valid transitions for customer orders
    IF OLD.order_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Invalid order transition: CANCELLED order % cannot be transitioned to %', OLD.order_no, NEW.order_status;
    END IF;

    IF OLD.order_status = 'DELIVERED' AND NEW.order_status NOT IN ('COMPLETED', 'RETURN_REQUESTED', 'RETURNED') THEN
        RAISE EXCEPTION 'Invalid order transition from DELIVERED to % for order %', NEW.order_status, OLD.order_no;
    END IF;

    -- Automatically log transition to status history if not already inserted
    INSERT INTO ep_commerce.tb_ep_commerce_ord_order_status_history (
        id,
        company_code,
        fiscal_year_code,
        order_id,
        from_status,
        to_status,
        changed_at,
        changed_by,
        reason,
        active,
        publish
    ) VALUES (
        gen_random_uuid(),
        NEW.company_code,
        NEW.fiscal_year_code,
        NEW.id,
        OLD.order_status,
        NEW.order_status,
        clock_timestamp(),
        NEW.updated_by,
        'State transition via order master update',
        true,
        false
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_status_transition ON ep_commerce.tb_ep_commerce_ord_order_master;
CREATE TRIGGER trg_order_status_transition
    BEFORE UPDATE OF order_status ON ep_commerce.tb_ep_commerce_ord_order_master
    FOR EACH ROW
    EXECUTE FUNCTION ep_commerce.fn_validate_order_status_transition();

-- ------------------------------------------------------------------------------
-- APPLY LIFECYCLE & DELETE-PREVENTION TRIGGERS ACROSS ALL 183 TABLES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
    v_sql text;
BEGIN
    FOR r IN (
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema LIKE 'ep_%' AND table_type = 'BASE TABLE'
    ) LOOP
        -- 1. Apply active/publish lifecycle trigger
        v_sql := format('DROP TRIGGER IF EXISTS trg_lifecycle_%s ON %I.%I;', r.table_name, r.table_schema, r.table_name);
        EXECUTE v_sql;

        v_sql := format('CREATE TRIGGER trg_lifecycle_%s BEFORE INSERT OR UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION ep_system.fn_enforce_active_publish_lifecycle();', 
            r.table_name, r.table_schema, r.table_name);
        EXECUTE v_sql;

        -- 2. Apply Delete prevention on all business tables
        v_sql := format('DROP TRIGGER IF EXISTS trg_prevent_delete_%s ON %I.%I;', r.table_name, r.table_schema, r.table_name);
        EXECUTE v_sql;

        v_sql := format('CREATE TRIGGER trg_prevent_delete_%s BEFORE DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION ep_system.fn_prevent_physical_delete();', 
            r.table_name, r.table_schema, r.table_name);
        EXECUTE v_sql;
    END LOOP;
END;
$$;

-- ------------------------------------------------------------------------------
-- ATTACH APPEND-ONLY TRIGGERS TO SPECIFIC LEDGER / AUDIT / HISTORY TABLES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    append_only_tables text[] := ARRAY[
        'ep_inventory.tb_ep_inventory_stk_stock_movement_txn',
        'ep_commerce.tb_ep_commerce_ord_order_status_history',
        'ep_payment.tb_ep_payment_txn_payment_transaction_txn',
        'ep_payment.tb_ep_payment_refund_refund_transaction_txn',
        'ep_finance.tb_ep_finance_commission_commission_entry_txn',
        'ep_finance.tb_ep_finance_payout_payout_transaction_txn',
        'ep_logistics.tb_ep_logistics_track_tracking_event_txn',
        'ep_growth.tb_ep_growth_attr_attribution_txn',
        'ep_growth.tb_ep_growth_commission_commission_event_txn',
        'ep_comms.tb_ep_comms_delivery_delivery_attempt_txn',
        'ep_support.tb_ep_support_ticket_ticket_status_history',
        'ep_audit.tb_ep_audit_activity_activity_log',
        'ep_audit.tb_ep_audit_entity_entity_change_log',
        'ep_audit.tb_ep_audit_security_security_event_log',
        'ep_audit.tb_ep_audit_access_data_access_log',
        'ep_kyc.tb_ep_kyc_decision_decision_history',
        'ep_kyc.tb_ep_kyc_consent_consent_txn'
    ];
    parts text[];
    schema_name text;
    table_name text;
    v_sql text;
BEGIN
    FOREACH tbl IN ARRAY append_only_tables LOOP
        parts := string_to_array(tbl, '.');
        schema_name := parts[1];
        table_name := parts[2];

        v_sql := format('DROP TRIGGER IF EXISTS trg_append_only_%s ON %I.%I;', table_name, schema_name, table_name);
        EXECUTE v_sql;

        v_sql := format('CREATE TRIGGER trg_append_only_%s BEFORE UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION ep_system.fn_enforce_append_only();', 
            table_name, schema_name, table_name);
        EXECUTE v_sql;
    END LOOP;
END;
$$;
