import http from "http"
import { WebSocketServer } from "ws";
import url from "url"
import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import Members from "./Members.js";
import {Users, Messages} from "./schema/schemas.js"
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import cors from 'cors'

// defining __dirname and __filename
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config()

//express boiler plate
const app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static('./public/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())

//initialization http server
const server = http.createServer();
const PORT = 8080;
let username = "";

const wsServer = new WebSocketServer({ noServer: true });

const getUsername = (request) => {
  const { username } = url.parse(request.url, true).query;
  return username;
};

server.on("upgrade", (request, socket, head) => {
  try {
    username = getUsername(request);
  } catch (error) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  wsServer.handleUpgrade(request, socket, head, (connection) => {
    wsServer.emit("connection", connection, request);
  });
});

wsServer.on("connection", async (connection) => {

  // adding new users to db
  // const all = await Users.findOne({name: username})
  // if (all === null){
  //   const User = await Users.create({
  //     name : username,
  //     friends: []
  //   })
  // }

  // creating connection instance for user
  const m = new Members(username, connection)

  console.log("New client connected", username);

  connection.on("message", async (message) => {
   
    
    const _message = JSON.parse(message);
    console.log(_message)
    if (_message.messageType === "DM") {
      const receiverConn = Members.findByUsername(_message.to);


      const payload = {
        from: _message.from,
        to: _message.to,
        messageType: _message.messageType,
        content: _message.content,
      };

      const result = await Messages.create({
        from : _message.from,
        to : _message.to,
        content : _message.content
      })

      console.log(payload);
      
      if(receiverConn !== undefined){
        receiverConn.connection.send(JSON.stringify(payload));
      }
      
    }
  });

  connection.on("close", () => {
    // remove from the active instances list
    console.log("Client disconnected");
  });

  connection.on("error", (error) => {
    // clients.delete(connection);
    console.error("WebSocket error:", error);
  });
});

app.get("/", (req, res) => {

  res.render("login");
});

app.post("/submit-username", async(req, res) => {
  username = req.body.username;
  let friends = []

  //query for friends
  async function gettingFriends(allFriends){
    const friends = []
    for (const friend of allFriends['friends']){
      const fName = await Users.findById(friend['_id'])
      friends.push(fName['name'])
    }

    return friends
  }

  const allFriends = await Users.findOne({name : username}, {friends : 1})
  
  // console.log(allFriends)
  if (allFriends !== null){
    friends = await gettingFriends(allFriends)
  }


  res.cookie('username', username)

  res.render("home", {
    username : username,
    friends : friends
  });

});


app.post("/add-friend", async (req, res) => {

  const friend_name = req.body.friend 
  const username = req.cookies.username

  // finding friend
  const friendQuery = {name : friend_name}
  const friendId = await Users.findOne(friendQuery)
  console.log("friend is ", friend_name, " friend id", friendId['_id'])
  
  //finding user
  const Userquery = {name : username}
  const user = await Users.findOne(Userquery,{friends : 1})
    console.log("user is ",  username, " user id", user['_id'])


  user.friends.push(friendId)
  const updatedUser = await user.save()

  console.log(updatedUser)

});

app.get("/all-members", async (req, res) => {

  const all = await Users.find({})
  const members = []

  all.forEach((item)=>{
    members.push(item['name'])
  })

  res.render("Members", {
    Members: members,
  });
});

app.post('/fetch-chat-history', async(req, res)=>{

  let from = req.cookies.username
  console.log(req.cookies)
  let to = req.body.to 

  //retreive all messages
  const result = await Messages.find(
      {"$or":[{"to": to, "from": from}, {"to": from, "from": to}]}  
  ).sort({createdAt : 1 })


  console.log("to: ", to, " from: " ,from)


  res.render('chat', {
    username: req.cookies.username,
    chat_history : result
  })

})

app.get('/auth', (req, res)=>{
  console.log(__dirname)
  res.sendFile('/views/auth.html', {root: __dirname})
})

app.post('/signin', (req,res)=>{

  let username = req.body['signin_username']
  let password = req.body['signin_password']
    
  console.log({username, password})
  
})

app.post('/signup', async (req, res)=>{

  let username = req.body['signup_username']
  let email = req.body['signup_email']
  let password = req.body['signup_password']

  console.log({username, email, password})

  // make sure email || username does not exist
  const existingUser = await Users.findOne({
    $or : [
      {username: username},
      {email: email}
    ]
  })

  if(existingUser){
    console.log(existingUser)
    console.log('User already exists')
    return
  }

  const user = await Users.create({
    username: username,
    password: password,
    email: email,
    friends: []
  })
    .then(user => {
      
      console.log('User Creation Successfull', user)

      // create a jwt token for the user
    
    })


})

app.listen(process.env.EXPRESS_PORT, '0.0.0.0', () => {
  console.log("Express Server Running on ", process.env.EXPRESS_PORT);
});

server.listen(process.env.WEBSOCKET_PORT, '0.0.0.0' , () => {
  console.log(`Server listening on port ${process.env.WEBSOCKET_PORT}`);
});


