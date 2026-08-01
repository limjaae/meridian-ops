import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('suppliers')
      .select('*, port:primary_port_id(code,name,lat,lon)')
      .order('risk_score', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return NextResponse.json({ suppliers: data || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
