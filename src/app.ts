import express, { Request, Response } from "express";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import subCategoryRoutes from "./routes/subCatgoryRoutes";
import userRoutes from "./routes/userRoutes";
import { globalErrorHandler } from "./controllers/errorHandler";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRouter from "./routes/paymentRoutes";
import addressRoutes from "./routes/addressRoutes";
import viewsRouter from "./routes/viewsRoutes";
import path from "path";
import passport from "passport";
import prisma from "./config/prisma";
import session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import ejsLayouts from "express-ejs-layouts";

const app = express();

const redisClient = createClient();

redisClient.connect().catch(console.error);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// EJS Layouts setup
app.use(ejsLayouts);
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(morgan("dev"));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use("/", viewsRouter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/subcategory", subCategoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/address", addressRoutes);

app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));

// Error handling
app.use((req: Request, res: Response) => {
  res.status(404).render("pages/error", {
    title: "Not Found",
    message: "The page you are looking for does not exist."
  });
});

app.use(globalErrorHandler);

export default app;
