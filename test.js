// const arr =
//   'friends=["yousuf","khan"]; friends1=["yousuf","khan"]; friends2=["hi","bye"]';
//
//   arr.split(";").forEach((item) => {
//     const arr = [];
//   
//     const array = item.split("=");
//   
//     if (array[0].replace(/\s/g, "") === "friends") {
//       //remove []
//       const values = array[1].replace(/[\[\]]/g, "");
//   
//       //remove double quotes
//       const quotes = values.replace(/"/g, "");
//   
//       const val = quotes.split(",");
//   
//       val.forEach((item) => {
//         arr.push(item);
//       });
//   
//       return arr;
//     }
//   });


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

const allFriends = await Users.findOne({name : "muhammad" }, {friends : 1})

console.log(allFriends, typeof(allFriends))
// --- create user ----
// Users.create({
//   name : 'hitler',
//   friends : []
// })


// --find users ---
// const names = await Users.find({})
// console.log(names)



// -- find by id---
// const id = await Users.findById('660cc9761929014ab111e52e')
// console.log(id['name'])


// -- add friend --
// const query = {name : "ypathan"}
// const user = await Users.findOne(query,{friends : 1})
// user.friends.push('660cf3e66c52a944ae24c7a1')
// const updatedUser = await user.save()
//
// console.log(updatedUser)


// async function gettingFriends(allFriends){
//   const friends = []
//
//   for (const friend of allFriends['friends']){
//     const fName = await Users.findById(friend['_id'])
//     friends.push(fName['name'])
//   }
//
//   return friends
// }
//
// const allFriends = await Users.findOne({name : "muhammad"}, {friends : 1})
// const friends = await gettingFriends(allFriends)
//
// console.log(friends)
//


// allFriends['friends'].forEach( async (item)=>{
//   const friend = await Users.findById(item['_id'])
//   friends.push(friend['name'])
// })


