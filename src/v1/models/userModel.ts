import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { functions } from "../library/functions";
import { appdb } from "./appdb";

dotenv.config();

const functionsObj = new functions();

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

        return functionsObj.output(200, "User found successfully", rows[0]);
    } catch (error) {
        return functionsObj.output(500, "Error fetching user", null);
    }
  }

async registerUserService(userData: User): Promise<ServiceResponse> {
    try {
        const obj = new userModel();
        const existingUser = await obj.findUserByEmail(userData.email);

        if (existingUser.data) {
            return functionsObj.output(400, "User already registered, please login", null);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        const result = await this.insertRecord(userData);

        return functionsObj.output(201, "User registered successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error in registration", null);
    }
  }


  async loginUserService(email: string, password: string): Promise<ServiceResponse> {
    try {
        const obj = new userModel();
        const user = await obj.findUserByEmail(email);

        if (!user.data) {
            return functionsObj.output(401, "Invalid credentials", null);
        }

        const isValidPassword = await bcrypt.compare(password, user.data.password);
        if (!isValidPassword) {
            return functionsObj.output(401, "Invalid credentials", null);
        }

        const token = jwt.sign(
            { id: user.data.id },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        return functionsObj.output(200, "Login successful", {
            token,
            user_id: user.data.id,
            email: user.data.email
        });
    } catch (error) {
        return functionsObj.output(500, "Error in login", null);
    }
  }

async getProfileService(userId: number): Promise<ServiceResponse> {
    try {
        const rows = await this.selectRecord(userId, "id, name, age, gender, email, phone");

        if (!rows[0]) {
            return functionsObj.output(404, "User not found", null);
        }

        return functionsObj.output(200, "Profile fetched successfully", rows[0]);
    } catch (error) {
        return functionsObj.output(500, "Error fetching profile", null);
    }
}

async updateUser(id: number, userData: Partial<User>): Promise<ServiceResponse> {
    try {
        const result = await this.updateRecord(id, userData);

        if (!result) {
            return functionsObj.output(400, "User not found or not updated", null);
        }

        return functionsObj.output(200, "User updated successfully", result);
    } catch (error) {
        return functionsObj.output(500, "User not updated", null);
    }
}

async allUser(): Promise<ServiceResponse> {
    try {
        const result = await this.listRecords("id, name, age, gender, email, phone");

        if (!result) {
            return functionsObj.output(404, "Users not found", null);
        }

        return functionsObj.output(200, "All Users", result);
    } catch (error) {
        return functionsObj.output(500, "Users not fetched", null);
    }
}

async checkUserRole(userId: number): Promise<boolean> {
    try {
        this.where = `WHERE id = '${userId}' AND user_role = '1'`;

        const user: any[] = await this.listRecords("id, email, phone");

        return user.length > 0;
    } catch (error) {
        return false;
    }
  }
}
