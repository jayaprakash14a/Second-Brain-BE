import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ContentModel, LinkModel, UserModel } from './db';
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';
import { random } from './utils';
import cors from "cors"


const app = express();
app.use(express.json());
app.use(cors());



app.post('/api/v1/signup', async (req, res) => {
    //Todo : Zod validation, hash the password, handling error codes
    const username = req.body.username;
    const password = req.body.password;
    try {
        const response = await UserModel.create({
            username: username,
            password: password

        })
        const existingUser = await UserModel.findOne({
            username,
            password
        })
        const token = existingUser && jwt.sign({
            id: existingUser._id,
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } catch (e) {
        res.status(411).json({
            message: "user already exists"
        })
    }


})

app.post('/api/v1/signin', async (req, res) => {

    const username = req.body.username
    const password = req.body.password
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id,
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "User doesnt exists"
        })
    }


})

app.post('/api/v1/content', userMiddleware, async (req, res) => {
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

app.get('/api/v1/content', userMiddleware, async (req, res) => {

    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")

    const user = await UserModel.findOne({
        _id: userId
    })

    res.json({
        username: user?.username,
        content
    })
})

app.delete('/api/v1/content/:contentid', userMiddleware, async (req, res) => {
    const contentId = req.params.contentId;

    await ContentModel.deleteOne({
        contentId,
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
})

app.post('/api/v1/brain/share', userMiddleware, async (req, res) => {

    const share = req.body.share;
    
    if(share){
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        })

        if (existingLink) {
            res.json({
                hash: existingLink.hash
            })
            return;
        }

        const hash = random(10);

        await LinkModel.create({
            userId: req.userId,
            hash: hash
        })

        res.json({
            hash
        })

    }else{
        await LinkModel.deleteOne({
            userId: req.userId
        })
        res.json({
            message: "Deleted sharable link"
        })

    }



})

app.get('/api/v1/brain/:sharelink', async (req, res) => {
    const hash = req.params.sharelink;

    const link = await LinkModel.findOne({
        hash
    })

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }

    const content = await ContentModel.find({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user doesnt exist"
        })
        return
    }


    res.json({
        username: user.username,
        content: content

    })

})

app.listen(3001);