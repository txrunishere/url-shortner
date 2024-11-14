const mongoose = require('mongoose');

async function connectToMongoDB(url) {
    await mongoose.connect(url);
}

module.exports = {
    connectToMongoDB
};