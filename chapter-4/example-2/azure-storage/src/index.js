const express = require("express");
const AWS = require("aws-sdk");

const app = express();

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Please specify AWS access key and secret key in environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.");
}

const PORT = process.env.PORT;

console.log("Serving videos from Amazon S3.");

function createS3Client() {
    return new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
}

app.get("/video", (req, res) => {
    const videoPath = req.query.path;
    console.log(`Streaming video from path ${videoPath}.`);

    const s3 = createS3Client();

    const bucketName = "microsvc-video-streaming";

    const params = {
        Bucket: bucketName,
        Key: videoPath
    };

    s3.headObject(params, (err, metadata) => {
        if (err) {
            console.error(`Error occurred getting metadata for video ${bucketName}/${videoPath}.`);
            console.error(err && err.stack || err);
            res.sendStatus(500);
            return;
        }

        res.writeHead(200, {
            "Content-Length": metadata.ContentLength,
            "Content-Type": "video/mp4",
        });

        const stream = s3.getObject(params).createReadStream();
        stream.pipe(res);
    });
});

app.listen(PORT, () => {
    console.log("Microservice online");
});
