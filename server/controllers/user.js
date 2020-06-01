const db = require("../models");
let user = require('../user.json');
const bcrypt = require('bcrypt');
const utils = require('../utils');

exports.updateUserProfile = async (req, res, next) => {
  const response = await db.userprofile.findOneAndReplace(
    { email: req.body.email },
    req.body
  );
  res.json(response);
};


exports.getUser = async (req,res,next) => {
    const query = { email: req.params.email };
    let response = await db.userprofile.find(query);
    response = JSON.stringify(response);
    response = JSON.parse(response);
    console.log(response);
    const sharedDashboardsTo = await db.userprofile.find(
        {
            'sharedByUser.to': req.params.email,
        },
        {
            _id: 0,
            email: 1,
            'sharedByUser.$': 1,
            dashboards: 1,
            firstname: 1,
            lastname: 1,
        }
    );
    
    let reply = [];
    reply.push(utils.removePassword(response));
    reply.push(sharedDashboardsTo);

    if (response.length > 0) {
        console.log(reply)
        res.json(reply);
    } else res.json({ answer: 'nothing found' });
}

exports.login = async (req,res,next) => {
    console.log(req.body);
    user = { ...user, ...req.body };
    const query = { email: req.body.email };
    //const userProfile = await db.userprofile.findOne(query);
    let userProfile = await db.userprofile.find(query, {
        _id: 0,
        email: 1,
        password: 1,
    });
    
    console.log(typeof userProfile);
    let response;
    if (userProfile) {
        userProfile = JSON.stringify(userProfile);
        userProfile = JSON.parse(userProfile);
        console.log(typeof userProfile);
        console.log(req.body.password);
        if (userProfile[0]) {
            console.log(userProfile[0].password);
            const isValidPassword = await bcrypt.compare(
                req.body.password,
                userProfile[0].password
            );
            if (isValidPassword) {
                response = {
                    message: 'OK',
                    email: userProfile[0].email,
                };
            } else {
                response = { message: 'Invalid username/password' };
            }
        } else {
            response = { message: 'Invalid username/password' };
        }
    } else {
        response = { message: 'Database error' };
    }
    res.json(response);
}