const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  sessionId: String,
  studentId: String,
  timestamp: Date
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
