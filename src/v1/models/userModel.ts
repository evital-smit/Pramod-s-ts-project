import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { responseUtil } from "../library/responseUtil";
import { appdb } from "./appdb";

dotenv.config();

const responseObj = new responseUtil();

interface User {
  name: string;
  age: number;
  gender: string;
  email: string;
  password: string;
  phone: string;
  user_role: number;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class userModel extends appdb {
  constructor() {
    super();
    this.table = "users";
    this.uniqueField = "id";
  }

  async findUserByEmail(email: string): Promise<ServiceResponse> {
    try {
      this.where = `WHERE email = '${email}'`;
      const rows = await this.listRecords("*");
      return responseObj.returnResponse(false, "User found successfully", rows[0]);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching user", null);
    }
  }

  async registerUserService(userData: User): Promise<ServiceResponse> {
    try {
      const obj = new userModel();
      const existingUser = await obj.findUserByEmail(userData.email);

      if (existingUser.data) {
        return responseObj.returnResponse(true, "User already registered, please login", null);
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;

      const result = await this.insertRecord(userData);
      return responseObj.returnResponse(false, "User registered successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error in registration", null);
    }
  }

  async loginUserService(email: string, password: string): Promise<ServiceResponse> {
    try {
      const obj = new userModel();
      const user = await obj.findUserByEmail(email);

      if (!user.data) {
        return responseObj.returnResponse(true, "Invalid credentials", null);
      }

      const isValidPassword = await bcrypt.compare(password, user.data.password);
      if (!isValidPassword) {
        return responseObj.returnResponse(true, "Invalid credentials", null);
      }

      const token = jwt.sign(
        { id: user.data.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return responseObj.returnResponse(false, "Login successful", {
        token,
        user_id: user.data.id,
        email: user.data.email
      });
    } catch (error) {
      return responseObj.returnResponse(true, "Error in login", null);
    }
  }

  async getProfileService(userId: number): Promise<ServiceResponse> {
    try {
      const rows = await this.selectRecord(userId, "id, name, age, gender, email, phone");

      if (!rows[0]) {
        return responseObj.returnResponse(true, "User not found", null);
      }
      return responseObj.returnResponse(false, "Profile fetched successfully", rows[0]);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching profile", null);
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<ServiceResponse> {
    try {
      const result = await this.updateRecord(id, userData);
      if (!result) {
        return responseObj.returnResponse(true, "User not found or not updated", null);
      }
      return responseObj.returnResponse(false, "User updated successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "User not updated", null);
    }
  }

  async allUser(): Promise<ServiceResponse> {
    try {
      const result = await this.listRecords("id, name, age, gender, email, phone");
      if (!result) {
        return responseObj.returnResponse(true, "Users not found", null);
      }
      return responseObj.returnResponse(false, "All Users", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Users not fetched", null);
    }
  }

  async checkUserRole(userId: number): Promise<any> {
    try {
      this.where = `WHERE id = '${userId}' AND user_role = '1'`;

      const user: any[] = await this.listRecords("id ,email,phone");
    
      if (user.length > 0) {
        return true;
      }
      return false
    } catch (error) {
  
    }
  }
}
