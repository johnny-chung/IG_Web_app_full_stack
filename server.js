/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Wai Yin Chung, Johnny________ Student ID: 180995219________ Date: 26 June 2023__________
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
//safeHTML
const stripJS = require('strip-js');

let blog=require("./blog-service.js");

//================================
//dotenv
const env =require("dotenv");
env.config()

//======================================
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

//===================================

// setup multer with no disk storage
const upload = multer(); 

//==============================
// express handlebars

const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    // helper function for nav bar 
    helpers:
    {
        navLink: function(url, options)
        {
            return (
                '<li' +
                ((url==app.locals.activeRoute)? ' class="active"':"") +
                `><a href=${url}>${options.fn(this)}</a><li>`);
        },
        equal: function (lvalue, rvalue, options) 
        {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) 
            {
                return options.inverse(this);
            } 
            else 
            {
                return options.fn(this);
            }
        },
        //safeHTML helper
        safeHTML: function(context)
        {
            return stripJS(context);
        },
        //format date
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
        
    }
   
    
}));

app.set('view engine', '.hbs');

//====================================

// middleware

app.use(express.static('public')); 

//==================
// see active tab
app.use(function(req,res,next)
{
    let route = req.path.substring(1);    
    //console.log(`Route: ${route}`);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    //console.log(`Viewing Category: ${app.locals.viewingCategory}`);
    app.locals.viewingCategory = req.query.category;
    next();
});

//regular express
app.use(express.urlencoded({extended: true}));

//======================================
//route

// setup a 'route' to listen on the default url path
// redirect to about.html
app.get("/", (req, res) => 
{
    res.redirect(`/blog`);
});


app.get("/about", (req, res) => 
{
    res.render('about');
});

//-----------------
// post

// list all publish blog
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

    
});

//blog id
app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        console.log(req.params.id);
        viewData.post = await blog.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// get all post, post by category(query) or by minDate (query)
app.get("/posts", async (req, res) => 
{
    const category = req.query.category;
    const minDate = req.query.minDate;
    // handle query = category
    if (category)
    {
        try{
            const data = await blog.getPostsByCategory(category);
            res.render("posts",{post: data});
        } catch(err) 
        {
            console.log(err);
            res.status(500).render("posts", {message: "No results"});
        } 
    }
    // handle query = minDate
    else if (minDate)
    {
        try{
            const data = await blog.getPostsByMinDate(minDate);        
            res.render("posts",{post: data});
        } catch (err) 
        {
            console.log(err);
            res.status(500).render("posts", {message: "No results"});
        }
    }
    // handle everything else
    else
    {
        try {
            const data = await blog.getAllPosts();
            res.render("posts", {post: data});
        }      
        catch(err)
        {
            console.log(err);
            res.status(500).render("posts", {message: "No results"});
        }
    }
    
});

// get post by id
app.get("/post/:id", async (req, res) => 
{
    try{
        const data = await blog.getPostById(req.params.id);               
        res.render("posts",{post: data});
    } 
    catch(err) 
    {
        console.log(err);
        res.status(500).render("posts", {message: "No results"});
    }
})


// go to add post page
app.get("/posts/add", async (req, res) => 
{
    try{
        const data = await blog.getCategories();
        res.render('addPost', {categories: data});
    } catch (err)
    {
        console.log(err);
        res.status(500).render("addPost", {message: "No Category"});
    }
    
});

// POST: add post
app.post("/posts/add", upload.single("featureImage"), async (req, res) => {

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
    
        upload(req).then(async (uploaded)=>
        {
            await processPost(uploaded.url);
        });
    } 
    else
    {
        await processPost("");
    }    

    async function processPost(imageUrl){
        req.body.featureImage = imageUrl;                   
        try{
            await blog.addPost(req.body);
            res.redirect("/posts");
        }
        catch(err)
        {
            console.log(err);
        };
    } 

    //res.redirect("/posts")
    
})
 //Delete
app.get("/posts/delete/:id", async(req, res) => 
{
    try {
        await blog.deletePostById(req.params.id);        
        res.redirect("/posts");
    } catch (err)
    {
        console.log(err);
        res.status(500).render("posts", {message: "Unable to Remove Post/ Post not found"});
    }
})



//-----------------
// category

// get all categories
app.get("/categories", async (req, res) => 
{
    try {
        const data = await blog.getCategories();
        res.render("categories", {category: data});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).render("categories", {message: "No results"});
    }
});

// go to add category page
app.get("/categories/add", (req, res) => 
{
    res.render('addCategory');
});


app.post("/categories/add", async (req, res) => 
{
    try{
        await blog.addCategory(req.body);
        res.redirect("/categories");

    } catch (err)
    {
        console.log(err);
    }
});

app.get("/categories/delete/:id", async(req, res) => 
{
    try {
        await blog.deleteCategoryById(req.params.id);        
        res.redirect("/categories");
    } catch (err)
    {
        console.log(err);
        res.status(500).render("categories", {message: "Unable to Remove Category/ Category not found"});
    }
})






// others
app.use((req, res) => 
{
    res.status(404).render("error");
});


function onHttpStart() 
{
    console.log("Express http server listening on: " + HTTP_PORT);
}


const listenFunc = async() => {    
    try {
        await blog.initialize();
        app.listen(HTTP_PORT, onHttpStart);
    } catch (err)
    {
        console.log(err)
    }
}
//call blog initialize
listenFunc();


