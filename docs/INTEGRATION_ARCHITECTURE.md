# Everest Pasal — Integration & Background Processing Architecture

## 1. Physical Schemas & Tables (`ep_integration`)

- `tb_ep_integration_outbox_outbox_event_queue` — Transactional outbox table storing domain events committed alongside business transactions.
- `tb_ep_integration_webhook_webhook_inbound_log` — Raw incoming webhook payload audit.
- `tb_ep_integration_job_job_master` — Bulk import and export jobs (Catalog imports, Inventory feeds, Accounting reports).

---

## 2. Transactional Outbox Pattern

```
┌────────────────────────────────────────────────────────┐
│               BUSINESS SERVICE MUTATION                │
│  1. INSERT / UPDATE Order, Payment or Inventory        │
│  2. INSERT into ep_integration.tb_ep_..._outbox_event  │
│  3. COMMIT TRANSACTION (Atomic)                        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            BACKGROUND WORKER / EVENT CONSUMER          │
│  1. SELECT * FROM outbox WHERE published_at IS NULL    │
│  2. Dispatch to external broker / SMS / Email API      │
│  3. UPDATE outbox SET published_at = clock_timestamp() │
└────────────────────────────────────────────────────────┘
```
This pattern ensures that a database failure never leaks orphaned events and an external network failure never rolls back valid business transactions.
