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

const getSingleIssuesFromDB = async (id: string) => {
  // get issue
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id],
  );
  const issue = issueResult.rows[0];

  // get reporter
  const reporterResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
    [issue.reporter_id],
  );

  const reporter = reporterResult.rows[0];

  // final formatted response
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role,
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
  // console.log(formattedIssue);
  return formattedIssue;
};

const updateIssuesIntoDB = async (payload: Iissues, id: string) => {
  const { title, description, type } = payload;
  const status: string = "in_progress";

  const result = await pool.query(
    `
    UPDATE issues
    SET 
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status),
    updated_at=CURRENT_TIMESTAMP
    WHERE id=$5 RETURNING *
    `,
    [title, description, type, status, id],
  );

  return result.rows[0];
};

const deleteIssuesFromDB = async (id: string) => {
  const result = await pool.query(
    `DELETE FROM issues WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};
export const issuesService = {
  createIssuesIntoDB,
  getSingleIssuesFromDB,
  deleteIssuesFromDB,
  updateIssuesIntoDB,
};
