import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort = "newest" } = req.query;

    const result = await issuesService.getAllIssuesFromDB(sort as string);

    // console.log(req.query);

    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const createIssues = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const Userdata = req.user;
    const User_id = Userdata.id;

    if (!User_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing",
      });
    }
    // console.log(typeof User_id);
    const result = await issuesService.createIssuesIntoDB(req.body, User_id);
    res.status(201).json({
      success: true,
      message: "Issue Created successful",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getSingleIssues = async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id);

  try {
    const result = await issuesService.getSingleIssuesFromDB(id as string);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issues Not found!",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Issues retrived successfully!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssues = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Get issue details
    const issueResult = await issuesService.getSingleIssuesFromDB(id as string);

    // console.log(issueResult);

    if (!issueResult) {
      return res.status(404).json({
        success: false,
        message: "Issue not found!",
      });
    }

    // Access control: Maintainer can update any issue, Contributor only their own open issues
    if (userRole === "contributor") {
      if (issueResult.reporter.id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own issues",
        });
      }
      if (issueResult.status !== "open") {
        return res.status(403).json({
          success: false,
          message: "You can only update issues with open status",
        });
      }
    }

    // Update issue
    const result = await issuesService.updateIssuesIntoDB(
      req.body,
      id as string,
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const deleteIssues = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const { id } = req.params;
    // console.log(id);
    const result = await issuesService.deleteIssuesFromDB(id as string);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issuesController = {
  getAllIssues,
  createIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues,
};
