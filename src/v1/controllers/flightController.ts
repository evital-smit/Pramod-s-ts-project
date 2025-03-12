import express, { Request, Response } from "express";
import Joi from "joi";
import { auth } from "../library/auth";
import { validations } from "../library/validations";
import { validateRequest } from "../library/validateRequest";
import { flightModel } from "../models/flightModel";
import { flightRouteModel } from "../models/flightRoutesModel";
import { responseUtil } from "../library/responseUtil";

const router = express.Router();
const authObj = new auth();
const flightService = new flightModel();
const flightRouteService = new flightRouteModel();
const responseObj = new responseUtil();
const validationsObj = new validations();

router.post("/", authObj.authenticateUser, authObj.isAdmin, flightSchema, addFlight);
router.get("/search", flightSearchSchema, searchFlights);
router.get("/:flight_id", flightIdParamSchema, getFlightById);
router.get("/:flight_id/seats", flightIdParamSchema, getAvailableSeats);
router.get("/", listAllFlights);
router.put("/:flight_id", authObj.authenticateUser, authObj.isAdmin, updateFlightSchema, updateFlight);
router.delete("/:flight_id", authObj.authenticateUser, authObj.isAdmin, flightIdParamSchema, deleteFlight);
  
router.post("/routes", authObj.authenticateUser, authObj.isAdmin,flightRouteSchema, addFlightRoute);
router.get("/routes/:id", flightIdParamSchema, getRouteById);
router.put("/routes/:id", authObj.authenticateUser, authObj.isAdmin, updateFlightRouteSchema, updateFlightRoute);
router.delete("/routes/:id", authObj.authenticateUser, authObj.isAdmin, flightIdParamSchema, deleteFlightRoute);
  
export default router;

export async function flightSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    airline: Joi.string().required().min(2).max(50),
    flight_id: Joi.string().required().min(2).max(10),
    total_seats: Joi.number().integer().positive().required(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function flightSearchSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    departure_city: Joi.string().required().min(2).max(50),
    arrival_city: Joi.string().required().min(2).max(50),
    date: Joi.date().iso().required(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function flightIdParamSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    flight_id: Joi.string().required().min(2).max(10),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function updateFlightSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    airline: Joi.string().min(2).max(50),
    total_seats: Joi.number().integer().positive(),
  }).min(1);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function flightRouteSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    flight_id: Joi.string().required().min(2).max(10),
    departure_city: Joi.string().required().min(2).max(50),
    arrival_city: Joi.string().required().min(2).max(50),
    departure_time: Joi.string()
      .required()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("departure_time must be in HH:MM format"),
    arrival_time: Joi.string()
      .required()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("arrival_time must be in HH:MM format"),
    base_price: Joi.number().positive().required(),
    gst: Joi.number().min(0).required(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function flightRouteIdParamSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    id: Joi.number().integer().positive().required(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function updateFlightRouteSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    departure_city: Joi.string().min(2).max(50),
    arrival_city: Joi.string().min(2).max(50),
    departure_time: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("departure_time must be in HH:MM format"),
    arrival_time: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .message("arrival_time must be in HH:MM format"),
    base_price: Joi.number().positive(),
    gst: Joi.number().min(0),
  }).min(1);

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function addFlight(req: Request, res: Response){
    try {
      const result = await flightService.addFlight(req.body);
      if (result.error) {
        responseObj.errorResponse(res, 400, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function searchFlights(req: Request, res: Response){
    try {
      const { departure_city, arrival_city, date } = req.body;
      const result = await flightService.searchFlights(departure_city, arrival_city, date);
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function getFlightById(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.getFlightById(parseInt(flight_id));
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function getAvailableSeats(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.getAvailableSeats(parseInt(flight_id));
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function listAllFlights(req: Request, res: Response){
    try {
      const result = await flightService.listAllFlights();
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function updateFlight(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.updateFlight(parseInt(flight_id), req.body);
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function deleteFlight(req: Request, res: Response){
    try {
      const { flight_id } = req.params;
      const result = await flightService.deleteFlight(parseInt(flight_id));
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  // flightRoute Controllers
  
  export async function addFlightRoute(req: Request, res: Response){
    try {
      const result = await flightRouteService.addFlightRoute(req.body);
      if (result.error) {
        responseObj.errorResponse(res, 400, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function updateFlightRoute(req: Request, res: Response){
    try {
      const { id } = req.params;
      const result = await flightRouteService.updateFlightRoute(parseInt(id), req.body);
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function deleteFlightRoute(req: Request, res: Response){
    try {
      const { id } = req.params;
      const result = await flightRouteService.deleteFlightRoute(parseInt(id));
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  export async function getRouteById(req: Request, res: Response){
    try {
      const { id } = req.params;
      const result = await flightRouteService.getRouteById(parseInt(id));
      if (result.error) {
        responseObj.errorResponse(res, 404, result.message);
        return;
      }
      responseObj.SuccessResponse(res, result.message, result.data);
    } catch (error) {
      responseObj.errorResponse(res, 500, "Server Error");
    }
  };
  
  