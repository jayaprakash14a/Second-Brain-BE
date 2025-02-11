
import mongoose, { model, Schema } from "mongoose";

mongoose.connect("") // mongo db string

const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String
})

export const UserModel = model("User",UserSchema); 

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId : {type:mongoose.Types.ObjectId, ref:'User', required: true}
})

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: {type: String, required: true},
    userId : {type: mongoose.Types.ObjectId, ref:'User', required: true}
})

export const LinkModel = model("Links", LinkSchema);



