import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('decisions')
      .select('*, incident:incident_id(title, severity)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ decisions: data || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { incidentId, owner, optionSelected, expectedCostAud, expectedDelayDays, businessReason } = body || {};

    if (!incidentId || !owner || !optionSelected || !businessReason) {
      return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('decisions')
      .insert({
        incident_id: incidentId,
        owner,
        option_selected: optionSelected,
        expected_cost_aud: expectedCostAud ?? null,
        expected_delay_days: expectedDelayDays ?? null,
        business_reason: businessReason,
        status: 'approved',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ decision: data });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
