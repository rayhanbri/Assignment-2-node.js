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

export const issuesController = {
  createIssues,
};
