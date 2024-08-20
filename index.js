import express from "express"
//import cors from "cors"
import multer from "multer"
import { v4 as uuidv4} from "uuid"
import path from "path"
import fs from "fs"
import {exec} from "child_process"
import { error } from "console"
import { stderr } from "process"

const app = express()

// multer middleware
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./media")
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + uuidv4()+ path.extname(file.originalname))
    }
})

//multer configuration:
const upload = multer({storage: storage})

// middlewares:
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express)


// endpoints:
app.get('/', function(req, res){
    res.json({
        msg: "Hello, welcome to Adaptive Bitrate streaming"
    })
})

app.post("/upload", upload.single('file'), function(req, res){
    const lessonId = uuidv4()
    const videoPath = req.file.path
    const outputPath = `./media/courses/${lessonId}`
    const hlsPath = `${outputPath}/index.m3u8`
    
    console.log("lessonId is ", lessonId)
    console.log("videoPath is ", videoPath)
    console.log("hlsPath is ", hlsPath)

    // create if folder doesnot exists:
    if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath, {recursive: true})
    }

    //ffmpeg: takes long time. must implement queing system in production
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;
    console.log(ffmpegCommand)

    exec(ffmpegCommand, (error, stdout, stderr)=>{
        if(error){
            console.log(`exec error: ${error}`)
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)

        const videoUrl = `http://localhost/media/courses/${lessonId}/index.m3u8`;
    
        console.log("file is uploaded")
        res.json({
            msg:"Video converted to HLS format",
            videoUrl: videoUrl,
            lessonId: lessonId
        })

    })
})


// Server listening
const port = 3000
app.listen(port, function(err, done){
    if(err){
        console.log("Server listening error at ",port)
    }
    else{
        console.log("Server successfully listening at ",port)
    }
})