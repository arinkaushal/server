import express from "express";
import {
  getProjects,
  getProjectById,
  saveProject,
  createProject,
  listProjects,
  assignUserToProject,
  getProjectWorkspace,
  getProjectMembers,
} from "../controllers/projectController.js";
import { inviteCollaborator } from "../controllers/projectInviteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireProjectCreator } from "../middlewares/requireProjectCreator.js";
import { requireWorkspaceAccess } from "../middlewares/requireWorkspaceAccess.js";
import { requireCompanyRole } from "../middlewares/requireCompanyRole.js";

const router = express.Router();

// ── Exact / fixed-segment routes FIRST ──────────────────────────────────────
router.get("/",                 authMiddleware, listProjects);
router.post("/",                authMiddleware, requireProjectCreator, createProject);
router.post("/save",            saveProject);

// ── Routes with named sub-segments (must come before /:id) ──────────────────
router.get( "/:projectId/members",   authMiddleware, requireCompanyRole(["ADMIN","SUPER_ADMIN"]), getProjectMembers);
router.post("/:projectId/assign",    authMiddleware, requireCompanyRole(["ADMIN","SUPER_ADMIN"]), assignUserToProject);
router.get( "/:projectId/workspace", authMiddleware, requireWorkspaceAccess, getProjectWorkspace);
router.post("/:id/invite",           inviteCollaborator);

// ── Generic wildcard LAST ────────────────────────────────────────────────────
router.get("/:id", getProjectById);

export default router;