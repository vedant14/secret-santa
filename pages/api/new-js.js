// pages/api/secretsanta.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const participants = req.body.participants;

    const SecretSanta = function () {
      this.names = [];
      this.enforced = Object.create(null);
      this.blacklists = Object.create(null);
    };

    SecretSanta.prototype.add = function (name) {
      if (this.names.indexOf(name) !== -1)
        throw new Error("Cannot redefine " + name);

      this.names.push(name);

      const subapi = {};

      subapi.enforce = (other) => {
        this.enforced[name] = other;
        return subapi;
      };

      subapi.blacklist = (other) => {
        if (!Object.prototype.hasOwnProperty.call(this.blacklists, name))
          this.blacklists[name] = [];

        if (this.blacklists[name].indexOf(other) === -1)
          this.blacklists[name].push(other);

        return subapi;
      };

      return subapi;
    };

    SecretSanta.prototype.generate = function () {
      const pairings = Object.create(null);
      const candidatePairings = Object.create(null);

      this.names.forEach((name) => {
        if (Object.prototype.hasOwnProperty.call(this.enforced, name)) {
          const enforced = this.enforced[name];

          if (this.names.indexOf(enforced) === -1)
            throw new Error(
              name +
                " is paired with " +
                enforced +
                ", which hasn't been declared as a possible pairing"
            );

          Object.keys(pairings).forEach((name) => {
            if (pairings[name] === enforced) {
              throw new Error(
                "Per your rules, multiple persons are paired with " + enforced
              );
            }
          });

          candidatePairings[name] = [this.enforced[name]];
        } else {
          let candidates = this.names.filter((n) => n !== name);

          if (Object.prototype.hasOwnProperty.call(this.blacklists, name))
            candidates = candidates.filter(
              (candidate) => !this.blacklists[name].includes(candidate)
            );

          candidatePairings[name] = candidates;
        }
      });

      const findNextGifter = () => {
        const names = Object.keys(candidatePairings);
        const minCandidateCount = Math.min(
          ...names.map((name) => candidatePairings[name].length)
        );
        const potentialGifters = names.filter(
          (name) => candidatePairings[name].length === minCandidateCount
        );
        return potentialGifters[
          Math.floor(Math.random() * potentialGifters.length)
        ];
      };

      while (Object.keys(candidatePairings).length > 0) {
        const name = findNextGifter();

        if (candidatePairings[name].length === 0)
          throw new Error(
            "We haven't been able to find a match for " +
              name +
              '! Press "Generate" to try again and, if it still doesn\'t work, try removing some exclusions from your rules. Sorry for the inconvenience!'
          );

        const pairing =
          candidatePairings[name][
            Math.floor(Math.random() * candidatePairings[name].length)
          ];
        delete candidatePairings[name];

        Object.keys(candidatePairings).forEach((n) => {
          candidatePairings[n] = candidatePairings[n].filter(
            (c) => c !== pairing
          );
        });

        pairings[name] = pairing;
      }

      return pairings;
    };

    try {
      const santa = new SecretSanta();

      participants.forEach((participant) => {
        santa.add(participant);
      });

      const pairs = santa.generate();

      res.status(200).json({ pairs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
