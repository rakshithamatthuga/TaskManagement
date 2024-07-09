require('dotenv').config();
const express=require('express')
const app=express()
const fs = require('fs');
const Validator = require('../helpers/validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const AuthService =require('../authorize/auth')
const { json } = require('express');
const { nextTick } = require('process');
const PORT = 3000;
const express = require('express');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
    }
});
const upload = multer({ storage: storage });
const userData=[
    {
        "email":"rakshithamattuga@gmail.com",
        "password":"test123",
        "name":"Rakshitha S",
        "address":"Bengaluru",
        "phone":"9876543210",
        "role":"user"
    }
]
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

const userRegistration=(req,res)=>{
    let data = req.body;
    if(req.body.email && req.body.password){
    const user = {
        email: data.email,
        password: bcrypt.hashSync(data.password, 8),
        name: data.name,
        address: data.address,
        phone: data.phoneno,
    }
        //validate data before saving to database
        if(Validator.validateUserInfo(user).status == true)
    {
        userData.push({'email':user.email,"password":user.password,"creationDate":new Date(),"name":user.name,"address":user.address,"phoneno":user.phone,"role":"user"})
        res.status(200).json({"message":"Registered Successfully"})  
    }
    else{
        res.status(400).json({"message": "Bad Request"})
    }
}else{
    res.status(400).json({"message": "Email is not in a proper format"})

}
    

}
const loginUser=(req,res,next)=>{
        let data = req.body;
        const email=req.body.email
        const password=req.body.password
        const user = userData.find(user => user.email === email)
        const secret=process.env.SECRET_KEY
        if(user){
            var isPasswordValid = bcrypt.compareSync(password, user.password);
            if(isPasswordValid){
                var token=jwt.sign({id:user.email},process.env.SECRET_KEY,{
                    expiresIn: 86400
                })
                if(token){
                res.status(200).json({"message":"Logged In Successfully","token":{token},"expiresIn":"86400"})
                next()
            }
            }
            else{
                res.status(401).json({"message":"Unauthorized User"})
                next()
            }
    
        }else{
            res.status(404).json({"message":"User doesn't exist"})
            next()
        }
    }

//View Profile 
/*
api-viewProfile
method-GET
params-email,password
*/

const viewProfile=async (req,res,next)=>{
    try {
        let eventData = req.body;
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ "message": "No token provided" });
        }

        token = token.split(' ')[1];
        
        if (token) {
            // Promisify jwt.verify
            const verifyToken = (token) => {
                return new Promise((resolve, reject) => {
                    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    });
                });
            };

            // Verify the token
            const decoded = await verifyToken(token);
            if (decoded) {
                const user = userData.find(user => user.email === decoded.id);
                const { password, ...userWithoutPassword } = user;
                console.log(user)
                if (user) 
                    {
                        res.status(200).json({"message":"User Profile","user":userWithoutPassword})
                    }
                else
                {
                    res.status(404).json({"message":"User doesn't exist"});
                }
        }
       
    }
    else{
        return res.status(401).json({ "message": "Not authorized" });

    }
}
    catch (err) {
        res.status(500).json({ "message": "Internal Server Error" });
    }
    next();
}

//updateProfile
/*
api-updateProfile
method-POST
params-name,email,address,phone
*/
const updateProfile=async (req,res,next)=>{
    try {
        let eventData = req.body;
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ "message": "No token provided" });
        }

        token = token.split(' ')[1];
        
        if (token) {
            // Promisify jwt.verify
            const verifyToken = (token) => {
                return new Promise((resolve, reject) => {
                    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    });
                });
            };

            // Verify the token
            const decoded = await verifyToken(token);

            if (decoded) {
                const user = userData.find(user => user.email === decoded.id);
                Object.keys(eventData).forEach(key => {
                    if (key in user) {
                        user[key] = eventData[key];
                    }
                });
                res.status(200).json({"UpdatedUser": user});

               
            } else {
                res.status(400).json({ "message": "Invalid User"});
            }
        } else {
            res.status(401).json({ "message": "You're not authorized to get the news preferences" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ "message": "Internal Server Error" });
    }
    next();
}

