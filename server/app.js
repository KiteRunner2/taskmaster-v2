// require('dotenv').config();
const express = require('express');
const async = require('async');
const axios = require('axios');
const app = express();
const http = require('http').createServer(app);
var io = require('socket.io')(http);
const qs = require('qs');
const { uuid } = require('uuidv4');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
// import { v4 as uuidv4 } from 'uuid';
const userController = require('../server/controllers/user');
let db = require('./models');
let user = require('./user.json');
let usersSockets = new Map();
let userRooms = new Map();
// let sharedDashboard = require('./shared.json');

// const db_host = process.env.DB_HOST;
// console.log(process.env);

async function getUsers() {
    const result = await db.find({}, { email: 1 });
    // console.log('function getUsers called', result);
}

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

// getUsers();
//route to get all users
app.get('/api/getAllUsers', async (req, res) => {
    // console.log('api getAllUsers called');
    const response = await db.userprofile.find({}, 'email');
    if (response.length > 0) {
        res.json(response);
    } else res.json({ answer: 'empty set!' });
});
app.post('/api/insertShared', async (req, res) => {
    // console.log('insertShared api called', req.body);
    let sharedDashboard = {
        sharedFrom: req.body.sharedFrom,
        sharedTo: req.body.sharedTo,
        sharedDashboards: req.body.dashboards.toString(),
    };
    // console.log(sharedDashboard);
    const filter = {
        sharedFrom: req.body.sharedFrom,
        sharedTo: req.body.sharedTo,
    };
    // console.log('filter:', filter);
    const result = await db.shared
        .findOneAndReplace(filter, sharedDashboard, {
            upsert: true,
            returnNewDocument: true,
        })
        .then((response) => response);
    // console.log(result);
    res.json(result);
});
app.get('/api/getUser/:email', userController.getUser);

app.get('/api/getUserName/:email', async (req, res) => {
    const query = { email: req.params.email };
    const response = await db.userprofile.find(query, {
        _id: 0,
        name: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
    });
    if (response.length > 0) {
        res.json(response[0]);
    } else {
        res.json({ answer: 'nothing found' });
    }
});

app.get('/api/authUser/:email', async (req, res) => {
    // console.log(req.params);
    const query = { email: req.params.email };
    const response = await db.userauth.find(query);
    if (response.length > 0) {
        res.json(response[0].password);
    } else res.json({ answer: 'nothing found' });
    // res.end('ok');
});

app.get('/api/getUserPassword/:email', async (req, res) => {
    // console.log(req.params);
    const query = { email: req.params.email };
    const response = await db.userprofile.find(query, 'password');
    if (response.length > 0) {
        res.json(response);
    } else res.json({ answer: 'nothing found' });
    // res.end('ok');
});

