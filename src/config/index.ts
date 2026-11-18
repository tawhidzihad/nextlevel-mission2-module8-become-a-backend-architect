import dotenv from "dotenv";
import path from "path";
dotenv.config({
	path: path.join(process.cwd(), ".env"),
});

const config = {
	port: process.env.PORT,
	connection_string: process.env.DATABASE_URI as string,
	jwt_key: process.env.JWT as string,
};

export default config;