//create Task
/*
api=/Task
method=POST
params=Title,name,description
*/
const taskLists = [
    {
        id: 1,
        title: "Set up environment",
        description: "Install Node.js, npm, and git",
        priority:"high",
        completed: true,
        creationDate:"2024-04-26T17:00:00.000Z",
        userEmail:"rakshitha@gmail.com"
            }
]
const createTask = async (req, res) => {
    let token = req.headers.authorization;
    token = token.split(' ')[1];

    try {
        const decodedId = await AuthService.verifyToken(token);
        
        if (decodedId) {
            let newTask = req.body;
            
            if (!newTask.title || !newTask.description || !newTask.status) {
                return res.status(400).json({ "error": "Missing title or description" });
            } else {
                let newId = taskLists.length + 1;
                const date = new Date();
                newTask.creationDate = date;
                
                taskLists.push({
                    'id': newId,
                    'title': newTask.title,
                    "description": newTask.description,
                    "userEmail": decodedId,
                    "status":newTask.status,
                    "creationDate": newTask.creationDate
                });
                
                return res.status(201).json({"Tasks Created Successfully":taskLists.slice(-1)[0] 
                })
            }
        } else {
            return res.status(401).json({ "message": "You're not authorized to create the Task" });
        }
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ "message": "You're not authorized to create the Task" });
    }
};

//Assigned tasks to me 
/*
api=lists
method=GET
params=None
*/
const tasksAssignedToMe=async (req, res) => {
    let token = req.headers.authorization;
    token = token.split(' ')[1];

    try {
        const decoded = await AuthService.verifyToken(token);
        if (decoded) {
                const user=userData.find(user=>user.email==decoded)
                console.log(userData)
                const tasks=taskLists.find(tasks=>tasks.userEmail==user.email)
                return res.status(201).json({ "TasksAssignedToYou":tasks})
            }
            else{
                return res.status(401).json({ "message": "You're not authorized to create the Task" });

            }
        } 
     catch (err) {
        console.error('Token verification failed:', err);
        return res.status(500).json({ "message": "Internal Server Error" });
    }
};

//Update the Tasks by marking it as completed
/*
api=updateTasks
method=PUT
params=taskID
*/
const updateTasks=async (req, res) => {
    let token = req.headers.authorization;
    token = token.split(' ')[1];
    const taskId = parseInt(req.params.id);
    const tasks=taskLists.find(tasks=>tasks.id==taskId)
    if(tasks){
    try {
        const decoded = await AuthService.verifyToken(token);
        if (decoded) {
                const user=userData.find(user=>user.email==decoded)
                console.log(userData)
                const tasks=taskLists.find(tasks=>tasks.userEmail==user.email)
                if(tasks){
                    Object.keys(eventData).forEach(key => {
                        if (key in user) {
                            tasks[key] = eventData[key];
                            return res.status(200).json({"Updated Tasks":tasks.slice(-1)[0]})

                        }
                    });

                }
                else{
                    return res.status(404).json({ "error": "No Tasks Found" });
                }
            }
            else{
                return res.status(401).json({ "message": "You're not authorized to create the Task" });

            }
        } 
     catch (err) {
        console.error('Token verification failed:', err);
        return res.status(500).json({ "message": "Internal Server Error" });
    }
}
else{
    return res.status(404).json({ "message": "Task id provided doesn't exist"})
}
};

//Assign Tasks to Someone
/*
api-assignTasksToSomeone
method-PUT
Params-Id
Body-emailId of a new user
*/
const assignTasksToSomeone=async (req, res) => {
    let token = req.headers.authorization;
    token = token.split(' ')[1];
    const taskId = parseInt(req.params.id);
    const tasks=taskLists.find(tasks=>tasks.id==taskId)
    let body=req.body
    if(tasks)
    {
      if (eventData.email){
      try {
        const decoded = await AuthService.verifyToken(token);
        if (decoded) {
                const user=userData.find(user=>user.email==decoded)
                console.log(userData)
                const tasks=taskLists.find(tasks=>tasks.userEmail==user.email)
                if(tasks){
                            tasks.userEmail=body.emailId   
                            return res.status(200).json({"Updated Tasks":tasks.slice(-1)[0]})

                }
                else{
                    return res.status(404).json({ "error": "No Tasks Found" });
                }
            }
            else{
                return res.status(401).json({ "message": "You're not authorized to create the Task" });

            }
        } 
     catch (err) {
        console.error('Token verification failed:', err);
        return res.status(500).json({ "message": "Internal Server Error" });
    }
}
else{
    return res.status(404).json({ "message": "User email prvoided doesn't exist" });
}
    }
    else{
        return res.status(404).json({ "message": "Task id provided doesn't exist"})
    }
};

