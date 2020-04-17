const mongoose = require('mongoose');
const config = require('config'); //need access to global variable that was created in default.json
//initialize the db
//use config.get to grab the value of the property inside default.json
const db = config.get('mongoURI');

//mongoose return promises
//add these 4 properties so you won't have error shown in the console
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected...') 
    } catch(err) {
        console.log(err.message);
        process.exit(1); //exit with failure = process.exit(1)
    }
}

module.exports = connectDB;