const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  sessionId: String,
  teacherId: String,
  teacherLat: Number,
  teacherLng: Number,
  startTime: Date,
  expiryTime: Date,
  active: Boolean
});

module.exports = mongoose.model("Session", SessionSchema);
