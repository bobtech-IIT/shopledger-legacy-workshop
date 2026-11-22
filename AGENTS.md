# ShopLedger

## Stack

- Node.js with Express 4 and body-parser; browser UI is static HTML, CSS, and JavaScript.
- Data is persisted in `data/db.json`; `server.js` serves the app and API.

## Module map

- `routes/products.js` — product catalogue and active-coupon endpoints.
- `routes/orders.js` — order listing, creation, lookup, and cancellation endpoints.
- `routes/customers.js` — Khata customer listing and settlement endpoint.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, validation, calculation, and listing.
- `lib/dates.js` — date formatting, normalization, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, stock checks, stock changes, and inventory summary.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — Khata customer lookup, balances, debits, reversals, and settlements.
- `lib/orders.js` — order add/get/cancel/list operations.
- `lib/pricing.js` — subtotal, coupon discount, and checkout-total calculation.
- `lib/reports.js` — dashboard and GST-reconciliation calculation.
- `lib/store.js` — JSON database read, write, structure defaults, and audit entries.
- `lib/tax.js` — GST-rate lookup, GST slab percentage, and CGST/SGST split.

## Commands

- Start the app: `npm start`
- Run tests: `node --test`

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed.

Allowed files: `lib/invoice.js`; use `lib/tax.js` only if truly needed.
