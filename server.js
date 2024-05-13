import http, { request } from "http"
import { WebSocketServer } from "ws";
import url from "url"
import express, { response } from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import Members from "./Members.js";
import { Users, Messages } from "./schema/schemas.js"
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { createJWT } from "./jwt.js"
import { checkLogin } from "./middlewares/checkLogin.js";
import { changePaas, sendEmail } from "./auth/emailjs.js"

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

  // creating connection instance for user
  const m = new Members(username, connection)

  console.log("New client connected", username, '\n');

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
        from: _message.from,
        to: _message.to,
        content: _message.content
      })

      console.log(payload);

      if (receiverConn !== undefined) {
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

app.get("/", checkLogin, async (req, res) => {

  username = req.username;
  let friends = []

  //query for friends
  async function gettingFriends(allFriends) {
    const friends = []
    for (const friend of allFriends['friends']) {
      const fName = await Users.findById(friend['_id'])
      if(fName !== null){
        friends.push(fName['username'])
      }else{
        continue;
      }
    }

    return friends
  }

  const allFriends = await Users.findOne({ username: username }, { friends: 1 })

  console.log(allFriends)
  if (allFriends !== null) {
    friends = await gettingFriends(allFriends)
  }

  res.render("home", {
    username: username,
    friends: friends
  });

});


app.post("/add-friend", checkLogin, async (req, res) => {

  const friend_name = req.body.friend
  const username = req.username

  console.log({ friend_name, username })
  // finding friend
  const friendQuery = { username: friend_name }
  const friendId = await Users.findOne(friendQuery)
  // console.log(friendId)
  // console.log("friend is ", friend_name, " friend id", friendId['_id'])

  //finding user
  const Userquery = { username: username }
  const user = await Users.findOne(Userquery, { friends: 1 })
  // console.log("user is ", username, " user id", user['_id'])


  user.friends.push(friendId)
  const updatedUser = await user.save()

  // console.log(updatedUser)

});

app.get("/all-members", checkLogin, async (req, res) => {

  const all = await Users.find({})
  const members = []

  all.forEach((item) => {
    if (item['username'] !== req.username) {
      members.push(item['username'])

    }
  })

  res.render("Members", {
    Members: members,
    username: req.username
  });
});

app.post('/fetch-chat-history', checkLogin, async (req, res) => {

  let from = req.body['from']
  let to = req.body['to']

  //retreive all messages
  const result = await Messages.find(
    { "$or": [{ "to": to, "from": from }, { "to": from, "from": to }] }
  ).sort({ createdAt: 1 })



  res.render('chat', {
    username: req.username,
    chat_history: result
  })

})

app.get('/auth', (req, res) => {
  console.log(__dirname)
  res.sendFile('/views/auth.html', { root: __dirname })
})

app.post('/signin', async (req, res) => {

  let username = req.body['signin_username']
  let password = req.body['signin_password']

  console.log({ username, password })

  const user = await Users.findOne({ username: username })

  const isMatch = await user.comparePassword(password)

  if (isMatch) {
    const token = createJWT({
      username: user.username,
      email: user.email
    })

    console.log(token)
    res.cookie('token',token )
    res.redirect("/")
  } else {

    res.sendStatus(403).send('Credentials incorrect')
    res.redirect('/auth')

  }

})

app.post('/signup', async (req, res) => {

  let username = req.body['signup_username']
  let email = req.body['signup_email']

  // make sure email || username does not exist
  const existingUser = await Users.findOne({
    $or: [
      { username: username },
      { email: email }
    ]
  })

  if (existingUser) {
    console.log(existingUser)
    console.log('User already exists')
    return
  }

  const user = await Users.create({
    username: username,
    password: 'some_pass',
    email: email,
    friends: []
  })
    .then(user => {

      const username = user.username
      const email = user.email
      const id = user.id

      const link = `${process.env.APP_URL}/verify-email/${id}`
      sendEmail(username, email, link)
        .then(
          (response) => {
            console.log("su", response)
            res.render('confirm_email', {
              email: email,
              message: 'verify your account'
            })
          },
          (error) => {
            console.log("err", error)
            res.send('There has been an error. Please try again')
          }
        )

    })
})


app.get('/verify-email/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(typeof(id), id);

    const user = await Users.findById(id);
    if (!user) {
      // Handle case where no user is found
      return res.status(404).send("User not found");
    }

    res.render('password', {
      email: user.email,
      id: user.id
    });
  } catch (error) {
    // Handle any other errors
    // console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/create-user/:id', async (req, res) => {

  // receive credtials from set password page and set password for username
  const id = req.params.id
  const {cpassword, password} = req.body

  console.log({cpassword, password})

  if(cpassword === password){
    const user = await Users.findById(id)
    user.password = password
    user.save()
      .then(
        response =>{
          const token = createJWT({
            username: response.username,
            email: response.email
          })

          // console.log(token)
          res.cookie('token',token )
          res.redirect("/")

        }
      )    
  }else{
    console.log('pass not match')
  }
})

app.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/auth')
})


app.get('/forgot', (req, res) => {
  res.sendFile('/views/forgotpass.html', { root: __dirname })
})

app.post('/change-password', async (req, res)=>{
  const email = req.body.email

  const user = await Users.findOne({email: email})

  if( user !== null){
    
    const link = `${process.env.APP_URL}/change-password/${email}`
    
    changePaas(username, email, link)
      .then(
        (response) => {
          console.log(response)
          res.render('confirm_email', {
            email: email,
            message: 'reset your password'
          })
        },
        (error) => {
          console.log("err", error)
          res.send('There has been an error. Please try again')
        }
      )
    // res.send('found user')
  }else{
    res.send('could not find user')
  }

})

app.get('/change-password/:email', (req, res)=>{
  const email = req.params.email
  res.render('changepass',{
    email: email
  })
})

app.post('/reset/:email', async(req, res)=>{
  const {password, cpassword} = req.body
  const email = req.params.email

  const user = await Users.findOne({email: email})
  user.password = password
  
  user.save().then(
    (response)=>{
      console.log(response)
      res.render('reset-success')
    }
  )

})




app.listen(process.env.EXPRESS_PORT, '0.0.0.0', () => {
  console.log("Express Server Running on ", process.env.EXPRESS_PORT);
});

server.listen(process.env.WEBSOCKET_PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${process.env.WEBSOCKET_PORT}`);
});