app.post('/api/addUser', async (req, res) => {
    // console.log(req.body);
    user = { ...user, ...req.body };
    user.dashboards[0].owner = req.body.email;
    user.dashboards[0].id = uuid();
    user.dashboards[0].columns[0].id = uuid();
    user.dashboards[0].columns[0].cards[0].id = uuid();
    let passwordHash = '';
    const saltRounds = 10;
    passwordHash = await bcrypt.hash(req.body.password, saltRounds);
    console.log(`[addUser] (hash=${passwordHash}) req.body:`, user);
    user.password = passwordHash;

    try {
        const response = await db.userprofile.create(user);
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

app.post('/api/login', userController.login);

app.post('/api/notify', async (req, res) => {
    console.log(req.body);
    // user = { ...user, ...req.body };
    // const response = await db.userprofile.create(user);
    // const url = 'https://rudzki.ca/wyslijmail.php';
    // const options = {
    //     method: 'post',
    //     url: 'https://rudzki.ca/wyslijmail.php',
    //     data: qs.stringify(req.body),
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    //     },
    // };
    // const response = await axios(options).then((answer) => {
    //     console.log(answer.status);

    //     return answer.data;
    // });
    // console.log(response);

})
// app.post('/api/updateUserProfile', async (req, res) => {
//     // console.log(req.body);
//     // user = { ...user, ...req.body };
//     const response = await db.userprofile.findOneAndReplace(
//         { email: req.body.email },
//         req.body
//     );
//     res.json(response);
// });

app.post('/api/updateUserProfile',userController.updateUserProfile);
app.get('/login', (req, res) => {
    const options = {
        root: path.join(__dirname, 'public'),
    };
    res.sendFile('index.html', options);
});

app.get('/projectdashboard', (req, res) => {
    const options = {
        root: path.join(__dirname, 'public'),
    };
    res.sendFile('index.html', options);
});

app.get('/mytasks', (req, res) => {
    const options = {
        root: path.join(__dirname, 'public'),
    };
    res.sendFile('index.html', options);
});

app.get('/register', (req, res) => {
    const options = {
        root: path.join(__dirname, 'public'),
    };
    res.sendFile('index.html', options);
});

app.put('/api/updateSharedDashboards', async (req, res) => {
    console.log('loggin content for updating shared dashboards', req.body);

    let queries = [];
    req.body.forEach((el) => {
        let search = { 'dashboards.id': el.id };
        let query = { $set: { 'dashboards.$': el } };
        queries.push([search, query]);
    });
    async function sendQuery(param) {
        console.log('async sendQuery called:', param);
        await db.userprofile.update(param[0], param[1]);
    }
    console.log('logging queries array:', queries);
    async.map(queries, sendQuery, function (err, result) {
        res.json('ok');
    });
});
app.use(express.static('./public'));

io.on('connect', (socket) => {
    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id);
        usersSockets.forEach((value, key) => {
            if (value == socket.id) {
                // console.log('FOUND!');
                usersSockets.delete(key);
            }
        });
        userRooms.delete(socket.id);
        // console.log(usersSockets);
    });
    console.log('a user connected', socket.id, socket.handshake.query.dash);
    if (socket.handshake.query.user) {
        usersSockets.set(socket.handshake.query.user, socket.id);
    }
    // if (
    //     socket.handshake.query.chatuser &&
    //     socket.handshake.query.chatuser.indexOf('@') > -1 &&
    //     socket.handshake.query.dash.length > 0
    // ) {
    //     usersSockets.set(socket.handshake.query.chatuser, socket.id);
    //     let user = socket.handshake.query.chatuser;
    //     let room = socket.handshake.query.dash;
    //     socket.join('abc', (err) => {
    //         if (err) {
    //             console.log('error');
    //         }
    //         console.log(user + ' joined room:' + room);
    //     });
    // }
    socket.on('chatopen', (user, dash) => {
        console.log('user joining chat room', user, dash);
        socket.join(dash);
        io.to(dash).emit('chat', `${user} joined`);
        userRooms.set(socket.id, dash);
        console.log(userRooms);
    });
    socket.on('chatchange', (user, dash) => {
        console.log('user leaving dashboard room', user, dash);
        io.to(dash).emit('chat', `${user} left room`);
        socket.leave(dash, (err) => {
            userRooms.delete(socket.id);
            if (err) console.log('ERROR LEAVING ROOM');
        });
    });
    socket.on('chat', (user, msg, dash) => {
        // socket.join(dash);
        console.log(`received chat message from ${user}`, msg, dash);
        let room = dash;
        console.log('room is: ', room);
        io.to(dash).emit('chat', user, msg);
    });
    socket.on('update', (msg) => {
        // console.log('update:', msg, socket.id);
        const obj = JSON.parse(msg);
        obj.shared.forEach((el) => {
            if (usersSockets.has(el.to)) {
                // console.log('can emit!');
                socket.broadcast
                    .to(usersSockets.get(el.to))
                    .emit('update', 'update coming!');
            }
        });

        // socket.emit('update', `user updated:${msg.user}`);
    });
    socket.on('username', (msg) => {
        console.log('username:', msg, socket.id);
    });
    socket.on('updateother', (msg) => {
        console.log('update other triggered', msg, socket.id);
        const obj = JSON.parse(msg);
        obj.sharedOther.forEach((el) => {
            if (usersSockets.has(el)) {
                console.log('found it! can emit update shered!');
                socket.broadcast
                    .to(usersSockets.get(el))
                    .emit('update', 'update coming!');
            }
        });
    });

    // console.log(usersSockets);
});

const PORT = 8080;
http.listen(PORT, (req, res) => {
    console.log(`server started on ${PORT}`);
});
