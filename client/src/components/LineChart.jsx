export default function LineChart({ data, valueKey = 'weight', label = 'Peso (kg)', color = '#166534' }) {
  if (!data || data.length < 2) {
    return <div className="empty" style={{ padding: 24 }}>Sem dados suficientes para o gráfico.</div>
  }
  const vals = data.map((d) => d[valueKey]).filter((v) => v != null)
  if (vals.length < 2) return <div className="empty" style={{ padding: 24 }}>Sem dados suficientes.</div>
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = (max - min) * 0.1 || 1
  const lo = min - pad
  const hi = max + pad
  const w = 600
  const h = 200
  const pts = data
    .map((d, i) => {
      const v = d[valueKey]
      if (v == null) return null
      const x = (i / (data.length - 1)) * (w - 40) + 20
      const y = h - 20 - ((v - lo) / (hi - lo)) * (h - 40)
      return { x, y, v, date: d.date }
    })
    .filter(Boolean)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${pts[pts.length - 1].x} ${h - 20} L ${pts[0].x} ${h - 20} Z`

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#g)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
        ))}
        {pts.map((p, i) => (
          <text key={'t' + i} x={p.x} y={h - 4} textAnchor="middle" fontSize="9" fill="#8a9a87">
            {new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </text>
        ))}
      </svg>
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  )
}