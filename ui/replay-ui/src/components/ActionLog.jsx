export default function ActionLog({ actions }) {
  return (
    <div>
      {Object.entries(actions).map(([pid, acts]) => (
        <div key={pid}>
          <b>Player {pid}</b>
          <ul>
            {acts.length === 0 && <li>No action</li>}
            {acts.map((a, i) => (
              <li key={i}>
                {a.type} → {a.target ?? ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
