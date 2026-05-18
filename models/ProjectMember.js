import mongoose from "mongoose";

const ProjectMemberSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    enum: [
      "LEAD_AUTOMATION_ENGINEER",
      "AUTOMATION_ENGINEER",
      "MACHINE_OPERATOR",
      "SUPERVISOR",
      "QUALITY_ENGINEER",
      "MAINTENANCE_ENGINEER"
    ],
    required: true
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

ProjectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export default mongoose.model("ProjectMember", ProjectMemberSchema);
