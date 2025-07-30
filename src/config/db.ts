import mongoose from "mongoose";

export const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to the database");
  } catch (error) {
    console.log("an error occured", error);
  }
};
