import { functions } from "../library/functions";
import { appdb } from "./appdb";


const functionsObj = new functions();

interface FlightRoute {
  flight_id: number;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  gst: number;
  total_price?: number; 
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class flightRouteModel extends appdb {
  constructor() {
    super();
    this.table = "flightroutes";
    this.uniqueField = "id";
  }

  async addFlightRoute(routeData: FlightRoute): Promise<ServiceResponse> {
    try {
        this.table = "flightroutes";
        // Automatically calculate total_price
        routeData.total_price = routeData.base_price + routeData.gst;

        const result = await this.insertRecord(routeData);
        return functionsObj.output(201, "Flight route added successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error adding flight route", null);
    }
}

async updateFlightRoute(id: number, routeData: Partial<FlightRoute>): Promise<ServiceResponse> {
    try {
        this.table = "flightroutes";

        // If base_price or gst is updated, recalculate total_price
        if (routeData.base_price !== undefined || routeData.gst !== undefined) {
            const existingRoute = await this.selectRecord(id, "base_price, gst");

            if (!existingRoute) {
                return functionsObj.output(404, "Flight route not found", null);
            }

            routeData.total_price =
                (routeData.base_price ?? existingRoute.base_price) +
                (routeData.gst ?? existingRoute.gst);
        }

        const result = await this.updateRecord(id, routeData);
        if (!result) {
            return functionsObj.output(400, "Flight route not updated or not found", null);
        }

        return functionsObj.output(200, "Flight route updated successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error updating flight route", null);
    }
}

async deleteFlightRoute(id: number): Promise<ServiceResponse> {
    try {
        this.table = "flightroutes";
        const result = await this.deleteRecord(id);

        if (!result) {
            return functionsObj.output(404, "Flight route not found or not deleted", null);
        }

        return functionsObj.output(200, "Flight route deleted successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error deleting flight route", null);
    }
}

async getRouteById(id: number): Promise<ServiceResponse> {
    try {
        this.table = "flightroutes";
        const route = await this.selectRecord(id, "*");

        if (!route) {
            return functionsObj.output(404, "Flight route not found", null);
        }

        return functionsObj.output(200, "Flight route details fetched successfully", route);
    } catch (error) {
        return functionsObj.output(500, "Error fetching flight route details", null);
    }
  }
}
