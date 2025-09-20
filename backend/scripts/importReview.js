import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import Review from '../src/models/Review.js'; 
import Destination from '../src/models/Destination.js'; 

// --- Configuration ---
const MONGO_URI = 'mongodb+srv://muditaa11:inerworld@cluster0.6evjuvc.mongodb.net/safelink_a?retryWrites=true&w=majority&appName=Cluster0'; 
const CSV_FILE_PATH = './scripts/reviews.csv'; 

// --- Main Import Logic ---
const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    const reviewsToInsert = [];
    const processingPromises = []; // 👈 1. Create an array to hold our promises

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // 👈 2. Wrap the async operation in a function and push its promise to the array
        const processRow = async () => {
          const destinationDoc = await Destination.findOne({ name: row.destination });

          if (destinationDoc) {
            reviewsToInsert.push({
              tourist_name: row.tourist_name,
              tourist_email: row.tourist_email,
              destination: row.destination,
              review: row.review,
              rating: Number(row.rating),
              destinationId: destinationDoc._id,
            });
          } else {
            console.warn(`⚠️ Destination not found for: "${row.destination}". Skipping review.`);
          }
        };
        processingPromises.push(processRow()); // Add the promise to the list
      })
      .on('end', async () => {
        // 👈 3. Wait for ALL the row processing promises to finish
        await Promise.all(processingPromises);
        console.log('🏁 All rows processed.');

        // Now it's safe to insert and disconnect
        if (reviewsToInsert.length > 0) {
          console.log(`⏳ Inserting ${reviewsToInsert.length} reviews...`);
          await Review.insertMany(reviewsToInsert);
          console.log('✅ All reviews have been successfully imported!');
        } else {
          console.log('🤷 No new reviews to import.');
        }

        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
      })
      .on('error', (error) => {
        console.error('❌ Error processing CSV file:', error);
        mongoose.disconnect();
      });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB or run import:', error);
    process.exit(1);
  }
};

importData();