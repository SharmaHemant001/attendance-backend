const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Session = require("../models/session");
const Attendance = require("../models/attendance");
const getDistance = require("../utils/distance");


// ==================================================
// 🧑‍🎓 STUDENT: MARK ATTENDANCE
// ==================================================
router.post("/mark", auth, async (req, res) => {
  try {
    // 1️⃣ Only students allowed
    if (req.user.role !== "student") {
      return res.status(403).send("Only students can mark attendance");
    }

    const studentId = req.user.userId; // 🔐 from JWT
    const { sessionId, lat, lng, deviceId } = req.body;

    if (!sessionId || !lat || !lng) {
      return res.status(400).send("Missing required fields");
    }

    // 2️⃣ Check session
    const session = await Session.findOne({ sessionId });

    if (!session || !session.active) {
      return res.status(400).send("Session invalid");
    }

    // 3️⃣ Expiry check
    if (new Date() > session.expiryTime) {
      session.active = false;
      await session.save();
      return res.status(400).send("Session expired");
    }

    // 4️⃣ Prevent duplicate attendance
    const already = await Attendance.findOne({ sessionId, studentId });
    if (already) {
      return res.status(400).send("Already marked");
    }

    // 5️⃣ Location validation
    const distance = getDistance(
      session.teacherLat,
      session.teacherLng,
      lat,
      lng
    );

    if (distance > 30) {
      return res.status(400).send("Out of range");
    }

    // 6️⃣ Save attendance
    await Attendance.create({
      sessionId,
      studentId,
      deviceId
    });

    res.send("Attendance marked");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// ==================================================
// 👨‍🏫 TEACHER: VIEW ATTENDANCE LIST
// ==================================================
router.get("/session/:sessionId", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).send("Access denied");
    }

    const records = await Attendance.find({
      sessionId: req.params.sessionId
    }).sort({ timestamp: 1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch attendance");
  }
});


// ==================================================
// ✍️ TEACHER: MANUAL ATTENDANCE OVERRIDE
// ==================================================
router.post("/manual", auth, async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// ==================================================
module.exports = router;
