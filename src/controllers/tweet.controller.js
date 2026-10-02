import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { tweet } = req.body

    if (!tweet || !tweet.trim()) {
        throw new ApiError(400, "Tweet cannot be empty");
    }


    const newTweet = await Tweet.create({
        content: tweet,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newTweet,
                "new tweet created succesfully successfully"
            )
        );

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    const skip = (pageNumber - 1) * limitNumber

    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "avatar")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "user tweets fetched successfully"
            )
        );
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweet: newTweet } = req.body
    const { tweetId } = req.params

    if (!newTweet || !newTweet.trim()) {
        throw new ApiError(400, "Tweet cannot be empty");
    }

    const existedTweet = await Tweet.findById(tweetId)

    if (!existedTweet) {
        throw new ApiError(404, "tweet does not exist")
    }
    if (existedTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "user is not owner of this tweet")
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: newTweet.trim()
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "user tweets updated successfully"
            )
        );
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    const existedTweet = await Tweet.findById(tweetId)

    if (!existedTweet) {
        throw new ApiError(404, "tweet does not exist")
    }
    if (existedTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "user is not owner of this tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

     return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedTweet,
                "user tweets deleted successfully"
            )
        );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
