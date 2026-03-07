const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const FIR = require("../models/FIR");
const detectCrimeType = require("../AI/classifier");

/* =====================================
   GENERATE FIR
=========================================*/
router.post(
  "/generate-fir",
  authMiddleware,
  roleMiddleware(["User"]),
  async (req, res) => {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Description required"
        });
      }

      // 🔥 AI Prediction
      const prediction = detectCrimeType(description);

      if (!prediction || !prediction.crimeType) {
        return res.status(400).json({
          success: false,
          message: "Could not detect crime type"
        });
      }

      const newFIR = new FIR({
        ...req.body,
        crimeType: prediction.crimeType,
        sectionsApplied: prediction.sections,
        user: req.user.id
      });

      await newFIR.save();

      res.json({
        success: true,
        aiPrediction: prediction,
        data: newFIR
      });

    } catch (error) {
      res.status(500).json({ success: false });
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
 
// USER TRACK FIR STATUS
router.get("/my-firs", authMiddleware, async (req, res) => {
  try {

    const firs = await FIR.find({ createdBy: req.user.id });

    if (!firs.length) {
      return res.status(404).json({
        success: false,
        message: "No FIRs found"
      });
    }

    res.json({
      success: true,
      firs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
module.exports = router;