import dotenv from 'dotenv'

dotenv.config({path:"./.env"})

import app from './app.js'
import connectDb from './db/db.js'

connectDb().
    then(
        app.listen((process.env.PORT),()=>{
        console.log(`app is listening on port ${process.env.PORT}`)
    })).
    catch((error)=>{
        console.log("mongodb connection failed",error);
        
    })


 