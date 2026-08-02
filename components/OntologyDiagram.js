// Vertical flow layout: generous spacing between nodes so edge labels
// never overlap a neighboring box (the previous horizontal layout packed
// nodes too tightly for labels like "shipped through" to fit in the gap).

const boxW = 240;
const boxH = 50;
const mainX = 20;
const sideX = 320;
const sideW = 200;

const NODES = [
  { id: 'supplier', label: 'Supplier', x: mainX, y: 10, w: boxW },
  { id: 'product', label: 'Product', x: mainX, y: 140, w: boxW },
  { id: 'port', label: 'Port', x: mainX, y: 270, w: boxW },
  { id: 'disruption', label: 'Disruption Event', x: mainX, y: 400, w: boxW },
  { id: 'decision', label: 'Decision', x: mainX, y: 530, w: boxW },
  { id: 'order', label: 'Customer Order', x: sideX, y: 140, w: sideW },
];

function node(id) {
  return NODES.find((n) => n.id === id);
}

function centerX(n) {
  return n.x + n.w / 2;
}

export default function OntologyDiagram() {
  const w = 560;
  const h = 610;

  const straightEdges = [
    { from: 'supplier', to: 'product', label: 'provides' },
    { from: 'product', to: 'port', label: 'shipped through' },
    { from: 'port', to: 'disruption', label: 'affected by' },
    { from: 'disruption', to: 'decision', label: 'requires' },
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Ontology diagram showing relationships between Supplier, Product, Port, Disruption Event, Decision, and Customer Order">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#5B6570" />
        </marker>
      </defs>

      {/* Main vertical chain */}
      {straightEdges.map((e, i) => {
        const a = node(e.from);
        const b = node(e.to);
        const x = centerX(a);
        const y1 = a.y + boxH;
        const y2 = b.y;
        const my = (y1 + y2) / 2;
        return (
          <g key={i}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke="#C9CDD3" strokeWidth="1.4" markerEnd="url(#arrow)" />
            <text x={x + 14} y={my + 3} fontSize="10.5" fontFamily="var(--font-plex)" fill="#5B6570">
              {e.label}
            </text>
          </g>
        );
      })}

      {/* Product -> Customer Order (horizontal branch) */}
      <line
        x1={mainX + boxW}
        y1={node('product').y + boxH / 2}
        x2={sideX}
        y2={node('order').y + boxH / 2}
        stroke="#C9CDD3"
        strokeWidth="1.4"
        markerEnd="url(#arrow)"
      />
      <text x={mainX + boxW + 6} y={node('product').y + boxH / 2 - 8} fontSize="10.5" fontFamily="var(--font-plex)" fill="#5B6570">
        fulfills
      </text>

      {/* Customer Order -> Decision (routed line down and left) */}
      <path
        d={`M ${sideX + sideW / 2} ${node('order').y + boxH}
            L ${sideX + sideW / 2} ${node('decision').y + boxH / 2}
            L ${mainX + boxW} ${node('decision').y + boxH / 2}`}
        fill="none"
        stroke="#C9CDD3"
        strokeWidth="1.4"
        markerEnd="url(#arrow)"
      />
      <text x={sideX + sideW / 2 + 8} y={(node('order').y + boxH + node('decision').y + boxH / 2) / 2} fontSize="10.5" fontFamily="var(--font-plex)" fill="#5B6570">
        informs
      </text>

      {/* Nodes */}
      {NODES.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={n.w} height={boxH} rx="7" fill="#F7F8FA" stroke="#1B2A4A" strokeWidth="1.2" />
          <text x={n.x + n.w / 2} y={n.y + boxH / 2 + 4.5} textAnchor="middle" fontSize="13" fontFamily="var(--font-inter)" fontWeight="500" fill="#1B2A4A">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
