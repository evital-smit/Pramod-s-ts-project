import express from "express";
import Joi from "joi";
import { functions } from "../library/functions";
import { userModel } from "../models/userModel";
import { auth } from "../library/auth";
import { validations } from "../library/validations";

const router = express.Router();
const userObj = new userModel();
const authObj = new auth();
const functionsObj = new functions();
const validationsObj = new validations();

router.post("/register", registerSchema, registerUser);
router.post("/login", loginSchema, loginUser);
router.get("/profile/:id",authObj.authenticateUser,getUserProfile);
router.get("/allUser", authObj.authenticateUser, authObj.isAdmin, getAllUser);
router.put("/update",authObj.authenticateUser,updateUserSchema,updateUserHandler);

export default router;

function sanitizeInput(req: any) {
  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim().replace(/'/g, "");
    }
  });
}

function registerSchema(req: any, res: any, next: any) {
  sanitizeInput(req); 

  let schema = Joi.object({
    name: Joi.string().trim().required().min(2).max(50),
    age: Joi.number().integer().min(1).max(120).required(),
    gender: Joi.string().trim().valid("Male", "Female", "Other").required(),
    email: Joi.string().trim().required().email(),
    password: Joi.string().trim()
      .required()
      .min(6)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")),
    phone: Joi.string().trim().pattern(new RegExp("^[0-9]{10}$")).required(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }

  next();
}

function loginSchema(req: any, res: any, next: any) {
  sanitizeInput(req); 

  let schema = Joi.object({
    email: Joi.string().trim().required().email(),
    password: Joi.string().trim().required(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }

  next();
}

function updateUserSchema(req: any, res: any, next: any) {
  sanitizeInput(req); 

  let schema = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    age: Joi.number().integer().min(1).max(120),
    gender: Joi.string().trim().valid("Male", "Female", "Other"),
    email: Joi.string().trim().email(),
    password: Joi.string().trim()
      .min(6)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")),
    phone: Joi.string().trim().pattern(new RegExp("^[0-9]{10}$")),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
}


async function registerUser(req: any, res: any) {
  let result: any = await userObj.registerUserService(req.body);

  if (result.error) {
    return res.send(functionsObj.output(0, result.message, null));
  }
  return res.send(functionsObj.output(1, result.message, result.data));
}

async function loginUser(req: any, res: any) {
  let { email, password } = req.body;
  let result: any = await userObj.loginUserService(email, password);

  if (result.error) {
    return res.send(functionsObj.output(0, result.message, null));
  }
  return res.send(functionsObj.output(1, result.message, result.data));
}

async function getUserProfile(req: any, res: any) {
  let userId = req.user.id;
  let result: any = await userObj.getProfileService(userId);

  if (result.error) {
    return res.send(functionsObj.output(0, result.message, null));
  }
  return res.send(functionsObj.output(1, result.message, result.data));
}

async function updateUserHandler(req: any, res: any) {
  let userId = req.user.id;
  let userData = req.body;

  let result: any = await userObj.updateUser(userId, userData);

  if (result.error) {
    return res.send(functionsObj.output(0, result.message, null));
  }
  return res.send(functionsObj.output(1, result.message, result.data));
}

async function getAllUser(req: any, res: any) {
  let result: any = await userObj.allUser();

  if (result.error) {
    return res.send(functionsObj.output(0, result.message, null));
  }
  return res.send(functionsObj.output(1, result.message, result.data));
}

