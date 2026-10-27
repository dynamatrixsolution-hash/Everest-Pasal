# Everest Pasal — Finance & General Ledger Architecture

## 1. Physical Schemas & Tables (`ep_finance`)

- `tb_ep_finance_account_general_ledger_account` — Chart of accounts (Assets, Liabilities, Equity, Revenue, Expenses).
- `tb_ep_finance_journal_journal_master` — Double-entry journal vouchers with status (`POSTED`, `REVERSED`).
- `tb_ep_finance_journal_journal_line_detail` — Individual debit/credit lines with currency and account references.
- `tb_ep_finance_merchant_settlement_master` — Vendor periodic settlement calculations deducting commissions and refunds.
- `tb_ep_finance_payout_payout_master` — Bank transfer payout instructions.

---

## 2. Invariants & Financial Immutability

1. **Strict Double-Entry Balancing Invariant**:
   $$\sum \text{Debit Amounts} = \sum \text{Credit Amounts}$$
   Attempting to post an unbalanced journal returns `400 Bad Request` and rolls back atomically.
2. **Posted Journals are Immutable**:
   - No `UPDATE` or `DELETE` is permitted on posted financial lines.
   - Corrections require creating explicit reversal or adjustment journal vouchers referencing the prior journal number.
