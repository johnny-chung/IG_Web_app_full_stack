/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Wai Yin Chung, Johnny________ Student ID: 180995219________ Date: 14 June 2023__________
*
*  Cyclic Web App URL: https://tame-gold-dhole-vest.cyclic.app_________________
*
*  GitHub Repository URL: https://github.com/johnny-chung/web322-app.git______________
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

let blog=require("./blog-service.js");

//dotenv
const env =require("dotenv");
env.config()


// cloudinary config

cloudinary.config(
    {
    cloud_name: 'dp2anoz4i',
    //cloud_name: process.env.CLOUDINARY_NAME,
    api_key: '312556922355814',
    //api_key: process.env.CLOUDINARY_API,
    api_secret: 'pdKwbgA2e8IpIh7pL147GOXl1sE',
    //api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// setup multer with no disk storage

const upload = multer(); 

app.use(express.static('public')); 

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => 
{
    res.redirect(`/about`);
});

app.get("/about", (req, res) => 
{
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/blog", (req, res) => 
{
    blog.getPublishedPosts()
    .then((data)=> 
    {
        res.send(data);
    }).catch((err) =>
    {
        res.status(500).send({message: err});
    })
});

app.get("/posts", (req, res) => 
{
    const category = req.query.category;
    const minDate = req.query.minDate;
    // handle query = category
    if (category)
    {
        blog.getPostsByCategory(category)
        .then((data) =>
        {
            res.json(data);
        }).catch((err) => 
        {
            res.status(500).send({message: err});
        }) 
    }
    // handle query = minDate
    else if (minDate)
    {
        blog.getPostsByMinDate(minDate)
        .then((data) =>
        {
            res.json(data);
        }).catch((err) => 
        {
            res.status(500).send({message: err});
        }) 
    }
    // handle everything else
    else
    {
        blog.getAllPosts()
        .then((data)=> 
        {
            res.send(data);
        }).catch((err) =>
        {
            res.status(500).send({message: err});
        })
    }
    
});

// get all categories
app.get("/categories", (req, res) => 
{
    blog.getCategories()
    .then((data)=> 
    {
        res.send(data);
    }).catch((err) =>
    {
        res.status(500).send({message: err});
    })
});

// go to add post page
app.get("/posts/add", (req, res) => 
{
    res.sendFile(path.join(__dirname,"/views/addPost.html"));
});

// POST: add post
app.post("/posts/add", upload.single("featureImage"), (req, res) => {

    // code from cloudinary
    if(req.file)
    {
        let streamUpload = (req) => 
        {
            return new Promise((resolve, reject) => 
            {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => 
                    {
                        if (result) 
                        {
                            resolve(result);
                        } 
                        else 
                        {
                            reject(error);
                        }
                    }
                );    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>
        {
            processPost(uploaded.url);
        });
    } 
    else
    {
        processPost("");
    }    

    function processPost(imageUrl){
        req.body.featureImage = imageUrl;    
        blog.addPost(req.body)
        .then(()=>{
            res.redirect("/posts")
        })
        .catch((err) => {
            console.log(err);
        });
    } 

    //res.redirect("/posts")
    
})

// get post by id
app.get("/post/:id", (req, res) => 
{
    blog.getPostById(req.params.id)
    .then((data)=> 
    {
        res.json(data);
    }).catch((err) =>
    {
        res.status(500).send({message: err});
    })
})


app.use((req, res) => 
{
    res.status(404).send("Page Not Found");
});


function onHttpStart() 
{
    console.log("Express http server listening on: " + HTTP_PORT);
}

blog.initialize()
.then(app.listen(HTTP_PORT, onHttpStart))
.catch((err) => 
{
    console.log(err);
})


