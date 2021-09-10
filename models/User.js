const mogoose = require('mongoose');
/* const Schema = require('mongoose').Schema; */

const UserSchema = new mogoose.Schema({
    socketId: {type: String, unique: true, required: true},
    userName: {type: String, unique: true, required: true},
    userColor: {type: String, unique: true, required: true},
});

const User = mogoose.model('User', UserSchema);

module.exports = User;