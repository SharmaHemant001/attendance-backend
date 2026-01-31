const express = require("express");
const router = express.Router();
const Session = require("../models/session");

router.post("/start", async (req, res) => {
  try {
    const { teacherId, lat, lng } = req.body;

    // ✅ Validation
    if (!teacherId || lat === undefined || lng === undefined) {
      return res.status(400).send("Missing required fields");
    }

    const sessionId = Math.random().toString(36).substring(2, 10);

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    const session = await Session.create({
      sessionId,
      teacherId,
      teacherLat: lat,
      teacherLng: lng,
      expiryTime,
      active: true
    });

    res.json({
      sessionId: session.sessionId,
      expiryTime: session.expiryTime
    });
  } catch (error) {
    console.error("Session start error:", error);
    res.status(500).send("Server error while starting session");
  }
});

module.exports = router;

