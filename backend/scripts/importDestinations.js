import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
// Make sure this path correctly points to your Mongoose model
import Destination from "../src/models/Destination.js"; 

// 1. MongoDB Connection
const mongoURI = "mongodb+srv://muditaa11:inerworld@cluster0.6evjuvc.mongodb.net/safelink_a?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
  // These options are deprecated but won't cause errors. 
  // useNewUrlParser: true, 
  // useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected successfully! ✅"))
  .catch(err => console.error("MongoDB connection error:", err));

// 2. CSV file path
const csvFilePath = "./scripts/destinations_with_guidelines.csv"; 

const destinations = [];

// 3. Read CSV and format data
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    // UPDATED: Destructure the new guideline fields from the row
    const { 
      name, 
      state,
      city,
      latitude, 
      longitude, 
      safety_guidelines, 
      cultural_guidelines, 
      tech_guidelines 
    } = row;

    // A more robust check to ensure all required fields are present
    if (!name || !state || !latitude || !longitude || !safety_guidelines || !cultural_guidelines || !tech_guidelines || !city) {
        console.warn('Skipping incomplete row:', row);
        return;
    }

    // Push the complete object, including guidelines, to the array
    destinations.push({
      name: name.trim(),
      state: state.trim(),
      city: city.trim(),
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      // ADDED: Include the three guideline fields
      safety_guidelines: safety_guidelines.trim(),
      cultural_guidelines: cultural_guidelines.trim(),
      tech_guidelines: tech_guidelines.trim(),
    });
  })
  .on("end", async () => {
    console.log(`Finished reading CSV file. Found ${destinations.length} valid destinations to insert.`);
    try {
      if (destinations.length === 0) {
        console.log("No valid data was found in the CSV to import.");
        process.exit(0);
      }

      // 4. Insert into MongoDB
      // Using deleteMany to clear old data before inserting, preventing duplicates on re-run
      console.log("Clearing existing destinations from the collection...");
      await Destination.deleteMany({});
      
      console.log(`Inserting ${destinations.length} new destinations...`);
      await Destination.insertMany(destinations);
      console.log(`✅ Successfully inserted ${destinations.length} destinations.`);

    } catch (err) {
      console.error("❌ Error during database operation:", err);
    } finally {
      // Close the connection to the database
      mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }
  });