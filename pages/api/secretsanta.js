// pages/api/secretsanta.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const participants = req.body.participants;
  
      // Pair participants (excluding drawing own name)
      const pairs = participants.map((participant, index) => {
        const remainingParticipants = participants.filter((p, i) => i !== index);
        return pairParticipants(participant, remainingParticipants);
      });
  
      res.status(200).json({ pairs });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
  
  function pairParticipants(participant, remainingParticipants) {  
    // Ensure randomIndex is not equal to the index of the participant
    const randomIndex = Math.floor(Math.random() * remainingParticipants.length);
    const receiver = remainingParticipants[randomIndex];
  
    return {
      santa: participant,
      receiver: receiver
    };
  }
  

  