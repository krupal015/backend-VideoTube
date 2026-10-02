import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    if (channelId === req.user._id.toString()) {
        throw new ApiError(
            400,
            "You cannot subscribe to yourself"
        );
    }

    const existingSubsciption = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (existedSubscription) {
        await Subscription.findByIdAndDelete(
            existedSubscription._id
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribed: false },
                    "Channel unsubscribed successfully"
                )
            );
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { subscribed: true },
                "Channel subscribed successfully"
            )
        );


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate(
        "subscriber",
        "username avatar"
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "Channel subscribers fetched successfully"
            )
        );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscriptions = await Subscription.find({
        subscriber: subscriberId
    }).populate(
        "channel",
        "username avatar"
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscriptions,
                "Subscribed channels fetched successfully"
            )
        );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}