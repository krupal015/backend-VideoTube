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
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong")
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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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
        userName: userName.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullName,
        email,
        password
    })

    console.log("5");
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "something wentwrong while registering the user")
    }

    console.log("register is working succesfully");


    return res.status(201).json(
        new apiResponse(200, createdUser, "user is created successfully")
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
const loginUser = asyncHandler(async (req, res) => {

    const { userName, email, password } = req.body

    if (!(userName || email)) {
        throw new ApiError(400, "username or password requireed")
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!user) {
        throw new ApiError(400, "user not found , register first")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .cookieS("accessToken", accessToken, options)
        .cookieS('refreshToken', refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user loged In succesfully"
            )
        )


})

// logout user
const logoutUser = asyncHandler(async (req, res) => {
    console.log(1)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    console.log(2)
    const options = {
        httpOnly: true,
        secure: true
    }
    console.log(3)
    res
        .status(200)
        .cookie("accessToken", options)
        .cookie("refreshToken", options)
        .json(new apiResponse(200, {}, "user loggedout succesfully"))
    console.log(4)
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshtoken) {
        throw new ApiError(402, "unauthorized access")
    }
    try {

        const decodedToken = jwt.verify(
            refreshAccessToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(402, "invalid access token");
        }

        //   to check if both refresh token are same 
        if (incomingRefreshtoken !== user?.refreshToken) {
            throw new ApiError(403, "refresh token is expired or used");
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new apiResponse(200, { accessToken, newRefreshToken }, "")
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "something went wrong")
    }
})

const changeCurrentpassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (isPasswordCorrect) {
        throw new ApiError(401, "Invalid password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new apiResponse(200, {}, "password change successfully")
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fetched succesfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { userName, email, fullName } = req.body;

    const updateFields = {}

    if (userName) updateFields.userName = userName;
    if (fullName) updateFields.fullName = fullName;
    if (email) updateFields.email = email;

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                updateFields,
            }
        }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file path is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "avatara url is missing")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "user avatar updated successfully")
        )

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const CoverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover Image file path is missing")
    }

    const avatar = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "cover image url is missing")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "user cover image updated successfully")
        )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params

    if (!userName?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "Subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "SubscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$Subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$SubscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$Subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                userName: 1,
                fullName: 1,
                email: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1



            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, channel[0], "user channel fetched suceesfully")
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new apiResponse(200,
                user[0].watchHistory,
                "watch history fetched succesfully"
            )
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentpassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}




