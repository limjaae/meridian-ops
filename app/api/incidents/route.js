import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('incidents')
      .select('*, port:port_id(code,name,state)')
      .order('financial_exposure_aud', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ incidents: data || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
