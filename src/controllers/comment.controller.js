import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse} from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const comments = await Comment.find({
        video: videoId
    })

  await comments.populate("user", "avatar")
    return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            "Comments fetched successfully"
        )
    );
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params
    const { comment } = req.body

    if (!comment || !comment.trim()) {
        throw new ApiError(400, "comment does not exist")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "comment does not exist")
    }

    const newComment = await Comment.create({
        content: comment,
        video: video,
        owner: req.user._id
    })

    if (!newComment) {
        throw new ApiError(500, "something wentwrong while adding comment")
    }

    await newComment.populate("owner", "avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            newComment,
            "Comment created successfully"
        )
    );
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params
    const { comment: newComment } = req.body


    if (!newComment || !newComment.trim()) {
        throw new ApiError(400, "comment does not exist")
    }

    const existedComment = await Comment.findById(commentId)

    if (!existedComment) {
        throw new ApiError(404, "Comment not found");
    }

    if (existedComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not the owner of this comment")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newComment.trim()
            }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const existedComment = await Comment.findById(commentId);

     if (!existedComment) {
        throw new ApiError(404, "Comment not found");
    }

      if (existedComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not the owner of this comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

        return res.status(200).json(
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted successfully"
        )
    );

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
