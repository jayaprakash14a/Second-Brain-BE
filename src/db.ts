
import mongoose, { model, Schema } from "mongoose";
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || '')
.then(()=>console.log("Connected to mongo db"))
.catch((err)=>console.error("Failed to connect to MongoDB",err)) // mongo db string

const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String
})

export const UserModel = model("User",UserSchema); 

const ContentSchema = new Schema({
    title: String,
    link: String,
    type: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId : {type:mongoose.Types.ObjectId, ref:'User', required: true}
})

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: {type: String, required: true},
    userId : {type: mongoose.Types.ObjectId, ref:'User', required: true}
})

export const LinkModel = model("Links", LinkSchema);



