import type { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
	try {
		const result = await userService.createUserIntoDB(req.body);

		res.status(201).json({
			success: true,
			messages: "user created successfully!",
			data: result.rows[0],
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			messages: error?.message,
			error: error,
		});
	}
};

const getAllUsers = async (req: Request, res: Response) => {
	try {
		const result = await userService.getAllUsersFromDB();

		res.status(200).json({
			success: true,
			messages: "users retrived successfully!",
			data: result.rows,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			messages: error?.message,
			error: error,
		});
	}
};

const getSingleUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await userService.getSingleUserFromDB(id as string);

		if (result.rowCount === 0) {
			res.status(404).json({
				success: false,
				messages: "user not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			messages: "user retrived successfully!",
			data: result.rows[0],
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			messages: error?.message,
			error: error,
		});
	}
};

const updateUser = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		const result = await userService.updateUserFromDB(
			req.body,
			id as string,
		);

		if (result.rowCount === 0) {
			res.status(404).json({
				success: false,
				messages: "user not found",
			});

			return;
		}

		res.status(200).json({
			success: true,
			messages: "user updated successfully!",
			data: result.rows[0],
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			messages: error?.message,
			error: error,
		});
	}
};

const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await userService.deleteUserFromDB(id as string);

		if (result.rowCount === 0) {
			res.status(404).json({
				success: false,
				messages: "user not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			messages: "user deleted successfully!",
			// data: result.rows[0],
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			messages: error?.message,
			error: error,
		});
	}
};

export const userController = {
	createUser,
	getAllUsers,
	getSingleUser,
	updateUser,
	deleteUser,
};
