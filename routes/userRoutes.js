const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const FIR = require("../models/FIR");
const detectCrimeType = require("../AI/classifier");

/* =====================================
   GENERATE FIR
===================================== */
router.post(
  "/generate-fir",
  authMiddleware,
  roleMiddleware(["User"]),
  async (req, res) => {
    try {

      const { name, description } = req.body;

      // Validate input
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: "Name and description are required"
        });
      }

      // Detect crime type using AI
      const prediction = detectCrimeType(description);

      if (!prediction || !prediction.crimeType) {
        return res.status(400).json({
          success: false,
          message: "Could not detect crime type"
        });
      }

      // Generate FIR draft automatically
      const firDraft = `
Complaint by ${name}.

Incident Description:
${description}

AI Detected Crime Type: ${prediction.crimeType}

Applicable Sections:
${prediction.sections ? prediction.sections.join(", ") : "Not available"}

This complaint has been recorded in the system.
`;

      // Create FIR
      const newFIR = new FIR({
        name,
        description,
        firDraft,
        crimeType: prediction.crimeType,
        sectionsApplied: prediction.sections || [],
        user: req.user.id
      });

      await newFIR.save();

      res.json({
        success: true,
        message: "FIR generated successfully",
        aiPrediction: prediction,
        data: newFIR
      });

    } catch (error) {
      console.error("Generate FIR Error:", error);

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/* =====================================
   VIEW OWN FIRs
===================================== */
router.get(
  "/my-firs",
  authMiddleware,
  roleMiddleware(["User"]),
  async (req, res) => {
    try {

      const firs = await FIR.find({ user: req.user.id }).sort({ createdAt: -1 });

      res.json({
        success: true,
        count: firs.length,
        data: firs
      });

    } catch (error) {
      res.status(500).json({ success: false });
    }
  }
);

/* =====================================
   PROFILE
===================================== */
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["User"]),
  (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  }
);

module.exports = router;