require('dotenv').config();
const express = require('express');
require("./config/database").connect();
const path = require("path");

const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

const port = process.env.PORT || 8000;

const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");
const chatRoute = require("./routes/chatRoute");
const router = require("./routes/router");
app.get('/', (req, res) => {
    res.send("Hello World");
});
app.use('/api', authRoute);
app.use('/api', chatRoute);
app.use('/api/admin', adminRoute);
app.use('/api', router);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});