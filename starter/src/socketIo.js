const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const config = require("config");
const logger = require("logger");

module.exports = (server) => {
  const io = new Server(server);

  const pubClient = createClient({ url: config.redis.url });
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  const getCookie = (cookieString, name) => {
    const value = `; ${cookieString}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }

    return null;
  };

  // #TODO get user using accessToken
  const getUserData = async (socket) => {
    const accessToken = getCookie(
      socket.handshake.headers.cookie,
      "ship_access_token"
    );

    if (!accessToken) {
      logger.info(
        "Note: socket io anonymous auth. Add user authentication in socketIoService"
      );
    }

    return {
      _id: "anonymous",
    };
  };

  io.use(async (socket, next) => {
    const userData = await getUserData(socket);

    if (userData) {
      // eslint-disable-next-line no-param-reassign
      socket.handshake.data = {
        userId: userData.userId,
      };

      return next();
    }

    return next(new Error("token is invalid"));
  });

  function checkAccessToRoom(roomId, data) {
    let result = false;
    const [roomType, id] = roomId.split("-");

    switch (roomType) {
      case "user":
        result = id === data.userId;
        break;
      default:
        result = true;
    }

    return result;
  }

  io.on("connection", (client) => {
    client.on("subscribe", (roomId) => {
      const { userId } = client.handshake.data;
      const hasAccessToRoom = checkAccessToRoom(roomId, { userId });

      if (hasAccessToRoom) {
        client.join(roomId);
      }
    });

    client.on("unsubscribe", (roomId) => {
      client.leave(roomId);
    });
  });

  console.log(`Socket.io server is started on app instance`);
};
