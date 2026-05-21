import bcrypt from "bcryptjs";
import { pool } from "./../../db/index";

import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  const token = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: "1d",
  });

  delete user.password;

  return { token, user };
};

export const authService = {
  loginUserIntoDB,
};
