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


