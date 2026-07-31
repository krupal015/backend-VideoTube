import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
     credentials : true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))


// its a public folder that is used to store static data like photos and other data
app.use(express.static("public"))

// used to access cookies of the browser
app.use(cookieParser())

// route import
import userRouter from './routes/user.routes.js'

// route declaration
app.use("/api/v1/users",userRouter)

// example route : http://localhost:8000/api/v1/users/register


export default app;