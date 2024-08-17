import express from "express"
//import cors from "cors"
import multer from "multer"
import { v4 as uuidv4} from "uuid"
import path from "path"

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
    console.log("file is uploaded")
    res.json({
        msg:"File uploaded"
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