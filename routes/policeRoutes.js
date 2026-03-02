const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const FIR = require("../models/FIR");

/* =====================================
   VIEW ASSIGNED FIRs
===================================== */
router.get(
  "/assigned-firs",
  authMiddleware,
  roleMiddleware(["Police"]),
  async (req, res) => {
    try {
      const firs = await FIR.find({ assignedTo: req.user.id });

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
   UPDATE STATUS
===================================== */
router.patch(
  "/firs/:id/status",
  authMiddleware,
  roleMiddleware(["Police"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      const fir = await FIR.findById(req.params.id);

      if (!fir) {
        return res.status(404).json({ success: false, message: "FIR not found" });
      }

      fir.statusHistory.push({
        from: fir.status,
        to: status,
        updatedBy: req.user.id
      });

      fir.status = status;
      await fir.save();

      res.json({
        success: true,
        message: "Status updated"
      });

    } catch (error) {
      res.status(500).json({ success: false });
    }
  }
);

module.exports = router;