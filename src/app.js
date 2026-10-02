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

app.get("/", (req, res) => {
  res.send("VideoTube Backend is Running");
});


// its a public folder that is used to store static data like photos and other data
app.use(express.static("public"))

// used to access cookies of the browser
app.use(cookieParser())

// route import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import tweetRouter from './routes/tweet.routes.js'

// route declaration
app.use("/api/v1/users",userRouter)

app.use("/api/v1/users", userRouter)

app.use("/api/v1/videos", videoRouter)

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/dashboard", dashboardRouter)

app.use("/api/v1/healthcheck", healthcheckRouter)

app.use("/api/v1/likes", likeRouter)

app.use("/api/v1/playlists", playlistRouter)

app.use("/api/v1/subscriptions", subscriptionRouter)

app.use("/api/v1/tweets", tweetRouter)

// example route : http://localhost:8000/api/v1/users/register


export default app;