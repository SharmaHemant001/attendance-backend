const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

router.post("/start", async (req, res) => {
  const session = await Session.create({
    sessionId: Math.random().toString(36).substring(2),
    teacherId: req.body.teacherId,
    teacherLat: req.body.lat,
    teacherLng: req.body.lng,
    startTime: new Date(),
    expiryTime: new Date(Date.now() + 10 * 60 * 1000),
    active: true
  });

  res.json(session);
});

module.exports = router;

router.post("/end", async (req, res) => {
  const session = await Session.findOne({ sessionId: req.body.sessionId });

  if (!session) return res.status(404).send("Session not found");

  session.active = false;
  await session.save();

  res.send("Session ended");
});
