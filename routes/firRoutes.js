const express = require("express");
const router = express.Router();
const crimeMap = require("../data/crimeMap");
const FIR = require("../models/FIR");

// POST → Generate FIR
router.post("/generate-fir", async (req, res) => {
  try {
    // 1️⃣ Extract data from request body
    const {
      name,
      crimeType,
      description,
      location,
      date,
      time,
      conditions = {}
    } = req.body;

    // 2️⃣ Validate crime type
    const crime = crimeMap[crimeType];
    if (!crime) {
      return res.status(400).json({ error: "Invalid crime type" });
    }

    // 3️⃣ Collect applicable sections
    let sections = [...crime.defaultSections];
    let explanations = [
      {
        section: crime.defaultSections.join(", "),
        explanation: crime.explanation
      }
    ];

    // 4️⃣ Apply conditions
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

    // 5️⃣ Remove duplicates
    sections = [...new Set(sections)];

    // 6️⃣ Generate FIR draft
    const firDraft = `
I, ${name}, wish to state that on ${date} at approximately ${time},
at ${location}, the following incident took place:

"${description}"

The above act discloses the commission of offences punishable under
${sections.join(", ")} of the Bharatiya Nyaya Sanhita, 2023.

I request you to kindly register an FIR and take necessary legal action
in accordance with law.

I am ready to cooperate with the investigation.
    `.trim();

    // 7️⃣ Save FIR to MongoDB
    const newFIR = new FIR({
      name,
      crimeType,
      description,
      location,
      date,
      time,
      sectionsApplied: sections,
      firDraft
    });

    await newFIR.save();

    // 8️⃣ Send response
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


// GET → Fetch FIR by ID
const mongoose = require("mongoose");


router.get("/firs/:id", async (req, res) => {
  try {
    const id = req.params.id.trim();

    // ✅ Validate ObjectId
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

    res.json({
      success: true,
      data: fir
    });

  } catch (error) {
    console.error("Error in GET /firs/:id:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});


// PATCH → Update FIR Status
router.patch("/firs/:id/status", async (req, res) => {
  try {
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

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    // Find FIR first
    const fir = await FIR.findById(id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found"
      });
    }

    // Prevent duplicate status update
    if (fir.status === status) {
      return res.status(400).json({
        success: false,
        message: "FIR already has this status"
      });
    }

    // Push history record
    fir.statusHistory.push({
      from: fir.status,
      to: status,
      updatedBy: "Police Officer" // later from auth
    });

    // Update status
    fir.status = status;

    await fir.save();

    res.json({
      success: true,
      message: "FIR status updated successfully",
      firId: fir._id,
      previousStatus: fir.statusHistory.slice(-1)[0].from,
      newStatus: fir.status
    });

  } catch (error) {
    console.error("Error in PATCH:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

const detectCrimeType = require("../AI/classifier");

router.post("/ai/predict-crime", (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      message: "Description required"
    });
  }

  const result = detectCrimeType(description);

  if (!result.crimeType) {
    return res.json({
      success: true,
      prediction: null,
      message: "Could not detect crime type"
    });
  }

  res.json({
    success: true,
    prediction: result
  });
});

router.get("/firs", async (req, res) => {
  try {
    const { status, page = 1, limit = 5 } = req.query;

    const query = status ? { status } : {};

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
    console.error("Error fetching FIR list:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// DELETE → Delete FIR by ID
router.delete("/firs/:id", async (req, res) => {
  try {
    const id = req.params.id.trim();

    // Validate ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID"
      });
    }

    // Delete FIR
    const deletedFIR = await FIR.findByIdAndDelete(id);

    if (!deletedFIR) {
      return res.status(404).json({
        success: false,
        message: "FIR not found"
      });
    }

    res.json({
      success: true,
      message: "FIR deleted successfully",
      deletedId: deletedFIR._id
    });

  } catch (error) {
    console.error("Error deleting FIR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// SEARCH → Find FIRs with filters
router.get("/firs/search", async (req, res) => {
  try {
    const {
      name,
      crimeType,
      status,
      location,
      fromDate,
      toDate
    } = req.query;

    let filter = {};

    // Dynamic filters
    if (name) filter.name = { $regex: name, $options: "i" };
    if (crimeType) filter.crimeType = crimeType;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: "i" };

    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const results = await FIR.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error("Search FIR error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});


module.exports = router;
