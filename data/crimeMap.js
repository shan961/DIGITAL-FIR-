// backend/data/crimeMap.js
// Bharatiya Nyaya Sanhita (BNS) based mapping

const crimeMap = {

  theft: {
    title: "Theft",
    defaultSections: ["BNS 303"],
    explanation: "Dishonestly taking movable property without consent.",
    conditions: {
      night: {
        section: "BNS 305",
        explanation: "Theft in dwelling house or during night."
      },
      vehicle: {
        section: "BNS 304",
        explanation: "Punishment for theft of property such as vehicle."
      }
    }
  },

  robbery: {
    title: "Robbery",
    defaultSections: ["BNS 309"],
    explanation: "Theft or extortion involving violence or threat.",
    conditions: {
      weaponUsed: {
        section: "BNS 311",
        explanation: "Robbery using deadly weapon or causing grievous hurt."
      }
    }
  },

  assault: {
    title: "Assault",
    defaultSections: ["BNS 121"],
    explanation: "Threat or attempt to cause physical harm.",
    conditions: {
      hurt: {
        section: "BNS 122",
        explanation: "Voluntarily causing hurt."
      },
      grievous: {
        section: "BNS 124",
        explanation: "Voluntarily causing grievous hurt."
      },
      weaponUsed: {
        section: "BNS 123",
        explanation: "Causing hurt using dangerous weapons."
      }
    }
  },

  murder: {
    title: "Murder",
    defaultSections: ["BNS 103"],
    explanation: "Intentional causing of death.",
    conditions: {
      attempt: {
        section: "BNS 109",
        explanation: "Attempt to commit murder."
      }
    }
  },

  harassment: {
    title: "Sexual / Criminal Harassment",
    defaultSections: ["BNS 69"],
    explanation: "Unwelcome physical, verbal or non-verbal conduct.",
    conditions: {
      woman: {
        section: "BNS 79",
        explanation: "Word or gesture intended to insult the modesty of a woman."
      },
      stalking: {
        section: "BNS 78",
        explanation: "Repeated following or contacting despite disinterest."
      }
    }
  },

  domesticViolence: {
    title: "Domestic Violence / Cruelty",
    defaultSections: ["BNS 85"],
    explanation: "Cruelty by husband or relatives of woman.",
    conditions: {
      dowry: {
        section: "Dowry Prohibition Act",
        explanation: "Demand or giving of dowry."
      }
    }
  },

  cheating: {
    title: "Cheating",
    defaultSections: ["BNS 316"],
    explanation: "Deceiving a person to gain property or advantage.",
    conditions: {
      impersonation: {
        section: "BNS 317",
        explanation: "Cheating by personation."
      }
    }
  },

  criminalBreachOfTrust: {
    title: "Criminal Breach of Trust",
    defaultSections: ["BNS 314"],
    explanation: "Dishonest misappropriation of entrusted property."
  },

  cybercrime: {
    title: "Cyber Crime",
    defaultSections: ["IT Act 66C"],
    explanation: "Offences involving computers, digital identity or data.",
    conditions: {
      hacking: {
        section: "IT Act 66",
        explanation: "Unauthorized access or damage to computer resources."
      },
      onlineFraud: {
        section: "IT Act 66D",
        explanation: "Cheating by personation using computer resources."
      },
      obsceneContent: {
        section: "IT Act 67",
        explanation: "Publishing or transmitting obscene content online."
      }
    }
  },

  defamation: {
    title: "Defamation",
    defaultSections: ["BNS 354"],
    explanation: "Harming reputation by false statements."
  },

  missingPerson: {
    title: "Missing Person",
    defaultSections: ["General Diary Entry"],
    explanation: "Reporting missing individual to police."
  }

};

module.exports = crimeMap;
