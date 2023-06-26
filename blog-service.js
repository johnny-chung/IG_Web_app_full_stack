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

let posts = [];
let categories = [];

var path = require("path");


const readFSync = (fileName) => 
{
    const fs = require("fs");
    try 
    {
        data = fs.readFileSync(fileName, "utf-8");
        //console.log(JSON.parse(data));
        return JSON.parse(data);
    } catch (err) 
    {
        throw err;
    }
};

const sortByDate = (a,b) => {
    dateA = Date.parse(a.postDate);
    dateB = Date.parse(b.postDate);
    return (dateB - dateA);
}
const sortByID = (a,b) => {
    return (a.id - b.id);
}

module.exports.initialize = function() 
{
    return new Promise ((resolve, reject) => 
    {
        try 
        {
            posts = readFSync(path.join(__dirname,"/data/posts.json"));            
            categories = readFSync(path.join(__dirname,"/data/categories.json"));
        } catch (err) 
        {
            reject("unable to read file");
        }
        //console.log("In initialize");
        
        resolve();
    })       
}


module.exports.getAllPosts = function() 
{
    return new Promise ((resolve, reject) => 
    {
        posts.sort(sortByID);
        if (posts.length == 0) reject("Error: no results returned");
        resolve(posts);
    })
}

module.exports.getPublishedPosts = function() 
{
    return new Promise ((resolve, reject) => 
    {        
        const publishedPost = posts.filter(post => post.published == true);
        publishedPost.sort(sortByDate);
        if (publishedPost.length == 0) reject("Error: No post has been published");
        resolve(publishedPost);
    })
}

module.exports.getCategories = function() 
{
    return new Promise ((resolve, reject) => 
    {
        if (categories.length == 0) reject("Error: No category return");
        resolve(categories);
    })
}


module.exports.addPost = function(postData)
{
    return new Promise ((res, rej) => 
    {
        if (postData.published) 
            postData.published = true;
        else
            postData.published = false;
        
        // set id
        postData.id = posts.length + 1;
        postData.postDate = new Date().toJSON().slice(0, 10); 
        posts.push(postData);
        res();
    })
}

module.exports.getPostsByCategory = function(category)
{
    return new Promise((res, rej)=>
    {
        const postsByCategory = posts.filter(post => post.category == category);
        postsByCategory.sort(sortByDate);
        if (postsByCategory.length == 0) rej("Error: No post in this caregory");
        res(postsByCategory);
    })
}

module.exports.getPostsByMinDate = function(minDateStr)
{
    minDate = Date.parse(minDateStr);

    return new Promise((res, rej)=>
    {
        const postsByMinDate = posts.filter(post => Date.parse(post.postDate) > minDate);
        postsByMinDate.sort(sortByDate);
        if (postsByMinDate.length == 0) rej("Error: No post found after this date");
        res(postsByMinDate);
    })
}

module.exports.getPostById = function (id) 
{
   
    console.log(" in get post");
    console.log(id);
    return new Promise ((resolve, reject) => 
    {        
        const postById = posts.filter(post => post.id == id);
        postById.sort(sortByDate);
        if (postById.length == 0) reject("Error: No post by this id");
        resolve(postById[0]);
    })
}

module.exports.getPublishedPostsByCategory = function(category)
{
    return new Promise((res, rej)=>
    {
        const filterPost = posts.filter(post => post.category == category && post.published == true);
        filterPost.sort(sortByDate);
        if (filterPost.length == 0) rej("Error: No published post in this caregory");
        res(filterPost);
    })
}

// self test

//readFile(path.join(__dirname,"./data/posts.json"), posts);

// initialize()
// .then(() => {
//     console.log(posts[0])
//     const publishedPost = posts.filter(post => post.published == true);
//     console.log (publishedPost.length);
// })
// .catch((error) => {
//     console.error(error);
// });







