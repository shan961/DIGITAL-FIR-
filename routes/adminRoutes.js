const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const FIR = require("../models/FIR");
const User = require("../models/User");

/* =====================================
   ANALYTICS DASHBOARD
===================================== */
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalFIRs = await FIR.countDocuments();
      const openCases = await FIR.countDocuments({ status: "Under Investigation" });

      res.json({
        success: true,
        stats: { totalUsers, totalFIRs, openCases }
      });

    } catch (error) {
      res.status(500).json({ success: false });
    }
  }
);

/* =====================================
   DELETE FIR
===================================== */
router.delete(
  "/firs/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      await FIR.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "FIR deleted"
      });

    } catch (error) {
      res.status(500).json({ success: false });
    }
  }
);

/* =====================================
   ASSIGN FIR TO POLICE
===================================== */
router.patch(
  "/assign-fir/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const { policeId } = req.body;

      const fir = await FIR.findById(req.params.id);
      fir.assignedTo = policeId;
      fir.status = "Under Investigation";

      await fir.save();

      res.json({
        success: true,
        message: "FIR assigned to police"
      });

    } catch (error) {
      res.status(500).json({ success: false });
    }
  }
);

/* =====================================
   GET ALL USERS
===================================== */
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  }
);
router.get(
  "/ai-analytics",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    const stats = await FIR.aggregate([
      {
        $group: {
          _id: "$crimeType",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      crimeDistribution: stats
    });
  }
);

module.exports = router;