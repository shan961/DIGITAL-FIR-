const mongoose = require("mongoose");

const FIRSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  crimeType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: String,
  date: String,
  time: String,

  sectionsApplied: [String],

  firDraft: {
    type: String,
    required: true
  },

 statusHistory: [
  {
    from: String,
    to: String,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: String
  }
]
,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("FIR", FIRSchema);
