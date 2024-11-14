const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectToMongoDB } = require('./connect');
const {checkForAuthentication, restrictTo} = require('./middlewares/auth');


const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();
const PORT = 8080;

// Connection 
connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() => console.log("Connection Success")).catch((err) => console.log("Error is", err));

// Set Engine for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthentication)

app.use('/url',restrictTo(["NORMAL", "ADMIN"]), urlRoute)
app.use('/user', userRoute);
app.use('/', staticRoute);


app.get('/url/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {
        $push: {
            visitHistory: {
                timestamp: Date.now()
            }
        }
    });
    if (!entry || !entry.redirectURL) {
        return res.status(404).send({ error: 'URL not found' });
    }
    return res.redirect(entry.redirectURL);
});


app.listen(PORT, () => console.log(`App Listing at ${PORT}`));


