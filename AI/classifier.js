const patterns = {
  theft: ["steal", "stole", "snatch", "robbed", "taken", "pickpocket"],
  assault: ["hit", "slap", "punch", "attack", "beat", "hurt"],
  cybercrime: ["hack", "otp", "fraud", "scam", "phishing", "online"],
  harassment: ["abuse", "threat", "harass", "blackmail"],
  trespass: ["entered my house", "broke in", "unauthorized entry"]
};

// IPC sections mapping
const sectionsMap = {
  theft: ["IPC 379"],
  assault: ["IPC 351", "IPC 352"],
  cybercrime: ["IT Act 66", "IT Act 66C"],
  harassment: ["IPC 503", "IPC 506"],
  trespass: ["IPC 441", "IPC 447"]
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

  // if nothing detected
  if (!bestMatch) {
    return {
      crimeType: "unknown",
      sections: [],
      confidence: 0
    };
  }

  return {
    crimeType: bestMatch,
    sections: sectionsMap[bestMatch] || [],
    confidence: (maxScore / 3).toFixed(2)
  };

}

module.exports = detectCrimeType;