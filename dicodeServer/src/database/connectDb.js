import mongoose from "mongoose";

const connectDb = async() => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/dicode`)        
        return connection;
    } catch (error) {
        console.log("Error connecting to data base ",error);
        return;
    }
}

export default connectDb;