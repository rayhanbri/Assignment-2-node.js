import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.post(
  "/",
  auth(USER_ROLE.maintainer, USER_ROLE.contributor),
  issuesController.createIssues,
);
router.get("/:id", issuesController.getSingleIssues);
router.delete(
  "/:id",
  auth(USER_ROLE.maintainer),
  issuesController.deleteIssues,
);

export const issuesRoute = router;
