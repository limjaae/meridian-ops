import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient();
    const id = params.id;

    const [{ data: incident, error: incErr }, { data: options }, { data: actions }] = await Promise.all([
      supabase.from('incidents').select('*, port:port_id(code,name,state,lat,lon)').eq('id', id).single(),
      supabase.from('incident_options').select('*').eq('incident_id', id),
      supabase.from('incident_actions').select('*').eq('incident_id', id).order('sort_order'),
    ]);

    if (incErr || !incident) {
      return NextResponse.json({ error: 'incident_not_found' }, { status: 404 });
    }

    const { data: affectedSuppliers } = await supabase
      .from('suppliers')
      .select('*')
      .eq('sector', 'semiconductors')
      .order('risk_score', { ascending: false })
      .limit(incident.affected_supplier_count || 5);

    return NextResponse.json({ incident, options: options || [], actions: actions || [], affectedSuppliers: affectedSuppliers || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
