import { ACTIONS } from "./actions.js";

const userMapping = {};

export const socketHandler = (io) => {

  function getConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
      (socketId) => {
        return {
          socketId,
          username: userMapping[socketId],
        };
      }
    );
  }

  io.on("connection", (socket) => {
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
      userMapping[socket.id] = username;
      socket.join(roomId);
      const clients = getConnectedClients(roomId);
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });
    });


    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
            socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });

    });
    socket.on(ACTIONS.SYNC_CODE, ({ code,socketId }) => {
console.log("Syncing code to socket:", socketId, code);      
            io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });

    });

    socket.on("disconnecting", () => {
        const rooms = Array.from(socket.rooms);
        rooms.forEach((roomId) => {
          socket.in(roomId).emit(ACTIONS.DISCONNECT, {
            socketId: socket.id,
            username: userMapping[socket.id],
          });
        });
        delete userMapping[socket.id];
        socket.leave();
    });

    socket.on("message", (msg) => {
      console.log("Message received:", msg);
      io.emit("message", msg); // Broadcast to all
    });
  });
};
