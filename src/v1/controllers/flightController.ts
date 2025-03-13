import express, { Request, Response } from "express";
import Joi from "joi";
import { auth } from "../library/auth";
import { validations } from "../library/validations";
import { flightModel } from "../models/flightModel";
import { flightRouteModel } from "../models/flightRoutesModel";
import { functions } from "../library/functions";

const router = express.Router();
const authObj = new auth();
const flightService = new flightModel();
const flightRouteService = new flightRouteModel();
const functionsObj = new functions();
const validationsObj = new validations();

router.post("/", authObj.authenticateUser, authObj.isAdmin, flightSchema, addFlight);
router.get("/search", flightSearchSchema, searchFlights);
router.get("/:flight_id", getFlightById);
router.get("/:flight_id/seats", flightIdParamSchema, getAvailableSeats);
router.get("/", listAllFlights);
router.put("/:flight_id", authObj.authenticateUser, authObj.isAdmin, updateFlightSchema, updateFlight);
router.delete("/:flight_id", authObj.authenticateUser, authObj.isAdmin, flightIdParamSchema, deleteFlight);
  
router.post("/routes", authObj.authenticateUser, authObj.isAdmin,flightRouteSchema, addFlightRoute);
router.get("/routes/:id", flightIdParamSchema, getRouteById);
router.put("/routes/:id", authObj.authenticateUser, authObj.isAdmin, updateFlightRouteSchema, updateFlightRoute);
router.delete("/routes/:id", authObj.authenticateUser, authObj.isAdmin, flightIdParamSchema, deleteFlightRoute);
  
export default router;

function sanitizeRequestBody(req: any) {
  for (let key in req.body) {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim().replace(/'/g, "");
    } else if (Array.isArray(req.body[key])) {
      req.body[key] = req.body[key].map((item) =>
        typeof item === "string" ? item.trim().replace(/'/g, "") : item
      );
    }
  }
}

function flightSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    airline: Joi.string().trim().required().min(2).max(50),
    flight_id: Joi.string().trim().required().min(2).max(10),
    total_seats: Joi.number().integer().positive().required(),
  });

  sanitizeRequestBody(req);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function flightSearchSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    departure_city: Joi.string().trim().required().min(2).max(50),
    arrival_city: Joi.string().trim().required().min(2).max(50),
    date: Joi.date().iso().required(),
  });

  sanitizeRequestBody(req);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function flightIdParamSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    flight_id: Joi.string().trim().required().min(1).max(10),
  });

  sanitizeRequestBody(req);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function updateFlightSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    airline: Joi.string().trim().min(2).max(50),
    total_seats: Joi.number().integer().positive(),
  }).min(1);

  sanitizeRequestBody(req);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function flightRouteSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    flight_id: Joi.string().trim().required().min(2).max(10),
    departure_city: Joi.string().trim().required().min(2).max(50),
    arrival_city: Joi.string().trim().required().min(2).max(50),
    departure_time: Joi.string()
      .trim()
      .required()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("departure_time must be in HH:MM format"),
    arrival_time: Joi.string()
      .trim()
      .required()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("arrival_time must be in HH:MM format"),
    base_price: Joi.number().positive().required(),
    gst: Joi.number().min(0).required(),
  });

  sanitizeRequestBody(req);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function flightRouteIdParamSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    id: Joi.number().integer().positive().required(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function updateFlightRouteSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    departure_city: Joi.string().trim().min(2).max(50),
    arrival_city: Joi.string().trim().min(2).max(50),
    departure_time: Joi.string()
      .trim()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("departure_time must be in HH:MM format"),
    arrival_time: Joi.string()
      .trim()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("arrival_time must be in HH:MM format"),
    base_price: Joi.number().positive(),
    gst: Joi.number().min(0),
  }).min(1);

  sanitizeRequestBody(req);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function addFlight(req: Request, res: Response){
    try {
      const result = await flightService.addFlight(req.body);
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
       res.send(functionsObj.output(1, result.message, result.data));
       return;
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function searchFlights(req: Request, res: Response){
    try {
      const { departure_city, arrival_city, date } = req.body;
      const result = await flightService.searchFlights(departure_city, arrival_city, date);
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function getFlightById(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.getFlightById(parseInt(flight_id));
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function getAvailableSeats(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.getAvailableSeats(parseInt(flight_id));
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function listAllFlights(req: Request, res: Response){
    try {
      const result = await flightService.listAllFlights();
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function updateFlight(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.updateFlight(parseInt(flight_id), req.body);
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function deleteFlight(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.deleteFlight(parseInt(flight_id));
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  // flightRoute Controllers
  export async function addFlightRoute(req: Request, res: Response){
    try {
      const result = await flightRouteService.addFlightRoute(req.body);
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function updateFlightRoute(req: Request, res: Response){
    try {
      const { id } = req.params;
      const result = await flightRouteService.updateFlightRoute(parseInt(id), req.body);
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function deleteFlightRoute(req: Request, res: Response){
    try {
      const { id } = req.params;
      const result = await flightRouteService.deleteFlightRoute(parseInt(id));
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  export async function getRouteById(req: Request, res: Response){
    try {
      const { id } = req.params;
      const result = await flightRouteService.getRouteById(parseInt(id));
      if (result.error) {
        res.send(functionsObj.output(0, result.message, null));
        return;
      }
      res.send(functionsObj.output(1, result.message, result.data));
    } catch (error) {
      res.status(500).send(functionsObj.output(0, "Internal Server Error", null));
    }
  };
  
  