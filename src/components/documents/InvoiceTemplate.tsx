import { HALL_INFO } from '../../lib/hall';
import { formatCurrency, formatDate, todayISO } from '../../lib/format';
import { PAYMENT_TYPE_LABELS } from '../../lib/types';
import type { BookingWithTotals, Payment } from '../../lib/types';

const c = {
  ink: '#241a12',
  inkSoft: '#71624f',
  maroon: '#7f1f30',
  gold: '#b3873a',
  goldLight: '#f3e7cc',
  border: '#e7dcc7',
  ivory: '#fbf6ee',
};

export function InvoiceTemplate({
  booking,
  payments,
  invoiceNumber,
}: {
  booking: BookingWithTotals;
  payments: Payment[];
  invoiceNumber: string;
}) {
  const slotLabel = booking.booking_slot === 'morning' ? 'Morning' : 'Evening';
  const sortedPayments = [...payments].sort((a, b) => (a.payment_date < b.payment_date ? -1 : 1));

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        background: '#ffffff',
        color: c.ink,
        fontFamily: 'Georgia, "Times New Roman", serif',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ background: c.maroon, color: c.goldLight, padding: '36px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.gold }}>Invoice</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{HALL_INFO.name}</div>
            <div style={{ fontSize: 12.5, marginTop: 8, color: '#e9d9b8', maxWidth: 480, lineHeight: 1.5 }}>
              {HALL_INFO.address}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.gold }}>Invoice No.</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{invoiceNumber}</div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.gold, marginTop: 12 }}>
              Invoice Date
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{formatDate(todayISO())}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.inkSoft }}>Billed To</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{booking.customer_name}</div>
            <div style={{ fontSize: 13, color: c.inkSoft, marginTop: 2 }}>{booking.phone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.inkSoft }}>Booking</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{formatDate(booking.booking_date)}</div>
            <div style={{ fontSize: 12.5, color: c.inkSoft, marginTop: 2 }}>{slotLabel} Slot</div>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: c.maroon, marginBottom: 10 }}>Payment History</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: c.maroon, color: c.goldLight }}>
              <th style={{ padding: '10px 14px', fontSize: 11, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</th>
              <th style={{ padding: '10px 14px', fontSize: 11, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5 }}>Type</th>
              <th style={{ padding: '10px 14px', fontSize: 11, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</th>
              <th style={{ padding: '10px 14px', fontSize: 11, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sortedPayments.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '16px 14px', fontSize: 12.5, color: c.inkSoft, textAlign: 'center' }}>
                  No payments recorded.
                </td>
              </tr>
            ) : (
              sortedPayments.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? c.ivory : '#ffffff' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12.5, borderBottom: `1px solid ${c.border}` }}>{formatDate(p.payment_date)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12.5, borderBottom: `1px solid ${c.border}` }}>{PAYMENT_TYPE_LABELS[p.payment_type]}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12.5, color: c.inkSoft, borderBottom: `1px solid ${c.border}` }}>{p.notes ?? '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: 700, textAlign: 'right', borderBottom: `1px solid ${c.border}` }}>
                    {formatCurrency(p.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 40 }}>
          <table style={{ width: 300, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 14px', fontSize: 13, color: c.inkSoft }}>Hall Booking Amount</td>
                <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{formatCurrency(booking.budget)}</td>
              </tr>
              {booking.kitchen_required && booking.kitchen_amount > 0 && (
                <tr>
                  <td style={{ padding: '8px 14px', fontSize: 13, color: c.inkSoft }}>Kitchen Amount</td>
                  <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{formatCurrency(booking.kitchen_amount)}</td>
                </tr>
              )}
              {booking.decoration_type === 'in_house' && booking.decoration_amount > 0 && (
                <tr>
                  <td style={{ padding: '8px 14px', fontSize: 13, color: c.inkSoft }}>Decoration Amount</td>
                  <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{formatCurrency(booking.decoration_amount)}</td>
                </tr>
              )}
              {booking.decoration_type === 'outside' && booking.royalty_fee > 0 && (
                <tr>
                  <td style={{ padding: '8px 14px', fontSize: 13, color: c.inkSoft }}>Royalty Fee</td>
                  <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{formatCurrency(booking.royalty_fee)}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '8px 14px', fontSize: 13, color: c.inkSoft }}>Total Booking Value</td>
                <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{formatCurrency(booking.total_booking_value)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 14px', fontSize: 13, color: c.inkSoft }}>Total Received</td>
                <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{formatCurrency(booking.collected)}</td>
              </tr>
              <tr style={{ background: c.goldLight }}>
                <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: c.maroon }}>Pending Balance</td>
                <td style={{ padding: '10px 14px', fontSize: 15, fontWeight: 800, textAlign: 'right', color: c.maroon }}>
                  {formatCurrency(Math.max(booking.pending, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 220, borderTop: `1px solid ${c.ink}`, paddingTop: 8, fontSize: 12, color: c.inkSoft, textAlign: 'right' }}>
            Authorized Signature
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${c.border}`, padding: '16px 48px', fontSize: 10.5, color: c.inkSoft, textAlign: 'center' }}>
        {HALL_INFO.name} &middot; This is a computer-generated invoice.
      </div>
    </div>
  );
}
