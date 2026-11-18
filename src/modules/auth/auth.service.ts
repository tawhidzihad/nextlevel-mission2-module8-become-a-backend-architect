import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../db";

const loginUserIntoDB = async (payload: {
	email: string;
	password: string;
}) => {
	// Check if the users exists => DONE
	// Check if the password matched => DONE
	// Check the user status => DONE
	// if passed all the tests, then generate jwt token => DONE

	const { email, password } = payload;

	const user = await pool.query(
		`
            SELECT * FROM users WHERE email=$1
        `,
		[email],
	);

	// console.log(user.rows[0]);
	// If user not exits then throw the error
	if (user.rowCount === 0) {
		throw new Error("Invalid credentials!");
	}

	const matchedPassword = await bcrypt.compare(
		password,
		user.rows[0].password,
	);
	// if password not matched then throw the error
	if (!matchedPassword) {
		throw new Error("Invalid credentials!");
	}

	// if the user blocked
	if (!user.rows[0].is_active) {
		throw new Error("User access denied");
	}

	// JWT User Detils
	const jwtPayload = {
		id: user.rows[0].id,
		name: user.rows[0].name,
		email: !user.rows[0].email,
	};

	// Return the access token
	const accessToken = jwt.sign(jwtPayload, config.jwt_key, {
		expiresIn: "1d",
	});

	delete user.rows[0].password;
	return { accessToken, user: user.rows[0] };
};

export const authService = {
	loginUserIntoDB,
};
