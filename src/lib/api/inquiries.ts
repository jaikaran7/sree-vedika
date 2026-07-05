import { getSupabase } from '../supabase';
import type { FollowUp, Inquiry, InquiryStatus } from '../types';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export async function fetchAllInquiries(): Promise<Inquiry[]> {
  const { data, error } = await getSupabase()
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

export async function fetchInquiry(id: string): Promise<Inquiry | null> {
  const { data, error } = await getSupabase().from('inquiries').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Inquiry | null;
}

export async function findDuplicateInquiry(phone: string, expectedEventDate: string): Promise<Inquiry | null> {
  const normalized = normalizePhone(phone);
  const { data, error } = await getSupabase()
    .from('inquiries')
    .select('*')
    .eq('phone', normalized)
    .eq('expected_event_date', expectedEventDate)
    .neq('status', 'lost')
    .neq('status', 'converted_to_booking')
    .maybeSingle();
  if (error) throw error;
  return data as Inquiry | null;
}

export type CreateInquiryInput = {
  customer_name: string;
  phone: string;
  alternate_phone: string | null;
  event_type: Inquiry['event_type'];
  expected_event_date: string;
  preferred_slot: Inquiry['preferred_slot'];
  expected_guests: number | null;
  source: Inquiry['source'];
  expected_budget: number | null;
  priority: Inquiry['priority'];
  status: InquiryStatus;
  notes: string | null;
  next_followup_date: string | null;
  skipDuplicateCheck?: boolean;
};

export type CreateInquiryResult =
  | { ok: true; inquiry: Inquiry }
  | { ok: false; reason: 'duplicate'; existing: Inquiry }
  | { ok: false; reason: 'error'; message?: string };

export async function createInquiry(input: CreateInquiryInput): Promise<CreateInquiryResult> {
  const phone = normalizePhone(input.phone);

  if (!input.skipDuplicateCheck) {
    const existing = await findDuplicateInquiry(phone, input.expected_event_date);
    if (existing) return { ok: false, reason: 'duplicate', existing };
  }

  const { data, error } = await getSupabase()
    .from('inquiries')
    .insert({
      customer_name: input.customer_name,
      phone,
      alternate_phone: input.alternate_phone,
      event_type: input.event_type,
      expected_event_date: input.expected_event_date,
      preferred_slot: input.preferred_slot,
      expected_guests: input.expected_guests,
      source: input.source,
      expected_budget: input.expected_budget,
      priority: input.priority,
      status: input.status,
      notes: input.notes,
      next_followup_date: input.next_followup_date,
    })
    .select()
    .single();

  if (error || !data) {
    return { ok: false, reason: 'error', message: error?.message };
  }

  return { ok: true, inquiry: data as Inquiry };
}

export async function updateInquiry(
  id: string,
  input: Partial<CreateInquiryInput> & { booking_id?: string | null },
): Promise<Inquiry> {
  const payload: Record<string, unknown> = { ...input };
  if (typeof payload.phone === 'string') payload.phone = normalizePhone(payload.phone);

  const { data, error } = await getSupabase().from('inquiries').update(payload).eq('id', id).select().single();
  if (error) throw error;
  if (!data) throw new Error('Inquiry not found');
  return data as Inquiry;
}

export async function linkInquiryToBooking(inquiryId: string, bookingId: string): Promise<Inquiry> {
  return updateInquiry(inquiryId, {
    booking_id: bookingId,
    status: 'converted_to_booking',
  });
}

export async function fetchFollowUps(inquiryId: string): Promise<FollowUp[]> {
  const { data, error } = await getSupabase()
    .from('followups')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .order('followup_date', { ascending: false })
    .order('followup_time', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FollowUp[];
}

export type CreateFollowUpInput = {
  inquiry_id: string;
  remarks: string;
  followup_date: string;
  followup_time: string;
  next_followup_date: string | null;
  status: InquiryStatus;
};

export async function createFollowUp(input: CreateFollowUpInput): Promise<FollowUp> {
  const { data, error } = await getSupabase()
    .from('followups')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error('Could not save follow-up');

  await getSupabase()
    .from('inquiries')
    .update({
      status: input.status,
      next_followup_date: input.next_followup_date,
    })
    .eq('id', input.inquiry_id);

  return data as FollowUp;
}
