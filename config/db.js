const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

// Connect mongoDB with mongoose
const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser: true,
            //useCreateIndex: true // get rid of marnings
            //useFindAndModify: false
            //useUnifieldTopology: true
        });

        console.log('MongoDB connected.');
    } catch(err){
        console.log(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;