import { useState } from 'react';

export default function Home() {
  const [participants, setParticipants] = useState('');
  const [pairs, setPairs] = useState([]);

  const generatePairs = async () => {
    try {
      const response = await fetch('/api/secretsanta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participants: participants.split('\n') }),
      });

      const data = await response.json();
      setPairs(data.pairs);
    } catch (error) {
      console.error('Error generating Secret Santa pairs:', error);
    }
  };

  return (
    <div>
      <h1>Secret Santa Generator</h1>
      <textarea
        placeholder="Enter participants (one per line)"
        value={participants}
        onChange={(e) => setParticipants(e.target.value)}
      ></textarea>
      <button onClick={generatePairs}>Generate Pairs</button>

      {pairs.length > 0 && (
        <div>
          <h2>Secret Santa Pairs</h2>
          <ul>
            {pairs.map((pair, index) => (
              <li key={index}>
                {pair.santa} ➔ {pair.receiver}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
