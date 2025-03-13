import moment from 'moment';
import { appdb } from "./appdb";
import { functions } from '../library/functions';

const functionsObj = new functions();

interface Flight {
  airline: string;
  flight_number: string;
  total_seats: number;
}

interface FlightRoute {
  flight_id: number;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  gst: number;
  total_price: number;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class flightModel extends appdb {
  constructor() {
    super();
    this.table = "flights";
    this.uniqueField = "id";
  }

  async addFlight(flightData: Flight): Promise<ServiceResponse> {
    try {
        this.table = "flights";
        const result = await this.insertRecord(flightData);

        return functionsObj.output(201, "Flight added successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error adding flight", null);
    }
}

async addFlightRoute(routeData: FlightRoute): Promise<ServiceResponse> {
    try {
        this.table = "flightroutes";
        const result = await this.insertRecord(routeData);

        return functionsObj.output(201, "Flight route added successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error adding flight route", null);
    }
}

async searchFlights(departure_city: string, arrival_city: string, date: string): Promise<ServiceResponse> {
    try {
        this.table = "flightroutes";
        this.where = `WHERE departure_city = '${departure_city}' 
                      AND arrival_city = '${arrival_city}' 
                      AND DATE(departure_time) = '${date}'`;

        const flights = await this.listRecords(
            "id AS flight_id, departure_city, arrival_city, departure_time, arrival_time, base_price, gst, total_price"
        );

        if (flights.length === 0) {
            return functionsObj.output(404, "No flights found for the given criteria", null);
        }

        return functionsObj.output(200, "Flights fetched successfully", flights);
    } catch (error) {
        console.log(error);
        return functionsObj.output(500, "Error searching flights", null);
    }
}

async filterFlights(priceRange?: [number, number], airlines?: string[], timeRange?: [string, string]): Promise<ServiceResponse> {
    try {
        this.table = "flights";
        let conditions: string[] = [];

        if (priceRange) {
            conditions.push(`total_price BETWEEN ${priceRange[0]} AND ${priceRange[1]}`);
        }
        if (airlines && airlines.length > 0) {
            conditions.push(`airline IN ('${airlines.join("', '")}')`);
        }
        if (timeRange) {
            conditions.push(`departure_time BETWEEN '${timeRange[0]}' AND '${timeRange[1]}'`);
        }

        this.where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const flights = await this.listRecords(
            "id AS flight_id, departure_city, arrival_city, departure_time, arrival_time, base_price, gst, total_price"
        );

        if (!flights.length) {
            return functionsObj.output(404, "No flights found based on the filter criteria", null);
        }

        return functionsObj.output(200, "Filtered flights fetched successfully", flights);
    } catch (error) {
        return functionsObj.output(500, "Error filtering flights", null);
    }
}

async getFlightById(id: number): Promise<ServiceResponse> {
    try {
        this.table = "flights";
        const flight = await this.selectRecord(id, "*");

        if (!flight) {
            return functionsObj.output(404, "Flight not found", null);
        }

        return functionsObj.output(200, "Flight details fetched successfully", flight);
    } catch (error) {
        return functionsObj.output(500, "Error fetching flight details", null);
    }
}

async getAvailableSeats(flight_id: number): Promise<ServiceResponse> {
    try {
        this.table = "seats";
        this.where = `WHERE flight_id = ${flight_id} AND is_booked = false`;

        const seats = await this.listRecords("id AS seat_id, seat_number");

        if (!seats.length) {
            return functionsObj.output(404, "No available seats for this flight", null);
        }

        return functionsObj.output(200, "Available seats fetched successfully", seats);
    } catch (error) {
        return functionsObj.output(500, "Error fetching available seats", null);
    }
}

async listAllFlights(): Promise<ServiceResponse> {
    try {
        this.table = "flights";
        const flights = await this.listRecords("id AS flight_id, airline, flight_number, total_seats");

        if (!flights.length) {
            return functionsObj.output(404, "No flights available", null);
        }

        return functionsObj.output(200, "All flights fetched successfully", flights);
    } catch (error) {
        return functionsObj.output(500, "Error fetching flights", null);
    }
}

async updateFlight(id: number, flightData: Partial<Flight>): Promise<ServiceResponse> {
    try {
        this.table = "flights";
        const result = await this.updateRecord(id, flightData);

        if (!result) {
            return functionsObj.output(400, "Flight not found or not updated", null);
        }

        return functionsObj.output(200, "Flight updated successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error updating flight", null);
    }
}

async deleteFlight(id: number): Promise<ServiceResponse> {
    try {
        this.table = "flights";
        const result = await this.deleteRecord(id);

        if (!result) {
            return functionsObj.output(404, "Flight not found or not deleted", null);
        }

        return functionsObj.output(200, "Flight deleted successfully", result);
    } catch (error) {
        return functionsObj.output(500, "Error deleting flight", null);
    }
  }
}
