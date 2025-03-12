import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appdb } from "../models/appdb";
import { userModel } from "../models/userModel";
const userObj = new userModel();

interface AuthRequest extends Request {
  user?: any;
}

export class auth extends appdb {
  async authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecrettoken");
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token", error });
    }
  }

  async isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.user;
      const admin = await userObj.checkUserRole(id);
      console.log("🚀 ~ auth ~ isAdmin ~ admin:", admin)

      if (!admin) {
        res.status(403).json({ message: "Admin access required" });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Not authorized", error });
    }
  }
}
