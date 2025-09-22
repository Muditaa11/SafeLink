import express from "express"
import connectDB from "./lib/db.js";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import locationRoutes from "./routes/location.routes.js";
import userLocationRoutes from "./routes/userLocationRoutes.js";
import SOSRoutes from "./routes/sos.js";
import friendRoutes from "./routes/friendRoutes.js";

import reviewRoutes from "./routes/reviewRoutes.js";
import userKycRoutes from "./routes/userKycRoutes.js";
import adminRoutes from "./routes/admin/admin.js";
import masterAdmin from "./routes/admin/masterAdmin.js";
import authAdmin from "./routes/admin/auth.js";
import cors from "cors";

dotenv.config()


const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);  //complete
app.use("/api/users", userRoutes);   //complete
app.use("/destinations", destinationRoutes); //complete
app.use("/trips", tripRoutes); //complete
app.use("/api/location", locationRoutes); //complete saving user location
app.use("/api/user-location", userLocationRoutes); //complete fetching user location
app.use("/api/sos", SOSRoutes); //complete sos routes
app.use("/api/friends", friendRoutes); //complete friend routes
app.use("/api/admin/kyc", adminRoutes); //complete kyc routes
app.use("/api/user/kyc", userKycRoutes); //complete user kyc routes
app.use("/api/reviews", reviewRoutes); //complete review routes

app.use("/api/admin", adminRoutes);
app.use("/api/admin/master", masterAdmin);
app.use("/api/admin/auth", authAdmin);


const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on ${PORT}`);
    connectDB();
})