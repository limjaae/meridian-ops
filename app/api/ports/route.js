import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('ports').select('*').order('id');
    if (error) throw error;
    return NextResponse.json({ ports: data || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
