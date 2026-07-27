import mongoose from "mongoose";
import {DB_name} from '../constants.js'

const connectDb = async() => {
    try {
     const DbInstance =   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
     console.log(`Database is connected.. on the host ${DbInstance.connection.host}`);
     
    }
    catch (error) {
         throw error("MongoDB is not Connected")
        console.error(error)
        error.exit(1)
    }
}

export default connectDb