const express = require("express");
const cors = require("cors");
const connectDB = require("./db");   // 👈 THIS LINE

const firRoutes = require("./routes/firRoutes");

const app = express();

// CONNECT DATABASE
connectDB();   // 👈 MUST BE A FUNCTION

app.use(cors());
app.use(express.json());

app.use("/api", firRoutes);
app.use("/firs/:id",firRoutes);
app.use("/firs/:id/status",firRoutes);
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


