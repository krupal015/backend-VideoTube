import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user._id;

    const totalVideos = await Video.countDocuments({
        owner: channelId
    })

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalVideos,
                    totalSubscribers
                },
                "Channel stats fetched successfully"
            )
        );

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {  page = 1, limit = 10 } = req.query
    const { channelId } = req.params;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber

    const videos = await Video.find({ owner : channelId })
        .sort({ createdAt : -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "avatar")

    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "video fetched  succesfully")
        )
})

export {
    getChannelStats,
    getChannelVideos
}