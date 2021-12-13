const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./routes/routes.js")(app)

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
app.use(express.static('public'));
