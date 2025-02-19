const express = require("express");
const app = express();
const path = require("node:path");
const expressSession = require("express-session");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const db = require("./db/queries");
const indexRouter = require("./routes/indexRouter").indexRouter;
const fileRouter = require("./routes/fileRouter").fileRouter;

app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.deserialize(id);
    // const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log("im in the localstrategy function");
    try {
      const user = await db.checkUserExists(username);
      // const user = rows[0];
      console.log(`user:`);
      console.log(user);
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      console.log(`match:`);
      console.log(match);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

app.use("/", indexRouter);
app.use("/files", fileRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`File Uploader app - listening on port ${PORT}!`);
});
