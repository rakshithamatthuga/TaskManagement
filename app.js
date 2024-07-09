require('dotenv').config();
const express=require('express')
const app=express()
const fs = require('fs');
const Validator = require('./helpers/validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { json } = require('express');
const { nextTick } = require('process');
const PORT = 3000;
const {userRegistration,loginUser,viewProfile,updateProfile,createTask,tasksAssignedToMe,updateTasks,assignTasksToSomeone} = require('./routers/route');
const { Route53Resolver } = require('aws-sdk');
const router = express.Router();

const taskData=[
    {
      "title": "Rakshitha",
      "description": "AI",
      "dueDate": "rakshitha@gmail.com",
      "password": 3,
      "userEmail":"raksithamattuga@gmail.com"
    },
    {
        "title": "Rakshitha",
        "description": "AI",
        "dueDate": "rakshitha@gmail.com",
        "password": 3,
        "userEmail":"ashrithmattuga@gmail.com"

      },
  ]
app.use(express.json())
router.post('/users/signup',userRegistration)
router.post('/users/login',loginUser)
router.get('/users/viewProfile',viewProfile)
router.put('/users/updateProfile',updateProfile)
router.post('/users/tasks',createTask)
router.get('/users/tasks',tasksAssignedToMe)
router.put('/users/tasks/:id',updateTasks)
router.put('/users/tasks/:id',assignTasksToSomeone)

app.use('/', router);
app.listen(PORT, (err) => {
    if(err) {
        console.log("Error occured cant start the server");
    } else {
        console.log("Server started successfully");
    }
})
module.exports = app;
