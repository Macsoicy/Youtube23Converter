//required package
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");  // Explicitly include the path module
const fs = require("fs"); // Include the fs module
require("dotenv").config();

//create the express server
const app = express();

//server port number
const PORT = process.env.PORT || 3000;

//set template egine
app.set("view engine", "ejs");
app.use(express.static("public"));

//needed to parse html data for PORT request
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/downloads/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "public", "downloads", filename);
  
    // Ensure the file exists
    if (fs.existsSync(filePath)) {
      // Set headers to trigger a download
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "audio/mpeg");
  
      // Stream the MP3 file directly to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).send("File not found");
    }
  });
  

app.post("/convert-mp3", async (req, res) => {
  const videoID = req.body.videoID;
  if (videoID === undefined || videoID === "" || videoID === null) {
    return res.render("index", {
      success: false,
      message: " please enter a video link",
    });
  } else {
    const fetchAPI = await fetch(
      `https://youtube-mp36.p.rapidapi.com/dl?id=${videoID}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key" : process.env.API_KEY,
          "X-RapidAPI-Host": process.env.API_HOST,
        },
      }
    );

    const fetchResponse = await fetchAPI.json();

    if (fetchResponse.status === "ok")
      return res.render("index", {
        success: true,
        song_title: fetchResponse.title,
        song_link : fetchResponse.link,
      });
    else
      return res.render("index", {
        success: false,
        message : fetchResponse.msg,
      });
  }
});

//START SERVER
app.listen(PORT, () => {
  console.log(`server started on poer ${PORT}`);
});
