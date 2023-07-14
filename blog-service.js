/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Wai Yin Chung, Johnny________ Student ID: 180995219________ Date: 12 July 2023__________
*
*  Cyclic Web App URL: https://tame-gold-dhole-vest.cyclic.app_________________
*
*  GitHub Repository URL: https://github.com/johnny-chung/web322-app.git______________
*
********************************************************************************/

//=================
// setup

const Sequelize = require('sequelize');

//setup sequelize
let sequelize = new Sequelize(`tzkohokz`, `tzkohokz`, `dq1twuOkGRR-IHkpI69ocj_2dcO4EX8q`,
    {
        host: `stampy.db.elephantsql.com`,
        dialect: 'postgres',
        port: 5432,
        dislectOption:
        {
            ssl: { rejectUnauthorized: false }
        },
        query: { raw: true }
    });

let Post = sequelize.define('Post',
    {
        body: Sequelize.TEXT,
        title: Sequelize.STRING,
        postDate: Sequelize.DATE,
        featureImage: Sequelize.STRING,
        published: Sequelize.BOOLEAN
    });

let Category = sequelize.define('Category',
    {
        category: Sequelize.STRING
    });

Post.belongsTo(Category, { foreignKey: "category" });


//--------------------
// helper

const sortByDate = (a, b) => {
    dateA = Date.parse(a.postDate);
    dateB = Date.parse(b.postDate);
    return (dateB - dateA);
}
const sortByID = (a, b) => {
    return (a.id - b.id);
}

//--------------
// initialize

module.exports.initialize = async function () {
    try {
        await sequelize.sync();
        console.log("sequelize sync");
        return ("success");
    } catch (err) {
        throw new Error("unable to sync the database");
    }
    //console.log("In initialize");
}

//=======================
// post
// read
module.exports.getAllPosts = async function () {
    try {
        const filteredPosts = await Post.findAll();
        if (filteredPosts.length == 0)
            throw new Error("Error: No post found");
        filteredPosts.sort(sortByID);
        //console.log(filteredPosts);
        return (filteredPosts);
    } catch (err) {
        throw new Error("Error: No post found");
    }

}

module.exports.getPublishedPosts = async function () {
    try {
        const filteredPosts = await Post.findAll({
            where: {
                published: true
            }
        });
        if (filteredPosts.length == 0)
            throw new Error("Error: No post has been published");
        filteredPosts.sort(sortByDate);
        return (filteredPosts);
    } catch (err) {
        throw new Error(err);
    }
}

module.exports.getPostsByCategory = async function (categoryIn) {


    try {
        const filteredPosts = await Post.findAll({
            where: {
                category: categoryIn
            }
        });
        if (filteredPosts.length == 0)
            throw new Error("Error: No post in this caregory");
        filteredPosts.sort(sortByDate);
        return (filteredPosts);
    } catch (err) {
        throw ("Error: No post in this caregory");
    }

}

module.exports.getPostsByMinDate = async function (minDateStr) {
    const Op = Sequelize.Op;

    try {
        const filteredPosts = await Post.findAll({
            where: {
                postDate: {
                    [Op.gte]: new Date(minDateStr)
                }
            }
        });
        if (filteredPosts.length == 0)
            throw new Error("Error: No posts found after this date");
        filteredPosts.sort(sortByDate);
        return (filteredPosts);
    } catch (err) {
        throw new Error("Error: No posts found after this date");
    }

}

module.exports.getPostById = async function (idIn) {

    //console.log(" in get post");
    //console.log(id);

    try {
        const filteredPosts = await Post.findAll({
            where: {
                id: idIn
            }
        });
        if (filteredPosts.length == 0)
            throw new Error("Error: post does not exist");
        filteredPosts.sort(sortByDate);
        return (filteredPosts[0]);
    } catch (err) {
        throw new Error("Error: post does not exist");
    }

}

module.exports.getPublishedPostsByCategory = async function (categoryIn) {

    try {
        const filteredPosts = await Post.findAll({
            where: {
                category: categoryIn,
                published: true
            }
        });
        if (filteredPosts.length == 0)
            throw new Error("Error: No post published in this category");
        filteredPosts.sort(sortByDate);
        return (filteredPosts);
    } catch (err) {
        throw new Error("Error: No post published in this category");
    }

}

//create

module.exports.addPost = async function (postData) {
    postData.published = postData.published ? true : false;

    for (let key in postData) {
        if (postData[key] == "") {
            postData[key] = null;
        }
    }
    postData.postDate = new Date().toJSON().slice(0, 10);

    try {
        await Post.create(postData);
        console.log("post create");
        return ("Post added")
    } catch (err) {
        throw new Error("Error: unable to create post")
    }
}

// delete
module.exports.deletPostyById = async function(idIn)
{
    try {
        await Post.destroy(
            {
                where: { id: idIn}
            }
        );
        return ("destroyed");
    } catch (err)
    {
        throw new Error ("Error: fail to delete post " + idIn)
    }
}


//===============
// category

// read
module.exports.getCategories = async function () {
    try {
        const categ = await Category.findAll();
        if (categ.length == 0)
            throw new Error("Error: No categories found");
        return (categ);
    } catch (err) {
        throw new Error("Error: No categories found");
    }
}

// create
module.exports.addCategory= async function (categoryData)
{
    for (const key in categoryData)
    {
        if (categoryData[key] == "")
        {
            categoryData[key] = null;
        }
    }
    try 
    {
        await Category.create(categoryData);
        console.log("category added");
        return("category added");
    } catch (err)
    {
        throw new Error ("Error: Unable to create category");
    }
}

// delete
module.exports.deleteCategoryById = async function(idIn)
{
    try {
        await Category.destroy(
            {
                where: { id: idIn}
            }
        );
        return ("destroyed");
    } catch (err)
    {
        throw new Error ("Error: fail to delete category " + idIn)
    }
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







