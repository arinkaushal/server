import User from "../models/User.js";
import ProjectMember from "../models/ProjectMember.js";

export const getCompanyUsers = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const companyName = req.session.user.companyName;
  const currentUserId = req.session.user.id;
  const { projectId } = req.query;

  console.log("session from userController:", req.session.user);
  if (!companyName) {
    console.log("No companyName in session user");
    return res.json([]);
  }

  let excludedUserIds = [currentUserId];

  if (projectId) {
    const existingMembers = await ProjectMember.find({ project: projectId });
    const memberIds = existingMembers.map((m) => m.user.toString());
    excludedUserIds = excludedUserIds.concat(memberIds);
  }

  const users = await User.find({
    companyName,
    _id: { $nin: excludedUserIds }, 
    companyRole: { $nin: ["ADMIN", "SUPER_ADMIN"] },
    isApproved: true
  });
  
  console.log("getCompanyUsers:", users);
  res.json(users);
};

