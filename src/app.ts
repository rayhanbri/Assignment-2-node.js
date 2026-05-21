import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/users/user.route";

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

app.use("/api/auth/signup", userRoute);

export default app;
