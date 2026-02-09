
require("dotenv").config();
const app = require("./src/app");


const PORT = process.env.PORT || 3001;


app.get("/health", (req, res) => {
  res.status(200).send("OKk");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
