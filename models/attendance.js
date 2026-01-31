const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },

  studentId: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["present", "late"],
    default: "present"
  },

  manual: {
    type: Boolean,
    default: false
  },

  reason: {
    type: String
  },

  deviceId: {
    type: String
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
