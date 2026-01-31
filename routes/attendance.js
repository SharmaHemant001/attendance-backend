
const auth = require("../middleware/auth");


const express = require("express");
const router = express.Router();
const Session = require("../models/session");
const Attendance = require("../models/attendance");
const getDistance = require("../utils/distance");

router.post("/mark", auth, async (req, res) => {
  const studentId = req.user.userId; // 🔥 from token
  const { sessionId, lat, lng, deviceId } = req.body;

  router.get("/list/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;

  const records = await Attendance.find({ sessionId });

  res.json(records);
});


  if (!session || !session.active)
    return res.status(400).send("Session invalid");

  if (new Date() > session.expiryTime) {
  session.active = false;
  await session.save();
  return res.status(400).send("Session expired");
}


  const already = await Attendance.findOne({
    sessionId: req.body.sessionId,
    studentId: req.body.studentId
  });

  if (already)
    return res.status(400).send("Already marked");

  const distance = getDistance(
    session.teacherLat,
    session.teacherLng,
    req.body.lat,
    req.body.lng
  );

  if (distance > 30)
    return res.status(400).send("Out of range");

  await Attendance.create({
    sessionId: req.body.sessionId,
    studentId: req.body.studentId,
    timestamp: new Date()
  });

  res.send("Attendance marked");
});

router.get("/session/:sessionId", auth, async (req, res) => {
  // Only teacher allowed
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied");
  }

  try {
    const records = await Attendance.find({
      sessionId: req.params.sessionId
    }).sort({ timestamp: 1 });

    res.json(records);
  } catch (err) {
    res.status(500).send("Failed to fetch attendance");
  }
});

router.post("/manual", auth, async (req, res) => {
  // Only teacher allowed
  if (req.user.role !== "teacher") {
    return res.status(403).send("Only teacher can do this");
  }

  const { sessionId, studentId, reason } = req.body;

  if (!sessionId || !studentId || !reason) {
    return res.status(400).send("All fields required");
  }

  const already = await Attendance.findOne({ sessionId, studentId });
  if (already) {
    return res.status(400).send("Attendance already marked");
  }

  await Attendance.create({
    sessionId,
    studentId,
    manual: true,
    reason,
    status: "present"
  });

  res.send("Attendance marked manually");
});


module.exports = router;

