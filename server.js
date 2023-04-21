const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;
const videoNames = ["001_Welcome!", "002_Working_on_Our_First_App", "003_Adding_a_Form"];

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.render("index", { videoNames });
});

app.get("/showVideo/:id", (req, res) => {
    const videoID = (+req.params.id);
    if (videoID > videoNames.length - 1 || videoID < 0) {
        return res.redirect("/showVideo/0");
    }
    res.render("video", { videoID });
});

app.get("/video/:id", (req, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    let videoID = (+req.params.id);
    if (videoID > videoNames.length - 1 || videoID < 0) {
        videoID = 0;
    }
    const videoPath = path.join(__dirname, 'public', "videos", videoNames[videoID] + ".mp4");
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}!`);
});