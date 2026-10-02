import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "video does not exist")
    }

    // first check that video is already liked or not
    const existedLike = await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(existedLike){
        await Like.findByIdAndDelete(existedLike._id)

         return res
        .status(200)
        .json(
            new ApiResponse(
                    200,
                    { liked: false },
                    "Video unliked successfully"
                )
        );
    }

    const newLike = await Like.create({
         video:videoId,
        likedBy:req.user._id
    })
     return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { liked: true },
                "Video liked successfully"
            )
        );

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

     const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400, "comment does not exist")
    }

    // first check that video is already liked or not
    const existedLike = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })
    if(existedLike){
        await Like.findByIdAndDelete(existedLike._id)

         return res
        .status(200)
        .json(
            new ApiResponse(
                    200,
                    { liked: false },
                    "comment unliked successfully"
                )
        );
    }

    const newLike = await Like.create({
         comment:commentId,
        likedBy:req.user._id
    })
     return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { liked: true },
                "comment liked successfully"
            )
        );

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

      const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(400, "tweet does not exist")
    }

    // first check that video is already liked or not
    const existedLike = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })
    if(existedLike){
        await Like.findByIdAndDelete(existedLike._id)

         return res
        .status(200)
        .json(
            new ApiResponse(
                    200,
                    { liked: false },
                    "tweet unliked successfully"
                )
        );
    }

    const newLike = await Like.create({
         tweet:tweetId,
        likedBy:req.user._id
    })
     return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { liked: true },
                "tweet liked successfully"
            )
        );
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:req.user._id,
                video:{ $ne:null}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:'video',
                foreignField: "_id",
                as:"likedVideos"
            }
        },
        {
            $unwind:"$video"
        },
        {
            $replaceRoot: {
                newRoot: "$likedVideos"
            }
        }
    ])

     return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        );

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}