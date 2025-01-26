import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ContentModel, UserModel } from './db';
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';


const app = express();
app.use(express.json());


app.post('/api/v1/signup', async (req,res)=>{
    //Todo : Zod validation, hash the password, handling error codes
    const username = req.body.username;
    const password = req.body.password;
    try{
        await UserModel.create({
            username: username,
            password:password

        })
        res.json({
            message: "User signed up"
        })
    }catch(e){
        res.status(411).json({
            message:"user already exists"
        })
    }

    
})

app.post('/api/v1/signin', async (req,res)=>{

    const username = req.body.username
    const password = req.body.password
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            id:existingUser._id,
        },JWT_PASSWORD)

        res.json({
            token
        })
    }else{
        res.status(403).json({
            message:"User doesnt exists"
        })
    }


})

app.post('/api/v1/content',userMiddleware , async (req, res)=>{
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title;

    await ContentModel.create({
        title,
        link,
        type,
        userId: req.userId,
        tag: []

    })

    res.json({
        message: "Content added"
    })
})

app.get('/api/v1/content',userMiddleware, async (req,res)=>{

    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId","username")

    res.json({
        content
    })
})

app.delete('/api/v1/content',userMiddleware ,async (req,res)=>{
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        userId: req.userId
    })

    res.json({
        message : "Deleted"
    })
})

app.post('/api/v1/brain/share',(req,res)=>{

})

app.get('/api/v1/brain/:sharelink',(req,res)=>{

})

app.listen(3000);