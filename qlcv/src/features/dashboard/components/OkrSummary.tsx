export function OkrSummary() {
  return <div className="od-dashboard__okr-card"><div className="od-dashboard__ring"><span>72%</span></div><div className="od-dashboard__metric-list"><MetricLine label="Objectives at risk" value="2" /><MetricLine label="Key results completed" value="11/18" /><MetricLine label="Issue SLA đúng hạn" value="86%" /><MetricLine label="Billing collection target" value="79%" /></div></div>;
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return <div className="od-dashboard__metric-line"><span>{label}</span><strong>{value}</strong></div>;
}
