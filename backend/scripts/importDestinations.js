import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import Destination from "../src/models/Destination.js"; 

// 1. MongoDB connection
const mongoURI = "mongodb+srv://muditaa11:inerworld@cluster0.6evjuvc.mongodb.net/safelink_a?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your URI

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// 2. CSV file path
const csvFilePath = "./scripts/destinations.csv"; 

const destinations = [];

// 3. Read CSV and format data
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    const { name, state, latitude, longitude } = row;

    if (!name || !state || !latitude || !longitude) return;

    destinations.push({
      name: name.trim(),
      state: state.trim(),
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });
  })
  .on("end", async () => {
    try {
      if (destinations.length === 0) {
        console.log("No valid data found in CSV.");
        process.exit(0);
      }

      // 4. Insert into MongoDB
      await Destination.insertMany(destinations);
      console.log(`${destinations.length} destinations inserted successfully.`);
    } catch (err) {
      console.error("Error inserting destinations:", err);
    } finally {
      mongoose.connection.close();
    }
  });
