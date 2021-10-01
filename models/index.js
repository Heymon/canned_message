const mongoose = require("mongoose");

require('dotenv').config();
const connectingString = process.env.MONGO_URI;
// const connectingString = "mongodb://localhost:27017/socketiostudy";


const configOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(connectingString, configOptions)
.then(() => console.log("MongoDB successfully connected..."))
.catch(err => console.log(`MongoDB connection error: ${err}`));

module.exports = {
    User: require("./User"),
}