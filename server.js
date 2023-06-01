/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Wai Yin Chung, Johnny________ Student ID: 180995219________ Date: 31 May 2023__________
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

let blog=require("./blog-service.js");

app.use(express.static('public')); 

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.redirect(`/about`);
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/blog", (req, res) => {
    blog.getPublishedPosts()
    .then((data)=> {
        res.send(data);
    }).catch((err) =>{
        res.status(500).send({message: err});
    })
});

app.get("/posts", (req, res) => {
    blog.getAllPosts()
    .then((data)=> {
        res.send(data);
    }).catch((err) =>{
        res.status(500).send({message: err});
    })
});

app.get("/categories", (req, res) => {
    blog.getCategories()
    .then((data)=> {
        res.send(data);
    }).catch((err) =>{
        res.status(500).send({message: err});
    })
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

blog.initialize()
.then(app.listen(HTTP_PORT, onHttpStart))
.catch((err) => {
    console.log(err);
})


