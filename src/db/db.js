import mongoose from "mongoose";
import {DB_name} from '../constants.js'

const connectDb = async() => {
    try {
     const DbInstance =   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
     console.log(`✅ Database connectedclear.. on the host ${DbInstance.connection.host}`);
     
    }
    catch (error) {
        console.error("MongoDB connection failed:", error)
        process.exit(1)
    }
}
export default connectDb