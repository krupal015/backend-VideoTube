// console.log("Cloudinary file loaded");

import "dotenv/config";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log(cloudinary.config());


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload file on auto
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("Localfilepath : ",localFilePath);
        
        // console.log("file is uploaded successfully", response.url);
        fs.unlinkSync(localFilePath);

        return response;
    }
    catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        console.error(error);
        return null;
    }
    // catch(error){
    //     fs.unlinkSync() //removes the locally saved temporary file as operation is failed
    //     return null;
    // }
}

export { uploadOnCloudinary }