import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user._id
    //TODO: create playlist
    if (!name || !name.trim()) {
        throw new ApiError(400, "please enter playlist name")
    }

    const existedPlaylist = await Playlist.findOne({
        name: name.trim(),
        createdBy: userId
    });

    if (existedPlaylist) {
        throw new ApiError(
            409,
            "Playlist with this name already exists"
        );
    }

    const newPlaylist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        createdBy: userId
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newPlaylist,
                "Playlist created successfully"
            )
        );

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    const playlists = await Playlist.find({
        createdBy: userId
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlists,
                "User playlists fetched successfully"
            )
        );
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "User playlists fetched successfully"
            )
        );
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const alreadyExists = playlist.videos.some(
        (id) => id.toString() === videoId
    )

    if (alreadyExists) {
        throw new ApiError(
            409,
            "Video already exists in playlist"
        );
    }

    playlist.videos.push(videoId);

    await playlist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video added to playlist successfully"
            )
        );

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check playlist ownership
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not the owner of this playlist");
    }

    const alreadyExists = playlist.videos.some(
        (id) => id.toString() === videoId
    );

    if (!alreadyExists) {
        throw new ApiError(404, "Video does not exist in playlist");
    }

    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId
    );

    await playlist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video removed from playlist successfully"
            )
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not owner of this playlist");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedPlaylist,
                " playlist deleted successfully"
            )
        );

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not owner of this playlist");
    }

    const updateFields = {};

    if (name) {
        updateFields.name = name.trim();
    }

    if (description) {
        updateFields.description = description.trim();
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(
            400,
            "Please provide at least one field to update"
        );
    }


    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updateFields
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
                updatedPlaylist,
                " playlist updated successfully"
            )
        );


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
