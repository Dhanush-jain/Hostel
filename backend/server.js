const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");


const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/admission", require("./routes/admissionRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/votes", require("./routes/voteRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));