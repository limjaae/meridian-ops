// Compact three-row layout: two rows of horizontally/vertically chained
// entities converging into a single Decision node. Kept intentionally
// short (viewBox ~2.6:1) so it reads as a diagram, not a full-page graphic.
// Horizontal gaps stay generous (120px) so labels like "shipped through"
// never spill into a neighboring box.

const boxW = 178;
const boxH = 48;

const ACCENT = {
  supplier: '#1B2A4A',
  product: '#1B2A4A',
  port: '#C08A3E',
  disruption: '#B3452C',
  decision: '#3F7856',
  order: '#5B6570',
};

const NODES = [
  { id: 'supplier', label: 'Supplier', x: 16, y: 16 },
  { id: 'product', label: 'Product', x: 314, y: 16 },
  { id: 'port', label: 'Port', x: 612, y: 16 },
  { id: 'order', label: 'Customer Order', x: 314, y: 120 },
  { id: 'disruption', label: 'Disruption Event', x: 612, y: 120 },
  { id: 'decision', label: 'Decision', x: 463, y: 224 },
];

function node(id) {
  return NODES.find((n) => n.id === id);
}
function cx(n) {
  return n.x + boxW / 2;
}
function cy(n) {
  return n.y + boxH / 2;
}

function labelWidth(text, fontSize = 10) {
  return text.length * fontSize * 0.62 + 10;
}

function EdgeLabel({ x, y, text }) {
  const w = labelWidth(text);
  return (
    <g>
      <rect x={x - w / 2} y={y - 8} width={w} height={14} rx="3" fill="#FFFFFF" />
      <text x={x} y={y + 2.5} textAnchor="middle" fontSize="10" fontFamily="var(--font-plex)" fill="#5B6570">
        {text}
      </text>
    </g>
  );
}

export default function OntologyDiagram() {
  const w = 806;
  const h = 288;

  const supplier = node('supplier');
  const product = node('product');
  const port = node('port');
  const order = node('order');
  const disruption = node('disruption');
  const decision = node('decision');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Ontology diagram showing relationships between Supplier, Product, Port, Disruption Event, Decision, and Customer Order">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#9AA1A9" />
        </marker>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#1B2A4A" floodOpacity="0.10" />
        </filter>
      </defs>

      {/* Row 1 horizontal chain */}
      <line x1={supplier.x + boxW} y1={cy(supplier)} x2={product.x} y2={cy(product)} stroke="#C9CDD3" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <EdgeLabel x={(supplier.x + boxW + product.x) / 2} y={cy(supplier) - 17} text="provides" />

      <line x1={product.x + boxW} y1={cy(product)} x2={port.x} y2={cy(port)} stroke="#C9CDD3" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <EdgeLabel x={(product.x + boxW + port.x) / 2} y={cy(product) - 17} text="shipped through" />

      {/* Row 1 -> Row 2 vertical drops */}
      <line x1={cx(product)} y1={product.y + boxH} x2={cx(order)} y2={order.y} stroke="#C9CDD3" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <EdgeLabel x={cx(product) + 46} y={(product.y + boxH + order.y) / 2} text="fulfills" />

      <line x1={cx(port)} y1={port.y + boxH} x2={cx(disruption)} y2={disruption.y} stroke="#C9CDD3" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <EdgeLabel x={cx(port) + 44} y={(port.y + boxH + disruption.y) / 2} text="affected by" />

      {/* Converge into Decision */}
      <path
        d={`M ${cx(order)} ${order.y + boxH} L ${cx(order)} ${cy(decision)} L ${decision.x} ${cy(decision)}`}
        fill="none"
        stroke="#C9CDD3"
        strokeWidth="1.4"
        markerEnd="url(#arrow)"
      />
      <EdgeLabel x={cx(order) + 42} y={(order.y + boxH + cy(decision)) / 2} text="informs" />

      <path
        d={`M ${cx(disruption)} ${disruption.y + boxH} L ${cx(disruption)} ${cy(decision)} L ${decision.x + boxW} ${cy(decision)}`}
        fill="none"
        stroke="#C9CDD3"
        strokeWidth="1.4"
        markerEnd="url(#arrow)"
      />
      <EdgeLabel x={cx(disruption) + 46} y={(disruption.y + boxH + cy(decision)) / 2} text="requires" />

      {/* Nodes */}
      {NODES.map((n) => (
        <g key={n.id} filter="url(#softShadow)">
          <rect x={n.x} y={n.y} width={boxW} height={boxH} rx="9" fill="#FBFBFC" stroke={ACCENT[n.id]} strokeWidth="1.5" />
          <rect x={n.x} y={n.y} width="4" height={boxH} rx="2" fill={ACCENT[n.id]} />
          <text x={n.x + boxW / 2 + 2} y={n.y + boxH / 2 + 4.5} textAnchor="middle" fontSize="12.5" fontFamily="var(--font-inter)" fontWeight="500" fill="#1F2937">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
