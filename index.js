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
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.to(socket.id).emit("connectedSuccessfully")
        io.emit("userConnected");
    });

    //send and get message
    socket.on("sendMessage", ({ message, user, chatId, otherUser, name, date }) => {
        const userToSend = getUser(otherUser);
        if (userToSend) {
            io.to(userToSend.socketId).emit("getMessage", {
                message,
                user,
                chatId,
                name,
                date
            });
        }
    });

    socket.on("getNewChat", ({ message, name, user, otherUser }) => {
        const userToSend = getUser(otherUser)
        console.log({ message, name, user, otherUser })
        if (userToSend) {
            io.to(userToSend.socketId).emit("getNewChat", {
                message,
                name,
                user,
                otherUser,
            });
        };
    });

    // socket.on("getAllUsersConect", (userId) => {
    //     const usersToGet = getAllUsersConect(userId);
    //     const MySocketId = getMySocketId(userId);
    //     io.to(MySocketId.socketId).emit("sentAllUsersConect", usersToGet);
    // });

    //when disconnect
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("userDisconnected");
    });
    socket.on("logout", (userId) => {
        removeUserByUserId(userId);
        io.emit("userIsLogout");
    });
    socket.on("getUsersOnline", (data) => {
        console.log(data)
        let num = 0;
        const userToSend = getUser(data.userId);
        data.contacts?.forEach(el => {
            const contact = getUser(el._id)
            if (contact) {
                num += 1
            }
        });
        if (userToSend) {
            io.to(userToSend.socketId).emit("sentKpiUsersConect", {
                users_online: users.length,
                friends_online: num
            });
        }
    })
    socket.on("isThisUserChatConnected", (userId) => {
        const user = getUser(userId)
        console.log(user)
        io.to(socket.id).emit("resUserChatConnected", {
            user: userId,
            isOnline: user ? true : false
        });
    });
});