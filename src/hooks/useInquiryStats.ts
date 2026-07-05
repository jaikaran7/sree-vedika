import { useMemo } from 'react';
import type { Inquiry } from '../lib/types';
import { todayISO } from '../lib/format';

export function useInquiryStats(inquiries: Inquiry[]) {
  return useMemo(() => {
    const today = todayISO();
    const monthPrefix = today.slice(0, 7);

    const active = inquiries.filter((i) => i.status !== 'lost');
    const converted = inquiries.filter((i) => i.status === 'converted_to_booking');
    const lost = inquiries.filter((i) => i.status === 'lost');
    const newInquiries = inquiries.filter((i) => i.status === 'new_inquiry');
    const todayFollowUps = inquiries.filter((i) => i.next_followup_date === today && i.status !== 'converted_to_booking' && i.status !== 'lost');
    const pendingFollowUps = inquiries.filter(
      (i) => i.next_followup_date && i.next_followup_date <= today && i.status !== 'converted_to_booking' && i.status !== 'lost',
    );
    const upcomingFollowUps = inquiries.filter(
      (i) => i.next_followup_date && i.next_followup_date > today && i.status !== 'converted_to_booking' && i.status !== 'lost',
    );
    const monthlyCount = inquiries.filter((i) => i.created_at.startsWith(monthPrefix)).length;
    const conversionRate = inquiries.length > 0 ? Math.round((converted.length / inquiries.length) * 100) : 0;

    return {
      totalCount: inquiries.length,
      newCount: newInquiries.length,
      convertedCount: converted.length,
      lostCount: lost.length,
      todayFollowUpCount: todayFollowUps.length,
      pendingFollowUpCount: pendingFollowUps.length,
      upcomingFollowUpCount: upcomingFollowUps.length,
      monthlyCount,
      conversionRate,
      activeCount: active.length,
    };
  }, [inquiries]);
}
