import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema(
    {
        name: {
           type:String,
           required:true
        },
        video:[ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }],
        description: {
            type: string
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },


    },{timestamps:true}
)

// videoSchema.plugin(mongooseAggregatePaginate)

export const Playlist = mongoose.model("Playlist", playlistSchema)