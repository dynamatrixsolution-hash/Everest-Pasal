# Everest Pasal — Payment Architecture & Webhook Safety

## 1. Physical Tables (`ep_payment`)

- `tb_ep_payment_provider_provider_master` — Registered payment gateways (`ESEWA`, `KHALTI`, `CONNECT_IPS`, `FONEPAY`, `COD`, `STRIPE`).
- `tb_ep_payment_intent_payment_intent_master` — Durable payment attempts with state machines (`REQUIRES_PAYMENT_METHOD`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELLED`).
- `tb_ep_payment_txn_payment_transaction_txn` — Immutable gateway interaction records with raw provider payload JSON storage.
- `tb_ep_payment_webhook_payment_webhook_event` — Idempotent webhook event ledger with unique constraint on `(company_code, provider_id, external_event_id)`.
- `tb_ep_payment_refund_refund_master` — Idempotent refund requests linked to payment intents and original orders.
- `tb_ep_payment_cod_cod_receivable_master` — Cash-on-delivery tracking from rider collection to finance reconciliation.

---

## 2. Server Authority & Anti-Tampering Rules

1. **The Client is Never Authoritative**: The client cannot tell the backend that a payment succeeded. Payment success requires:
   - Server-to-server webhook notification, OR
   - Direct server-side verification against the payment provider API.
2. **Idempotency Guarantee**:
   - Webhook deliveries and duplicate payment callbacks check `tb_ep_payment_webhook_payment_webhook_event`.
   - Repeated events return the cached outcome with `X-Webhook-Duplicate: true` header without creating duplicate financial entries or updating orders twice.
