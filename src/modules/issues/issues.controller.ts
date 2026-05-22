import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

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
  createIssues,
  getSingleIssues,
  deleteIssues,
};
