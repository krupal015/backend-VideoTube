import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/apiError.js'
import jwt from "jsonwebtoken"
import {User} from '../models/user.models.js'


export const verifyJWT = asyncHandler(async(req,res,next)=> {
   try {
    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 console.log(4)
    if(!token){
     throw new ApiError(401,"Unauthorized request")
    }
 console.log(5)
   const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

   const user = await User.findById(decodedToken._id).select("-password -refreshToken")
console.log(6)
   if (!user) {
    throw new ApiError(401,"Invalid access token")
   }
   req.user = user
   next()
console.log(7)
   }
   // } catch (error) {
   //  throw new ApiError(401,error?.message || "invalid access token")
   // }
   catch (error) {
    console.log(error);
    throw new ApiError(401, error?.message || "Invalid access token");
}
   
}) 