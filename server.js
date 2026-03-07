require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/police", require("./routes/policeRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/user/my-firs", require("./routes/userRoutes"));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});