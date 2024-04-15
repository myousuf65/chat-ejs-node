import mongoose from "mongoose"

mongoose.connect("mongodb://localhost:27017/chat-app")
.then(()=> console.log("Mongodb connected"))
.catch((e)=>console.log("error: ", e))

const userSchema = new mongoose.Schema({
  name : {
    type: String,
    required : true
  },
  friends : [{ orderId: mongoose.Schema.Types.ObjectId}]
})

const Users = mongoose.model("Users" , userSchema)



const messageSchema = new mongoose.Schema({
  to : {
    type : String,
    required : true
  },
  from : {
    type : String,
    required : true
  },
  content : {
    type : String,
    required : true
  },
}, { timestamps : true})


const Messages = mongoose.model("Messages", messageSchema)

export { Users, Messages}
