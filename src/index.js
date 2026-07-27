import app from './app.js'
import dotenv from 'dotenv'
import connectDb from './db/db.js'

dotenv.config({path:"./.env"})

connectDb().
    then(
        app.listen((process.env.PORT),()=>{
        console.log(`app is listening on port ${process.env.PORT}`)
    })).
    catch((error)=>{
        console.log("mongodb connection failed",error);
        
    })

 