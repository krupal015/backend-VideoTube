import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { apiResponse, ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "avatar")

    return res
        .status(200)
        .json(
            new apiResponse(200, videos, "video fetched  succesfully")
        )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError(400, " Title or description is missing")
    }

    const { videoFile, thumbnail } = req.files

    if (!videoFile || !videoFile[0]) {
        throw new ApiError(400, "Video file not available");
    }

    if (!thumbnail || !thumbnail[0]) {
        throw new ApiError(400, "Thumbnail not available");
    }

    const videoUpload = await uploadOnCloudinary(videoFile?.[0].path)
    const thumbnailUpload = await uploadOnCloudinary(thumbnail?.[0].path)

    if (!videoUpload) {
        throw new ApiError(500, " video cannot upload to server")
    }
    if (!thumbnailUpload) {
        throw new ApiError(500, " thhumbnail cannot upload to server")
    }

    const video = await Video.create({
        owner: req.user._id,
        title: title,
        description: description,
        videoFile: videoUpload?.url,
        thumbnail: thumbnailUpload?.url

    })

    return res
        .status(201)
        .json(
            new apiResponse(201, video, "video published succesfully")
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    video,
                    "Video fetched successfully"
                )
            );
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "User is not the owner of this video"
        );
    }

    const { title, description } = req.body

    const updateFields = {}

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (req?.files?.thumbnail?.[0]) {
        const uploadNewThumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path);

         if (!uploadNewThumbnail) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    updateFields.thumbnail = uploadNewThumbnail.url;
    }
   

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateVideo,
                "Video details updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video does not exist")
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            405,"user is not the owner of this video"
        )
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

     return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedVideo,
                "Video deleted successfully"
            )
        );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

     const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video does not exist")
    }
    
   video.isPublished = !video.isPublished;

    await video.save();

     return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                 "Video publish status toggled successfully"
            )
        );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
