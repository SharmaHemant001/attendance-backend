const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const getDistance = require("../utils/distance");

router.post("/mark", async (req, res) => {
  const session = await Session.findOne({ sessionId: req.body.sessionId });

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

module.exports = router;

