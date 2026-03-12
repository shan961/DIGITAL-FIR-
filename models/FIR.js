const mongoose = require("mongoose");

const FIRSchema = new mongoose.Schema({

  name: String,

  crimeType: String,

  description: String,

  sectionsApplied: [String],

  firDraft: String,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  statusHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("FIR", FIRSchema);