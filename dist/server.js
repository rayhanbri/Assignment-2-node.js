

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/users/user.route.ts
import { Router } from "express";

// src/modules/users/user.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  connection_string: process.env.Connection_String,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
            `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
       id SERIAL PRIMARY KEY,
       title VARCHAR(150) NOT NULL,
       description TEXT NOT NULL
       CHECK (LENGTH(description) >= 20),
       type VARCHAR(20) NOT NULL
       CHECK (type IN ('bug', 'feature_request')),
       status VARCHAR(20) DEFAULT 'open'
       CHECK (status IN ('open', 'in_progress', 'resolved')),
       reporter_id  INTEGER ,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/users/user.service.ts
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
     INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var userService = {
  createUserIntoDB
};

// src/modules/users/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User Registered successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser
};

// src/modules/users/user.route.ts
var router = Router();
router.post("/", userController.createUser);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
  const token = jwt.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return { token, user };
};
var authService = {
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/login", authController.loginUser);
var authRoute = router2;

// src/modules/issues/issues.route.ts
import { Router as Router3 } from "express";

// src/modules/issues/issues.service.ts
var getAllIssuesFromDB = async (sortBy = "newest") => {
  let orderByClause = "DESC";
  if (sortBy === "oldest") {
    orderByClause = "ASC";
  }
  const issuesResult = await pool.query(
    `
    SELECT * FROM issues
    ORDER BY created_at ${orderByClause}
    `
  );
  const issues = issuesResult.rows;
  if (issues.length === 0) {
    return [];
  }
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const reportersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds]
  );
  const reportersMap = new Map(
    reportersResult.rows.map((reporter) => [reporter.id, reporter])
  );
  const formattedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reportersMap.get(issue.reporter_id)?.id,
      name: reportersMap.get(issue.reporter_id)?.name,
      role: reportersMap.get(issue.reporter_id)?.role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return formattedIssues;
};
var createIssuesIntoDB = async (payload, User_id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
       INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) RETURNING *
      `,
    [title, description, type, User_id]
  );
  return result.rows[0];
};
var getSingleIssuesFromDB = async (id) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id]
  );
  const issue = issueResult.rows[0];
  const reporterResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
    [issue.reporter_id]
  );
  const reporter = reporterResult.rows[0];
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return formattedIssue;
};
var updateIssuesIntoDB = async (payload, id) => {
  const { title, description, type } = payload;
  const status = "in_progress";
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
    [title, description, type, status, id]
  );
  return result.rows[0];
};
var deleteIssuesFromDB = async (id) => {
  const result = await pool.query(
    `DELETE FROM issues WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
var issuesService = {
  getAllIssuesFromDB,
  createIssuesIntoDB,
  getSingleIssuesFromDB,
  deleteIssuesFromDB,
  updateIssuesIntoDB
};

// src/modules/issues/issues.controller.ts
var getAllIssues = async (req, res) => {
  try {
    const { sort = "newest" } = req.query;
    const result = await issuesService.getAllIssuesFromDB(sort);
    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var createIssues = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const Userdata = req.user;
    const User_id = Userdata.id;
    if (!User_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing"
      });
    }
    const result = await issuesService.createIssuesIntoDB(req.body, User_id);
    res.status(201).json({
      success: true,
      message: "Issue Created successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssues = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getSingleIssuesFromDB(id);
    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issues Not found!",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Issues retrived successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssues = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;
    const issueResult = await issuesService.getSingleIssuesFromDB(id);
    console.log(issueResult);
    if (!issueResult) {
      return res.status(404).json({
        success: false,
        message: "Issue not found!"
      });
    }
    if (userRole === "contributor") {
      if (issueResult.reporter.id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own issues"
        });
      }
      if (issueResult.status !== "open") {
        return res.status(403).json({
          success: false,
          message: "You can only update issues with open status"
        });
      }
    }
    const result = await issuesService.updateIssuesIntoDB(
      req.body,
      id
    );
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssues = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const { id } = req.params;
    const result = await issuesService.deleteIssuesFromDB(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  getAllIssues,
  createIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `
         SELECT * FROM users WHERE email=$1   
        `,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden!!,This role have no access!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.route.ts
var router3 = Router3();
router3.get("/", issuesController.getAllIssues);
router3.post(
  "/",
  auth_default(USER_ROLE.maintainer, USER_ROLE.contributor),
  issuesController.createIssues
);
router3.get("/:id", issuesController.getSingleIssues);
router3.put(
  "/:id",
  auth_default(USER_ROLE.maintainer, USER_ROLE.contributor),
  issuesController.updateIssues
);
router3.delete(
  "/:id",
  auth_default(USER_ROLE.maintainer),
  issuesController.deleteIssues
);
var issuesRoute = router3;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server",
    author: "Rayhanx"
  });
});
app.use("/api/auth/signup", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map