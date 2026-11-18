import express, {
	type Application,
	type Request,
	type Response,
} from "express";

import { authRoute } from "./modules/auth/auth.route";
import { profileRoute } from "./modules/profile/profile.route";
import { userRouter } from "./modules/user/user.route";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);

app.use("/api/v1/profiles", profileRoute);

app.use("/api/v1/auth", authRoute);

// Root Route
app.get("/", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		messages: "Server runnig successfully",
		data: {
			status: "ok",
			database: "connected",
			version: "1.0.0.0",
		},
	});
});

export default app;
