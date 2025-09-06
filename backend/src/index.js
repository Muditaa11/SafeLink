import express from "express"
import connectDB from "./lib/db.js";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config()


const app = express();
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);   
app.use("/destinations", destinationRoutes);
app.use("/trips", tripRoutes);
app.use("/history", historyRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    connectDB();
})