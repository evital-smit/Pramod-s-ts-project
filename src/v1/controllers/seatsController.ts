import express, { Request, Response } from "express"; 
import Joi from "joi";
import { validations } from "../library/validations";
import { functions } from "../library/functions";
import { auth } from "../library/auth";
import { seatModel } from "../models/seatsModel";


const router = express.Router();
const validationsObj = new validations();
const functionsObj = new functions();
const authObj = new auth();
const seatModelInstance = new seatModel();

router.get("/available/:flight_id", authObj.authenticateUser, getAvailableSeats);
router.post("/book", authObj.authenticateUser, seatBookingSchema, bookSeats);
router.put("/cancel", authObj.authenticateUser, cancelSeats);
router.post("/add", authObj.authenticateUser, addSeat);
router.put("/update/:seat_id", authObj.authenticateUser, seatSchema, updateSeat);

export default router;

export function seatSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    flight_id: Joi.number().integer().positive().required().messages({
      "number.base": "Flight ID must be a number",
      "number.integer": "Flight ID must be an integer",
      "number.positive": "Flight ID must be a positive number",
      "any.required": "Flight ID is required",
    }),
    class_id: Joi.number().integer().positive().required().messages({
      "number.base": "Class ID must be a number",
      "number.integer": "Class ID must be an integer",
      "number.positive": "Class ID must be a positive number",
      "any.required": "Class ID is required",
    }),
    seat_number: Joi.string().trim().required().messages({
      "string.base": "Seat number must be a string",
      "string.empty": "Seat number cannot be empty",
      "any.required": "Seat number is required",
    }),
    is_booked: Joi.boolean().required().messages({
      "boolean.base": "Is Booked must be true or false",
      "any.required": "Is Booked status is required",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

// Validation middleware for seat class
export function seatClassSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    class_name: Joi.string().trim().min(2).max(50).required().messages({
      "string.base": "Class Name must be a string",
      "string.empty": "Class Name cannot be empty",
      "string.min": "Class Name must be at least 2 characters",
      "string.max": "Class Name cannot exceed 50 characters",
      "any.required": "Class Name is required",
    }),
    price_multiplier: Joi.number().positive().required().messages({
      "number.base": "Price Multiplier must be a number",
      "number.positive": "Price Multiplier must be a positive number",
      "any.required": "Price Multiplier is required",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

// Validation middleware for seat booking
export function seatBookingSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    flight_id: Joi.number().integer().required().messages({
      "number.base": "Flight ID must be a number",
      "number.integer": "Flight ID must be an integer",
      "any.required": "Flight ID is required",
    }),
    booking_id: Joi.number().integer().required().messages({
      "number.base": "Booking ID must be a number",
      "number.integer": "Booking ID must be an integer",
      "any.required": "Booking ID is required",
    }),
    seat_numbers: Joi.array().items(Joi.string().trim()).min(1).required().messages({
      "array.base": "Seat numbers must be an array",
      "array.min": "At least one seat number must be provided",
      "any.required": "Seat numbers are required",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function getAvailableSeats(req: Request, res: Response) {
  let { flight_id } = req.params;
  let result = await seatModelInstance.getAvailableSeatsByFlight(Number(flight_id));

  if (result.error) {
    res.send(functionsObj.output(0, result.message, null));
    return;
  }
  res.send(functionsObj.output(1, result.message, result.data));
  return;
}

// Controller to book seats
export async function bookSeats(req: Request, res: Response) {
  let { flight_id, booking_id, seat_numbers } = req.body;
  let result = await seatModelInstance.bookSelectedSeats(flight_id, booking_id, seat_numbers);

  if (result.error) {
    res.send(functionsObj.output(0, result.message, null));
    return;
  }
  res.send(functionsObj.output(1, result.message, result.data));
  return;
}

// Controller to cancel booked seats
export async function cancelSeats(req: Request, res: Response) {
  let { booking_id, seat_numbers } = req.body;
  let result = await seatModelInstance.cancelBookedSeats(booking_id, seat_numbers);

  if (result.error) {
  res.send(functionsObj.output(0, result.message, null));
  return;
  }
  res.send(functionsObj.output(1, result.message, result.data));
  return;
}

// Controller to add a new seat
export async function addSeat(req: Request, res: Response) {
  let { flight_id, booking_id, seat_number} = req.body; 
  let result = await seatModelInstance.bookNewSeats(Number(flight_id), Number(booking_id), [seat_number]);
  if (result.error) {
    res.send(functionsObj.output(0, result.message, null));
    return;
  }
  res.send(functionsObj.output(1, result.message, result.data));
  return;
}

// Controller to update seat details
export async function updateSeat(req: Request, res: Response) {
  let { seat_id } = req.params;
  let result = await seatModelInstance.updateSeat(Number(seat_id), req.body);

  if (result.error) {
    res.send(functionsObj.output(0, result.message, null));
    return;
  }
  res.send(functionsObj.output(1, result.message, result.data));
  return;
}

