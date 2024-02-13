const express = require("express");
const AWS = require("aws-sdk");
const http = require("http");

const app = express();


if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("[Streaming] Please specify AWS access key and secret key in environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.");
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_BUCKET = "microsvc-video-streaming"; // Replace with your S3 bucket name

console.log(`Forwarding video requests to AWS S3 bucket: ${VIDEO_STORAGE_BUCKET}.`);

function createS3Client() {
    return new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
}

app.get("/video", (req, res) => {
    const videoPath = "SampleVideo_1280x720_1mb.mp4"; // Video path is hard-coded for the moment.

    const params = {
        Bucket: VIDEO_STORAGE_BUCKET,
        Key: videoPath
    };
    
    const s3 = createS3Client();

    const forwardRequest = s3.getObject(params).createReadStream();
    forwardRequest.pipe(res);
});

app.listen(PORT, () => {
    console.log(`Microservice online`);
});
