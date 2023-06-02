require("dotenv/config")

const io = require("socket.io")(8900, {
    cors: {
        origin: process.env.URL_APP,
    },
});

const axios = require("axios")

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user._id === userId._id) &&
        users.push({ ...userId, socketId: socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const removeUserByUserId = (userId) => {

    users = users.filter((user) => user._id !== userId);
};

const getUser = (userId) => {
    return users.find((user) => user._id === userId);
};

const getAllUsersConect = (userId) => {
    return users
}
const getMySocketId = (userId) => {
    return users.find((user) => user._id === userId);
}

io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.", socket.id);
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("sentAllUsersConect", users);
    });

    //send and get message
    socket.on("sendMessage", ({ message, user, chatId, otherUser, name }) => {
        const userToSend = getUser(otherUser);
        if (userToSend) {
            io.to(userToSend.socketId).emit("getMessage", {
                message,
                user,
                chatId,
                name
            });
        }
    });

    socket.on("getAllUsersConect", (userId) => {
        const usersToGet = getAllUsersConect(userId);
        const MySocketId = getMySocketId(userId);
        io.to(MySocketId.socketId).emit("sentAllUsersConect", usersToGet);
    });

    //when disconnect
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
    socket.on("logout", (userId) => {
        removeUserByUserId(userId);
        io.emit("sentAllUsersConect", users);
    })
});