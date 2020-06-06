const db = require('../models')
let user = require('../user.json')
const bcrypt = require('bcrypt')
const utils = require('../utils')

exports.updateUserProfile = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.status(401).json({
      error: 'Access denied',
    })
  } else {
    console.log('[SERVER]:updateUSerProfile request', req.body)
    const response = await db.userprofile.findOneAndReplace(
      { email: req.body.email },
      req.body
    )
    res.json(response)
  }
}

exports.userLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/')
  })
}

exports.userAuth = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.status(401).json({
      error: 'Access denied',
    })
  } else next()
}

exports.getUser = async (req, res, next) => {
  const query = { email: req.params.email }
  let response = await db.userprofile.find(query)
  response = JSON.stringify(response)
  response = JSON.parse(response)
  console.log(response)
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
  )

  let reply = []
  // reply.push(utils.removePassword(response));
  reply.push(response)
  reply.push(sharedDashboardsTo)

  if (response.length > 0) {
    console.log(reply)
    res.status(200).json(reply)
  } else res.status(404).json({ answer: 'nothing found' })
}

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn = true
  const response = {
    message: 'OK',
    email: req.email,
  }
  //   res.redirect('/projectdashboard');
  res.status(200).json(response)
}

exports.login = async (req, res, next) => {
  console.log(req.body)
  user = { ...user, ...req.body }
  const query = { email: req.body.email }
  //const userProfile = await db.userprofile.findOne(query);
  let userProfile = await db.userprofile.find(query, {
    _id: 0,
    email: 1,
    password: 1,
  })
  console.log('loggind userProfile', userProfile)
  let response
  if (userProfile) {
    userProfile = JSON.stringify(userProfile)
    userProfile = JSON.parse(userProfile)
    if (userProfile[0]) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        userProfile[0].password
      )
      console.log('isValidPassword', isValidPassword)
      if (isValidPassword) {
        response = {
          message: 'OK',
          email: userProfile[0].email,
        }
        req.email = userProfile[0].email
        next()
      } else {
        response = { message: 'Invalid username/password' }
        res.status(401).json(response)
      }
    } else {
      response = { message: 'Invalid username/password' }
      res.status(401).json(response)
    }
  } else {
    response = { message: 'Database error' }
    res.status(500).json(response)
  }
}
