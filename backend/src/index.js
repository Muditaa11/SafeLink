import express from "express"
import connectDB from "./lib/db.js";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import locationRoutes from "./routes/location.routes.js";
import userLocationRoutes from "./routes/userLocationRoutes.js";

dotenv.config()


const app = express();
app.use(express.json());


app.use("/api/auth", authRoutes);  //complete
app.use("/api/users", userRoutes);   //complete
app.use("/destinations", destinationRoutes); //complete
app.use("/trips", tripRoutes); //complete
app.use("/api/location", locationRoutes); //complete
app.use("/api/user-location", userLocationRoutes); //complete

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on ${PORT}`);
    connectDB();
})