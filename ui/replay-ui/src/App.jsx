import { useEffect, useState } from "react";
import RoundSelector from "./components/RoundSelector";
import CountryTable from "./components/CountryTable";
import ActionLog from "./components/ActionLog";

function App() {
  const [match, setMatch] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);

  useEffect(() => {
    fetch("/data/match_log.json")
      .then(res => res.json())
      .then(setMatch);
  }, []);

  if (!match) return <div>Loading match...</div>;

  const round = match.rounds[roundIdx];

  return (
    <div style={{ padding: 20 }}>
      <h1>IGTS Match Replay</h1>

      <RoundSelector
        total={match.rounds.length}
        current={roundIdx}
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
