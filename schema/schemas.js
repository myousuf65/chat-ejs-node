import mongoose from "mongoose"
import bcrypt from "bcrypt"


mongoose.connect("mongodb://localhost:27017/chat-app")
    .then(() => console.log("Mongodb connected"))
    .catch((e) => console.log("error: ", e))

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    friends: [{orderId: mongoose.Schema.Types.ObjectId}],
    requests: [{orderId: mongoose.Schema.Types.ObjectId}]
})

userSchema.pre('save', async function (next) {

    try {
        if (this.isModified('password')) {
            const hash = await bcrypt.hash(this.password, 10)
            this.password = hash
        }
        next()
    } catch (error) {
        next(err)
    }

})


userSchema.methods.comparePassword = async function (password) {
    if (!password) throw Error('Password is missing')

    try {
        const isMatch = await bcrypt.compare(password, this.password)
        return isMatch

    } catch (error) {
        console.log('Error : ', error.message)
    }
}

const Users = mongoose.model("Users", userSchema)


const messageSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, {timestamps: true})





const Messages = mongoose.model("Messages", messageSchema)

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    creator: {
        type: String,
        required: true
    },
    members: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Groups = mongoose.model("Groups", groupSchema);

const groupMessageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {timestamps: true})

const GroupMessages = mongoose.model("GroupMessages", groupMessageSchema)

export {Users, Messages, GroupMessages, Groups}
