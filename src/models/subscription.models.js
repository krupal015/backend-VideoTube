import mongoose, { Schema } from "mongoose";
import { User } from "./user.models";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber:{
            Type:Schema.Types.ObjectId, //the one who is subscribing
            ref:"User"
        },
        channel:{
             Type:Schema.Types.ObjectId, //the one whom 'subscriber' is subscribing
            ref:"User"
        }
    },{timestamps:true}
)

export const Subscription = mongoose.model("Subscription",subscriptionSchema)