//Filter or search the tasks
/*
api-queryparams,
method-POST
Params-either by status or by title or description
*/
const searchOrFilter=async(req,res)=>{
    let token = req.headers.authorization;
    let filterBy=req.query.status
    let status=['open','work in progress','completed','blockage']
    let searchTerm=req.query
    let searchBy=['title','description']
    let search=req.query.search
    if(status.includes(filterBy)){
    try {
        const decoded = await AuthService.verifyToken(token);
        if (decoded) {
                const user=userData.find(user=>user.email==decoded)
                console.log(userData)
                const tasks=taskLists.find(tasks=>tasks.status==filterBy)
                if(tasks){
                            return res.status(200).json({"Filtered Tasks":tasks})
                }
                else{
                    return res.status(404).json({ "error": "No Tasks Found" });
                }
            }else{
                return res.status(401).json({ "message": "You're not authorized"})
            }
        }
        catch (err) {
            return res.status(500).json({ "message": "Internal Server Error" });
        }
    }
    else if(searchBy.includes(searchTerm)){
        try {
            const decoded = await AuthService.verifyToken(token);
            if (decoded) {
                    const user=userData.find(user=>user.email==decoded)
                    console.log(userData)
                    const tasks=taskLists.find(tasks=>tasks.searchTerm==search)
                    if(tasks){
                                return res.status(200).json({"searched Tasks":tasks})
                    }
                    else{
                        return res.status(404).json({ "error": "No Tasks Found" });
                    }
                }else{
                    return res.status(401).json({ "message": "You're not authorized"})
                }
            }
            catch (err) {
                return res.status(500).json({ "message": "Internal Server Error" });
            }
        }
    else{
            return res.status(404).json({ "message": "Invalid query parameters" });
        }

}

//Upload attachment to the existing Tasks
router.post('/tasks/:id/attachments', upload.single('attachment'), (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = taskLists.find(task => task.id === taskId);

    if (!task) {
        return res.status(404).json({ "error": "Task not found" });
    }

    if (!req.file) {
        return res.status(400).json({ "error": "No file uploaded" });
    }

    const attachment = {
        filename: req.file.filename,
        path: req.file.path
    };

    task.attachments.push(attachment);

    res.status(200).json({ "message": "Attachment added successfully", "task": task });
});
let Team=[
    {
        "teamname":"IRIS",
        "membersEmails":["raksitha@gmail.com","ash@gmail.com"],
        "tasksIds":["12","13"]
    }
]
//creating a team 
const createTeam = async (req, res) => {
    let token = req.headers.authorization;
    token = token.split(' ')[1];

    try {
        const decodedId = await AuthService.verifyToken(token);
        
        if (decodedId) {
            let newTeam = req.body;
            
            if (!newTeam.title || !Array.isArray(newTeam.taskIds) || !Array.isArray(newTeam.membersEmails)) {
                return res.status(400).json({ "error": "Invalid data. Ensure title is provided and tasksIds and membersEmails are arrays." });
            }else {
                let newId = Team.length + 1;
                const date = new Date();
                newTeam.creationDate = date;
                
                Team.push({
                    'id': newId,
                    'name': newTeam.name,
                    "membersEmails": newTeam.membersEmails,
                    "userEmail": decodedId,
                    "tasksIds":newTeam.taskIds,
                    "creationDate": newTeam.creationDate
                });
                
                return res.status(201).json({"Tasks Created Successfully":Team.slice(-1)[0] 
                })
            }
        } else {
            return res.status(401).json({ "message": "You're not authorized to create the Task" });
        }
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ "message": "You're not authorized to create the Task" });
    }
};

module.exports={
    userRegistration,
    loginUser,
    updateProfile,
    viewProfile,
    createTask,
    tasksAssignedToMe,
    updateTasks,
    assignTasksToSomeone,
    searchOrFilter,


}
