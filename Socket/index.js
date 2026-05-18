import { Server } from "socket.io";
import Project from "../models/Project.js";

export const initSocket = (server, sessionMiddleware) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on("connection", (socket) => {
    const user = socket.request.session.user;
    if (!user) return socket.disconnect();

    socket.on("join-project", async (projectId) => {
      const project = await Project.findOne({
        _id: projectId,
      });
      if (!project) return;
      socket.join(projectId);
    });

    socket.on("leave-project", (projectId) => {
      socket.leave(projectId);
    });

    // Live drag relay — forward single-node position to everyone else in the room
    socket.on("node:drag", ({ projectId, id, position }) => {
      socket.to(projectId).emit("node:drag", { id, position });
    });

    socket.on("nodes:update", ({ projectId, nodes }) => {
      socket.to(projectId).emit("nodes:update", nodes);
    });

    socket.on("edges:update", ({ projectId, edges }) => {
      socket.to(projectId).emit("edges:update", edges);
    });
  });
};
