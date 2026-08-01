import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { data, error } = await supabase
      .from('incident_actions')
      .update({ done: !!body.done })
      .eq('id', params.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ action: data });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
