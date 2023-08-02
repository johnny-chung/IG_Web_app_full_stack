const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// encrypt password
const bcrypt = require("bcryptjs");

// dotenv
const env =require("dotenv");
env.config()

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
    },
    password: String,
    email: String,
    loginHistory: [
        {
            dateTime: Date,
            userAgent: String,
        },
    ],
});

let User; // to be defined on new connection

const connectionStr = process.env.MONGO_STR;
//const connectionStr = "mongodb+srv://goodmanisltd:IxG3cjYJHxx2ZsC3@senecaweb322.5p2epkx.mongodb.net/?retryWrites=true&w=majority";

module.exports.initialize = async function () {
    try {
        let db = await mongoose.createConnection(connectionStr, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        db.on("error", (err) => {
            console.log("mongo db error");
            throw err;
        });

        db.once("open", () => {
            console.log("mongo db connected");
            User = db.model("user", userSchema);
        });
    } catch (err) {
        throw err;
    }
};

module.exports.registerUser = async function (userData) {
    try {
        // validation
        if (userData.password != userData.password2) {
            throw new Error("Passwords do not match");
        }

        const hashPW = await bcrypt.hash(userData.password, 10);

        // create new user if valid
        const newUser = new User({
            userName: userData.userName,
            password: hashPW,
            email: userData.email,
            loginHistory: [
                {
                    dateTime: new Date(),
                    userAgent: userData.userAgent,
                },
            ],
        });

        // save
        await newUser.save();
        console.log("New user created");

    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            throw new Error("User name already taken");
        } else {
            throw new Error("There was an error creating the user[ " + err + " ]");
        }
    }
};

module.exports.checkUser = async function (userData) {
    try {
        // check for existing username
        const matchUser = await User.findOne({ userName: userData.userName });
        if (!matchUser) {
            throw new Error(`Unable to find user: ${userData.userName}`);
        }
        // check password match with db
        const pwCk = await bcrypt.compare(userData.password, matchUser.password);
        if (!pwCk) {
            throw new Error(`Incorrect password for user: ${userData.userName}`);
        }

        // update login history
        matchUser.loginHistory.push({
            dateTime: new Date(),
            userAgent: userData.userAgent
        });
        await User.updateOne (
            {userName: matchUser.userName},
            {$set: {loginHistory: matchUser.loginHistory}}
        );
        console.log(`user[${matchUser.userName}] login`);
        return matchUser;
        
    } catch (err) { 
        console.log(err);
        throw new Error(`Error: There was an error verifying the user: ${err}`);
    }
};


