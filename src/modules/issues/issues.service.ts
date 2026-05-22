import { pool } from "../../db";
import type { Iissues } from "./issues.interface";

const createIssuesIntoDB = async (
  payload: Iissues,
  User_id: string | number,
) => {
  const { title, description, type } = payload;
  // console.log(payload);

  const result = await pool.query(
    `
       INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) RETURNING *
      `,
    [title, description, type, User_id],
  );
  // console.log(result);
  return result.rows[0];
};

export const issuesService = {
  createIssuesIntoDB,
};
