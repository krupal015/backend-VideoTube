// register user
//get data from the frontend
//validation - correct format or not empty
//check if already register -check unique email,username
//check for images and avatar
//if available upload them on clodinary 
//create user object - create entry in db    
//remove password and refresh token field from response
//check for user creation

import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import {apiResponse} from '../utils/apiResponse.js'
import bcrypt from "bcrypt"



const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave : false})

       return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong")
    }
}




const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password } = req.body;

  

    if ([userName, email, fullName, password].some((field) =>
        field?.trim() === ""
    )) {
        throw new ApiError(400, "all field is require")
    }
    console.log("1");
    

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    console.log("2");

    if (existedUser) {
        throw new ApiError(400, "user already exist")
    }

    

    const avatarLocalPath = req.files?.avatar?.[0].path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;

    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

     console.log("3");

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }
     console.log("4");

   const user = await User.create({
        userName:userName.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        fullName,
        email,
        password
    })

     console.log("5");
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500,"something wentwrong while registering the user")
    }

    console.log("register is working succesfully");
    

    return res.status(201).json(
        new apiResponse(200,createdUser,"user is created successfully")
    )
     console.log("6");

})



// login user
// get data from the frontend
// check that user already exist or not - if not tell user to register
// get one unique value either email or username 
// password compare
// access token and refresh token  
// cookies


// login user
const loginUser = asyncHandler(async(req,res) => {
    
    const {userName,email,password} = req.body

    if(!(userName || email)){
        throw new ApiError(400,"username or password requireed")
    }

   const user = await User.findOne({
    $or : [{email},{userName}]
   })

   if(!user){
    throw new ApiError(400,"user not found , register first")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
    throw new ApiError(400,"password is incorrect")
   }

   const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly:true,
    secure:false
   }

   return res
   .status(200)
   .cookieS("accessToken",accessToken,options)
   .cookieS('refreshToken',refreshToken,options)
   .json(
    new apiResponse(
        200,
        {
           user: loggedInUser,accessToken,refreshToken
        },
        "user loged In succesfully"
    )
   )

    
})

// logout user
const logoutUser = asyncHandler(async(req,res) => {
    console.log(1)
   await User.findByIdAndUpdate(
    req.user._id,
    {
       $set:{
         refreshToken : undefined
       }
    },
    {
        new:true
    }
   )
   console.log(2)
    const options = {
    httpOnly:true,
    secure:true
   }
console.log(3)
   res
   .status(200)
   .cookie("accessToken",options)
   .cookie("refreshToken",options)
   .json(new apiResponse(200,{},"user loggedout succesfully"))
   console.log(4)
})

export {
    registerUser,
    loginUser,
    logoutUser

}




