import { HALL_INFO } from '../../lib/hall';
import { formatCurrency, formatDate, todayISO } from '../../lib/format';
import type { BookingWithTotals } from '../../lib/types';

const c = {
  ink: '#241a12',
  inkSoft: '#71624f',
  maroon: '#7f1f30',
  gold: '#b3873a',
  goldLight: '#f3e7cc',
  border: '#e7dcc7',
  ivory: '#fbf6ee',
};

export function QuotationTemplate({
  booking,
  quotationNumber,
  validUntil,
}: {
  booking: BookingWithTotals;
  quotationNumber: string;
  validUntil: string;
}) {
  const slotLabel = booking.booking_slot === 'morning' ? 'Morning' : 'Evening';

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
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.gold }}>Quotation</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{HALL_INFO.name}</div>
            <div style={{ fontSize: 12.5, marginTop: 8, color: '#e9d9b8', maxWidth: 520, lineHeight: 1.5 }}>
              {HALL_INFO.address}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.gold }}>Quotation No.</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{quotationNumber}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.inkSoft }}>Prepared For</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{booking.customer_name}</div>
            <div style={{ fontSize: 13, color: c.inkSoft, marginTop: 2 }}>{booking.phone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.inkSoft }}>Quotation Date</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{formatDate(todayISO())}</div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, color: c.inkSoft, marginTop: 12 }}>Valid Until</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{formatDate(validUntil)}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28 }}>
          <tbody>
            {[
              ['Booking Date', formatDate(booking.booking_date)],
              ['Booking Slot', slotLabel],
              ['Hall Booking Amount', formatCurrency(booking.budget)],
              ['Kitchen Amount', formatCurrency(booking.kitchen_required ? booking.kitchen_amount : 0)],
              ['Decoration Amount', formatCurrency(booking.decoration_type === 'in_house' ? booking.decoration_amount : 0)],
              ['Royalty Fee', formatCurrency(booking.decoration_type === 'outside' ? booking.royalty_fee : 0)],
              ['Total Booking Value', formatCurrency(booking.total_booking_value)],
              ['Advance Received', formatCurrency(booking.collected)],
              ['Pending Amount', formatCurrency(Math.max(booking.pending, 0))],
            ].map(([label, value], i) => (
              <tr key={label} style={{ background: i % 2 === 0 ? c.ivory : '#ffffff' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: c.inkSoft, borderBottom: `1px solid ${c.border}` }}>
                  {label}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'right',
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.maroon, marginBottom: 10 }}>Terms &amp; Conditions</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: c.inkSoft, lineHeight: 1.9 }}>
            <li>The advance amount confirms the provisional booking of the date and slot mentioned above.</li>
            <li>The balance amount is payable on or before the day of the event.</li>
            <li>Advance amount is non-refundable in case of cancellation by the customer.</li>
            <li>This quotation is valid for 7 days from the quotation date above.</li>
            <li>Any additional services requested will be billed separately.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 60 }}>
          <div style={{ width: 220, borderTop: `1px solid ${c.ink}`, paddingTop: 8, fontSize: 12, color: c.inkSoft }}>
            Customer Signature
          </div>
          <div style={{ width: 220, borderTop: `1px solid ${c.ink}`, paddingTop: 8, fontSize: 12, color: c.inkSoft, textAlign: 'right' }}>
            Authorized Signature
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${c.border}`, padding: '16px 48px', fontSize: 10.5, color: c.inkSoft, textAlign: 'center' }}>
        {HALL_INFO.name} &middot; Thank you for considering us for your special occasion.
      </div>
    </div>
  );
}
