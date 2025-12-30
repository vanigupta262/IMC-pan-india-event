export default function CountryTable({ countries }) {
  return (
    <table border="1" cellPadding="6">
      <thead>
        <tr>
          <th>Country</th>
          <th>Economy</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(countries).map(([id, c]) => (
          <tr key={id}>
            <td>{id}</td>
            <td>{c.economy.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
