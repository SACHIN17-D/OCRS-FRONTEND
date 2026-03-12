const STEPS = [
  { key: 'reported',        label: 'Reported',        icon: '🚨' },
  { key: 'proof_submitted', label: 'Proof Submitted',  icon: '📎' },
  { key: 'under_review',   label: 'Under Review',     icon: '🔍' },
  { key: 'resolved',       label: 'Resolved',         icon: '✅' },
];

const STATUS_ORDER = ['reported', 'proof_submitted', 'under_review', 'resolved', 'rejected'];

export default function StatusTracker({ status }) {
  if (status === 'rejected') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px', background: '#f9fafb',
        border: '1px solid #e5e7eb', borderRadius: 10,
      }}>
        <span style={{ fontSize: 20 }}>❌</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Report Rejected</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>This report was reviewed and rejected by admin</div>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {STEPS.map((step, idx) => {
        const stepIndex = STATUS_ORDER.indexOf(step.key);
        const isDone = stepIndex < currentIndex;
        const isActive = step.key === status;
        const isPending = stepIndex > currentIndex;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            {/* Step */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                background: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--bg2)',
                border: `2px solid ${isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--border2)'}`,
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 0 0 4px rgba(192,57,43,0.12)' : 'none',
              }}>
                {isDone ? <span style={{ color: 'white', fontSize: 14 }}>✓</span> : <span>{step.icon}</span>}
              </div>
              <span style={{
                fontSize: 11, fontWeight: isActive ? 600 : 400,
                color: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--muted)',
                textAlign: 'center', lineHeight: 1.3,
              }}>{step.label}</span>
            </div>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 22,
                background: isDone ? 'var(--green)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
