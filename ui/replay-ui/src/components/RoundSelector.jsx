export default function RoundSelector({ total, current, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <button
        disabled={current === 0}
        onClick={() => onChange(current - 1)}
      >
        Prev
      </button>

      <span style={{ margin: "0 10px" }}>
        Round {current + 1} / {total}
      </span>

      <button
        disabled={current === total - 1}
        onClick={() => onChange(current + 1)}
      >
        Next
      </button>
    </div>
  );
}
