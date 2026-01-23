
require('dotenv').config();
const mongoose = require('mongoose');

// Mongoose 9.x does not need useNewUrlParser/useUnifiedTopology
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/friendly_notebook";

console.log(`Connecting to MongoDB at: ${mongoURI}`);

mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ MongoDB Connection Successful!');
        console.log(`State: ${mongoose.connection.readyState} (1=Connected)`);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });
