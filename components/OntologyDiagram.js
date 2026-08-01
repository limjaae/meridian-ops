const NODES = [
  { id: 'supplier', label: 'Supplier', x: 40, y: 90 },
  { id: 'product', label: 'Product', x: 220, y: 90 },
  { id: 'port', label: 'Port', x: 400, y: 90 },
  { id: 'disruption', label: 'Disruption Event', x: 580, y: 90 },
  { id: 'decision', label: 'Decision', x: 580, y: 220 },
  { id: 'order', label: 'Customer Order', x: 220, y: 220 },
];

const EDGES = [
  { from: 'supplier', to: 'product', label: 'provides' },
  { from: 'product', to: 'port', label: 'shipped through' },
  { from: 'port', to: 'disruption', label: 'affected by' },
  { from: 'disruption', to: 'decision', label: 'requires' },
  { from: 'product', to: 'order', label: 'fulfills' },
  { from: 'order', to: 'decision', label: 'informs' },
];

function nodeById(id) {
  return NODES.find((n) => n.id === id);
}

export default function OntologyDiagram() {
  const w = 660;
  const h = 280;
  const boxW = 140;
  const boxH = 44;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Ontology diagram showing relationships between Supplier, Product, Port, Disruption Event, Decision, and Customer Order">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#5B6570" />
        </marker>
      </defs>

      {EDGES.map((e, i) => {
        const a = nodeById(e.from);
        const b = nodeById(e.to);
        const x1 = a.x + boxW / 2;
        const y1 = a.y + boxH / 2;
        const x2 = b.x + boxW / 2;
        const y2 = b.y + boxH / 2;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9CDD3" strokeWidth="1.4" markerEnd="url(#arrow)" />
            <rect x={mx - 38} y={my - 10} width="76" height="16" fill="#FFFFFF" />
            <text x={mx} y={my + 2} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-plex)" fill="#5B6570">
              {e.label}
            </text>
          </g>
        );
      })}

      {NODES.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={boxW} height={boxH} rx="7" fill="#F7F8FA" stroke="#1B2A4A" strokeWidth="1.2" />
          <text x={n.x + boxW / 2} y={n.y + boxH / 2 + 4} textAnchor="middle" fontSize="12.5" fontFamily="var(--font-inter)" fontWeight="500" fill="#1B2A4A">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
