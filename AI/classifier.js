const patterns = {
  theft: ["steal", "stole", "snatch", "robbed", "taken", "pickpocket"],
  assault: ["hit", "slap", "punch", "attack", "beat", "hurt"],
  cybercrime: ["hack", "otp", "fraud", "scam", "phishing", "online"],
  harassment: ["abuse", "threat", "harass", "blackmail"],
  trespass: ["entered my house", "broke in", "unauthorized entry"]
};

function detectCrimeType(text) {
  text = text.toLowerCase();

  let scores = {};

  for (let crime in patterns) {
    scores[crime] = 0;

    patterns[crime].forEach(word => {
      if (text.includes(word)) {
        scores[crime]++;
      }
    });
  }

  // find highest score
  let bestMatch = null;
  let maxScore = 0;

  for (let crime in scores) {
    if (scores[crime] > maxScore) {
      maxScore = scores[crime];
      bestMatch = crime;
    }
  }

  return {
    crimeType: bestMatch,
    confidence: maxScore > 0 ? (maxScore / 3).toFixed(2) : 0
  };
}

module.exports = detectCrimeType;
