const cors = require("cors");

require("dotenv").config();
const app = require("./src/app");
 app.use(cors({
  origin: [
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
 

const PORT = process.env.PORT || 3000;


app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
