import express, {
  type Application,
  type Request,
  type Response,
} from "express";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  //res.send("Hello World!");
  res.status(200).json({
    message: "Express Server",
    author: "Rayhanx",
  });
});

// app.use("/api/auth/singup", userRoute);

export default app;
