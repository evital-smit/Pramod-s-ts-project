import express, { Request, Response } from "express";
import Joi from "joi";
import { validations } from "../library/validations";
import { auth } from "../library/auth";
import { functions } from "../library/functions";
import { paymentModel } from "../models/paymentModel";


const router = express.Router();
const paymentService = new paymentModel();
const functionsObj = new functions();
const authObj = new auth();
const validationsObj = new validations();

router.post("/", authObj.authenticateUser, addPaymentValidation, addPayment);
router.put("/:id", authObj.authenticateUser, updatePaymentValidation, updatePaymentStatus);
router.delete("/:id", authObj.authenticateUser, deletePaymentValidation, deletePayment);
router.get("/:id", authObj.authenticateUser, getPaymentById);
router.get("/booking/:booking_id", authObj.authenticateUser, getPaymentsByBooking);

export default router;

function sanitizeRequestBody(req: any) {
  for (const key in req.body) {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim().replace(/'/g, "");
    }
  }
}

function addPaymentValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    booking_id: Joi.number().integer().required().messages({
      "any.required": "Booking ID is required.",
      "number.base": "Booking ID must be a number.",
    }),
    user_id: Joi.number().integer().required().messages({
      "any.required": "User ID is required.",
      "number.base": "User ID must be a number.",
    }),
    amount: Joi.number().precision(2).required().messages({
      "any.required": "Amount is required.",
      "number.base": "Amount must be a number.",
    }),
    payment_status: Joi.string().trim().required().messages({
      "any.required": "Payment status is required.",
    }),
    payment_date: Joi.string().trim().required().messages({
      "any.required": "Payment date is required.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function updatePaymentValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    payment_status: Joi.string().trim().required().messages({
      "any.required": "Payment status is required.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function deletePaymentValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Payment ID is required.",
      "number.base": "Payment ID must be a number.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

async function addPayment(req: Request, res: Response) {
  try {
    const result = await paymentService.addPayment(req.body);
    if (result.error) {
      res.send(functionsObj.output(0, result.message, null));
      return;
    }
    res.send(functionsObj.output(1, result.message, result.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
  }
}

async function updatePaymentStatus(req: Request, res: Response) {
  try {
    const result = await paymentService.updatePaymentStatus(Number(req.params.id), req.body.payment_status);
    if (result.error) {
      res.send(functionsObj.output(0, result.message, null));
      return;
    }
    res.send(functionsObj.output(1, result.message, result.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
  }
}

async function deletePayment(req: Request, res: Response) {
  try {
    const result = await paymentService.deletePayment(Number(req.params.id));
    if (result.error) {
      res.send(functionsObj.output(0, result.message, null));
      return;
    }
    res.send(functionsObj.output(1, result.message, result.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
  }
}

async function getPaymentById(req: Request, res: Response) {
  try {
    const result = await paymentService.getPaymentById(Number(req.params.id));
    if (result.error) {
      res.send(functionsObj.output(0, result.message, null));
      return;
    }
    res.send(functionsObj.output(1, result.message, result.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
  }
}

async function getPaymentsByBooking(req: Request, res: Response) {
  try {
    const result = await paymentService.getPaymentsByBooking(Number(req.params.booking_id));
    if (result.error) {
      res.send(functionsObj.output(0, result.message, null));
      return;
    }
    res.send(functionsObj.output(1, result.message, result.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
  }
}
