const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const crimeMap = require("../data/crimeMap");
const FIR = require("../models/FIR");
const detectCrimeType = require("../AI/classifier");
const authMiddleware = require("../middleware/authMiddleware");


/* =====================================================
   ✅ POST → Generate FIR (Citizen Only)
===================================================== */
router.post("/generate-fir", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "Citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can generate FIR"
      });
    }

    const {
      name,
      crimeType,
      description,
      location,
      date,
      time,
      conditions = {}
    } = req.body;

    const crime = crimeMap[crimeType];
    if (!crime) {
      return res.status(400).json({ error: "Invalid crime type" });
    }

    let sections = [...crime.defaultSections];
    let explanations = [
      {
        section: crime.defaultSections.join(", "),
        explanation: crime.explanation
      }
    ];

    if (crime.conditions) {
      for (let condition in conditions) {
        if (conditions[condition] && crime.conditions[condition]) {
          sections.push(crime.conditions[condition].section);
          explanations.push({
            section: crime.conditions[condition].section,
            explanation: crime.conditions[condition].explanation
          });
        }
      }
    }

    sections = [...new Set(sections)];

    const firDraft = `
I, ${name}, wish to state that on ${date} at approximately ${time},
at ${location}, the following incident took place:

"${description}"

The above act discloses the commission of offences punishable under
${sections.join(", ")} of the Bharatiya Nyaya Sanhita, 2023.

I request you to kindly register an FIR and take necessary legal action.

I am ready to cooperate with the investigation.
    `.trim();

    const newFIR = new FIR({
      name,
      crimeType,
      description,
      location,
      date,
      time,
      sectionsApplied: sections,
      firDraft,
      user: req.user.id   // 🔐 attach logged-in user
    });

    await newFIR.save();

    res.json({
      success: true,
      firId: newFIR._id,
      crimeTitle: crime.title,
      sectionsApplied: sections,
      explanations,
      firDraft,
      status: newFIR.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/* =====================================================
   ✅ GET → Fetch FIR by ID (Owner or Police)
===================================================== */
router.get("/firs/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID"
      });
    }

    const fir = await FIR.findById(id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found"
      });
    }

    // 🔐 Ownership check
    if (
      req.user.role === "Citizen" &&
      fir.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      data: fir
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   ✅ PATCH → Update FIR Status (Police Only)
===================================================== */
router.patch("/firs/:id/status", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "Police") {
      return res.status(403).json({
        success: false,
        message: "Only police can update FIR status"
      });
    }

    const id = req.params.id.trim();
    const { status } = req.body;

    const allowedStatuses = [
      "Draft Generated",
      "Submitted",
      "Registered",
      "Under Investigation",
      "Closed",
      "Rejected"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const fir = await FIR.findById(id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found"
      });
    }

    if (fir.status === status) {
      return res.status(400).json({
        success: false,
        message: "FIR already has this status"
      });
    }

    fir.statusHistory.push({
      from: fir.status,
      to: status,
      updatedBy: req.user.role
    });

    fir.status = status;
    await fir.save();

    res.json({
      success: true,
      message: "FIR status updated successfully",
      firId: fir._id,
      newStatus: fir.status
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   ✅ GET → List FIRs
   Citizen → Only Own
   Police → All
===================================================== */
router.get("/firs", authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 5 } = req.query;

    let query = {};

    if (req.user.role === "Citizen") {
      query.user = req.user.id;
    }

    if (req.user.role === "Police" && status) {
      query.status = status;
    }

    const firs = await FIR.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await FIR.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      data: firs
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   ✅ DELETE → FIR (Police Only)
===================================================== */
router.delete("/firs/:id", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "Police") {
      return res.status(403).json({
        success: false,
        message: "Only police can delete FIR"
      });
    }

    const id = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID"
      });
    }

    const deletedFIR = await FIR.findByIdAndDelete(id);

    if (!deletedFIR) {
      return res.status(404).json({
        success: false,
        message: "FIR not found"
      });
    }

    res.json({
      success: true,
      message: "FIR deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   ✅ AI Crime Prediction (Protected)
===================================================== */
router.post("/ai/predict-crime", authMiddleware, (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      message: "Description required"
    });
  }

  const result = detectCrimeType(description);

  res.json({
    success: true,
    prediction: result || null
  });
});


module.exports = router;