import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('query_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ entries: data || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
