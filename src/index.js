import app from './app.js'
import dotenv from 'dotenv'
import connectDb from './db/db.js'

dotenv.config({path:"./.env"})

connectDb()

 app.listen((process.env.PORT),()=>{
        console.log(`app is listening on port ${process.env.PORT}`)
    })