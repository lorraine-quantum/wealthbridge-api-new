require("dotenv").config();
require("express-async-errors");
const morgan = require('morgan')
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const docs = require('./docs');
app.set('view engine', 'ejs')
app.use(express.static('./public'))
const mongoose = require('mongoose')
//ADMIN
const connect = require('connect-pg-simple')
const session = require('express-session')
const UserSchema = require('./models/UserModel')


app.use(morgan('dev'))
//auth middlewares
const auth = require("./middleware/authentication");
const adminAuthMiddleware = require("./middleware/admin-auth");

//routes
const transactionRoutes = require('./routes/transactionR')
const withdrawalRoutes = require('./routes/withdrawalR')
const authRoutes = require("./routes/authRoute");
const adminAuth = require("./routes/adminAuth");
const uploadRoutes = require("./routes/uploadIdR")
const modifyUserRoutes = require('./routes/modifyUserR')
const adminRoutes = require('./routes/adminRoute')
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const connectDB = require("./db/connect");

app.use(express.json());
// extra security packages
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: ['https://wealthbridge-admin.vercel.app', 'https://digital-coin-admin.vercel.app', 'http://localhost:5173', 'http://localhost:3000']
}));
app.use(xss());

app.get("/test-upload-ruby", (req, res) => {
  res.render('index');
});

// routes
app.use("/auth", authRoutes);
app.use("/transaction", auth, transactionRoutes);
app.use("/withdrawal", auth, withdrawalRoutes);
app.use("/upload", uploadRoutes);
app.use("/auth", auth, modifyUserRoutes);
app.use("/admin/auth", adminAuth);
app.get('/', (req, res) => {
  res.json({ welcome: 'wealth bridge api' })
})
app.use("/admin", adminAuthMiddleware, adminRoutes);
app.use(notFoundMiddleware);


const port = process.env.PORT || 3000;
//switch between local and cloud db

const local = process.env.LOCAL_URI;
const cloud = process.env.CLOUD_URI;
// const admin = new AdminJS({

// })
const start = async () => {
  try {
    await connectDB(cloud);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();