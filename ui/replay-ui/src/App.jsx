import { useEffect, useState } from "react";
import RoundSelector from "./components/RoundSelector";
import CountryTable from "./components/CountryTable";
import ActionLog from "./components/ActionLog";

function App() {
  const [match, setMatch] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/data/match_log.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load match_log.json: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMatch(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setMatch({ rounds: [] });
      });
  }, []);

  if (!match && !error) return <div>Loading match...</div>;
  if (error) return <div style={{ padding: 20 }}>Error loading match: {error}</div>;
  if (!match?.rounds?.length)
    return <div style={{ padding: 20 }}>No rounds found in match_log.json</div>;

  const safeIdx = Math.min(Math.max(roundIdx, 0), match.rounds.length - 1);
  const round = match.rounds[safeIdx];

  return (
    <div style={{ padding: 20 }}>
      <h1>IGTS Match Replay</h1>

      <RoundSelector
        total={match.rounds.length}
        current={safeIdx}
        onChange={setRoundIdx}
      />

      <h2>Actions</h2>
      <ActionLog actions={round.actions} />

      <h2>Economy (After Round)</h2>
      <CountryTable countries={round.state_after.countries} />
    </div>
  );
}

export default App;
