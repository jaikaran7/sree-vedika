import { formatCurrency } from '../../lib/format';

type FinancialSummaryProps = {
  hallAmount: number;
  kitchenAmount: number;
  decorationAmount: number;
  royaltyFee: number;
  advanceReceived: number;
  collected: number;
};

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${highlight ? 'font-semibold' : ''}`}>
      <span className={highlight ? 'text-ink dark:text-ink-dark' : 'text-ink-soft dark:text-ink-dark-soft'}>{label}</span>
      <span className={highlight ? 'font-display text-ink dark:text-ink-dark' : 'font-medium text-ink dark:text-ink-dark'}>
        {value}
      </span>
    </div>
  );
}

export function FinancialSummary({
  hallAmount,
  kitchenAmount,
  decorationAmount,
  royaltyFee,
  advanceReceived,
  collected,
}: FinancialSummaryProps) {
  const totalBookingValue = hallAmount + kitchenAmount + decorationAmount + royaltyFee;
  const pending = Math.max(totalBookingValue - collected, 0);

  return (
    <div className="space-y-2 rounded-xl bg-gold-300/15 px-4 py-3 dark:bg-gold-400/10">
      <SummaryRow label="Hall Booking Amount" value={formatCurrency(hallAmount)} />
      <SummaryRow label="Kitchen Amount" value={formatCurrency(kitchenAmount)} />
      <SummaryRow label="Decoration Amount" value={formatCurrency(decorationAmount)} />
      <SummaryRow label="Royalty Fee" value={formatCurrency(royaltyFee)} />
      <div className="border-t border-gold-300/40 pt-2 dark:border-gold-400/20">
        <SummaryRow label="Total Booking Value" value={formatCurrency(totalBookingValue)} highlight />
      </div>
      <SummaryRow label="Advance Received" value={formatCurrency(advanceReceived)} />
      <SummaryRow label="Total Payments Collected" value={formatCurrency(collected)} />
      <SummaryRow label="Pending Amount" value={formatCurrency(pending)} highlight />
    </div>
  );
}
