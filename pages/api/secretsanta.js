// pages/api/secretsanta.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const participants = req.body.participants.slice();
    const pairings = [];

    try {
      await generatePairings(participants, pairings);
      res.status(200).json({ pairings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

async function generatePairings(participants, pairings) {
  let remainingParticipants = [...participants];

  for (const name of participants) {
    let receiver;
    let retries = 0;

    while (!receiver && retries < 100) {
      var candidates = remainingParticipants.filter((p) => p !== name);
      receiver = candidates[Math.floor(Math.random() * candidates.length)];

      if (
        receiver === name ||
        pairings.some((pair) => pair.receiver === name)
      ) {
        receiver = null;
        retries++;
      }
    }

    if (receiver === null) {
      throw new Error("Unable to generate valid pairings");
    }

    pairings.push({ santa: name, receiver });
    remainingParticipants = remainingParticipants.filter((p) => p !== receiver);
  }
}
