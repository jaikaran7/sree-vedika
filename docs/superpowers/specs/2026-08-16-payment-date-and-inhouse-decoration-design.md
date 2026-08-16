# Payment collection date & in-house decoration

**Date:** 2026-08-16  
**Status:** Approved for planning  
**Approach:** Form + API wiring only (reuse existing `payment_date`; no schema migration)

## Problem

1. When collecting advance or any payment, staff cannot choose the collection date. The DB column `payments.payment_date` exists and Payment History shows it, but create/add/edit flows never send a date, so the DB defaults to today.
2. For in-house decoration, decoration amount is currently required. In practice it should be optional. The decorator name should default to `Raju` and remain editable.

## Goals

- Require a payment collection date whenever a payment is recorded (new-booking advance, Add Payment, Edit Payment).
- Show that date in Payment History only (already implemented once the correct date is stored).
- For `decoration_type === 'in_house'`: decoration amount optional (≥ 0); decorator vendor defaults to `Raju`, fully editable.
- No Financial Summary changes. No new DB columns.

## Non-goals

- Showing collection date next to Advance Received in Financial Summary.
- Hard prefix like `Raju - …` (rejected in favor of editable default).
- Schema migrations for payments or decoration.
- Changing outside / not_required decoration behavior.

## Current state

| Area | Today |
|---|---|
| `payments.payment_date` | Exists; `date not null default current_date` |
| Payment History / Invoice | Already display `payment_date` |
| BookingForm advance | Amount only; insert omits `payment_date` |
| Add/Edit Payment | amount, type, notes only |
| `updatePayment` API | Does not accept `payment_date` |
| In-house validation | Requires vendor name and `decoration_amount > 0` |

## Design

### 1. Payment collection date

**New booking (`BookingForm`)**

- Always show a `payment_date` date input (label: collection date), default today.
- Validation: required only when `advance > 0`. If advance is 0, no payment row is created and the date is unused.
- `createBooking` advance insert must pass `payment_date` when creating the advance payment row.

**Add / Edit Payment**

- Add required `payment_date` to `paymentSchema` and `PaymentForm`.
- Default on Add: today. On Edit: existing `payment.payment_date`.
- Wire through Add/Edit dialogs and `usePayments`.
- Extend `UpdatePaymentInput` / `updatePayment` to include `payment_date`.

**Display**

- No UI changes to Payment History or Financial Summary. History already shows `formatDate(p.payment_date)`.

### 2. In-house decoration

**Validation (`bookingSchema`)**

- When `decoration_type === 'in_house'`:
  - Keep decorator vendor required (min length as today).
  - Remove the `decoration_amount > 0` requirement; allow 0.
- Outside / not_required rules unchanged.

**Form defaults (`BookingForm`, inquiry → booking prefill)**

- When decoration type is (or becomes) `in_house`, default `decorator_vendor` to `Raju` if empty.
- User can change the name to anything; do not force a prefix on save.
- Decoration amount label/UX should not imply required (optional / allow blank → 0).

**Persistence**

- Existing API mapping stays: in-house stores `decorator_vendor` + `decoration_amount` (may be 0).

## Files likely touched

- `src/lib/validators.ts`
- `src/lib/api/bookings.ts`
- `src/lib/api/payments.ts`
- `src/hooks/usePayments.ts`
- `src/components/booking/BookingForm.tsx`
- `src/components/booking/PaymentForm.tsx`
- `src/components/booking/AddPaymentDialog.tsx`
- `src/components/booking/EditPaymentDialog.tsx`
- `src/lib/inquiryBooking.ts` (prefill `Raju` when in-house)

## Error handling

- Client validation blocks submit without a collection date when a payment is being recorded.
- Invalid/missing date on edit fails the same way as amount/type today.
- Decoration amount 0 for in-house is valid; totals treat it as zero decoration cost.

## Testing (minimal)

- Create booking with advance > 0 and a past collection date → Payment History shows that date.
- Add and edit a payment with a chosen date → history updates.
- Create/edit in-house booking with amount 0 and vendor `Raju` → succeeds; changing vendor name persists as typed.

## Decisions log

| Question | Decision |
|---|---|
| Raju behavior | Default name `Raju`, fully editable |
| Date field presence | Always when collecting payment; required |
| Where date displays | Payment History only |
| Implementation approach | Form + API wiring; reuse `payment_date` |
