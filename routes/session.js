const express = require("express");
const router = express.Router();
const Session = require("../models/session");
const auth = require("../middleware/auth");

router.post("/start", auth, async (req, res) => {
  // 1️⃣ ROLE CHECK
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied");
  }

  // 2️⃣ LOCATION VALIDATION
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).send("Location required");
  }

  // 3️⃣ CREATE SESSION
  const sessionId = Math.random().toString(36).substring(2, 8);

  const session = await Session.create({
    sessionId,
    teacherId: req.user.userId, // 🔥 FROM JWT
    teacherLat: lat,
    teacherLng: lng,
    active: true,
    expiryTime: new Date(Date.now() + 10 * 60 * 1000)
  });

  res.json({ sessionId });
});

module.exports = router;
