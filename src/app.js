import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential : true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))


// its a public folder that is used to store static data like photos and other data
app.use(express.static("public"))

// used to access cookies of the browser
app.use(cookieParser())


export default app;