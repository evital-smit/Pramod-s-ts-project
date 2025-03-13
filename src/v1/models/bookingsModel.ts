import { functions } from "../library/functions";
import { appdb } from "./appdb";

const functionsObj = new functions();

interface Booking {
  booking_id?: number;
  user_id: number;
  flight_id: number;
  total_price: number;
  booking_status: string; // "CONFIRMED", "CANCELLED", "PENDING"
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class bookingModel extends appdb {
  constructor() {
    super();
    this.table = "Bookings";
    this.uniqueField = "booking_id";
  }


async getBookingById(booking_id: number): Promise<ServiceResponse> {
  try {
      this.table = "Bookings";
      const booking = await this.selectRecord(booking_id, "*");

      if (!booking) {
          return functionsObj.output(404, "Booking not found", null);
      }
      return functionsObj.output(200, "Booking details fetched successfully", booking);
  } catch (error) {
      return functionsObj.output(500, "Error fetching booking details", null);
  }
}

async getAvailableSeats(flight_id: number, seat_numbers: string[]): Promise<ServiceResponse> {
  try {
      this.table = "Seats";
      const query = `SELECT seat_id FROM ${this.table} WHERE flight_id = $1 AND seat_number = ANY($2) AND status = 'AVAILABLE'`;
      
      const result = await this.executeQuery(query, [flight_id, seat_numbers]); // Now this works!

      if (!result.length) {
          return functionsObj.output(404, "No available seats found", null);
      }

      return functionsObj.output(200, "Available seats fetched successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error fetching available seats", null);
  }
}


async bookNewSeats(booking_id: number, flight_id: number, seat_numbers: string[]): Promise<ServiceResponse> {
  try {
      this.table = "Seats";
      const query = `UPDATE ${this.table} SET status = 'BOOKED', booking_id = $1 WHERE flight_id = $2 AND seat_number = ANY($3) RETURNING seat_id`;
      const result = await this.executeQuery(query, [booking_id, flight_id, seat_numbers]);

      if (!result.length) {
          return functionsObj.output(400, "No seats booked. They might already be taken", null);
      }

      return functionsObj.output(200, "Seats booked successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error booking seats", null);
  }
}


async cancelBooking(booking_id: number): Promise<ServiceResponse> {
  try {
      this.table = "Seats";
      const seatQuery = `UPDATE ${this.table} SET status = 'AVAILABLE', booking_id = NULL WHERE booking_id = $1 RETURNING seat_id`;
      const seatResult = await this.executeQuery(seatQuery, [booking_id]);

      if (!seatResult.length) {
          return functionsObj.output(404, "No seats found for this booking", null);
      }

      this.table = "Bookings";
      const bookingUpdate = await this.updateRecord(booking_id, { booking_status: "CANCELLED" });

      if (!bookingUpdate) {
          return functionsObj.output(400, "Booking could not be cancelled", null);
      }

      return functionsObj.output(200, "Booking cancelled successfully", seatResult);
  } catch (error) {
      return functionsObj.output(500, "Error cancelling booking", null);
  }
}


async getUserBookings(user_id: number): Promise<ServiceResponse> {
  try {
      this.table = "Bookings";
      this.where = `WHERE user_id = ${user_id} ORDER BY created_at DESC`;
      const bookings = await this.allRecords("*");

      if (!bookings.length) {
          return functionsObj.output(404, "No bookings found for this user", null);
      }

      return functionsObj.output(200, "User bookings fetched successfully", bookings);
  } catch (error) {
      return functionsObj.output(500, "Error fetching user bookings", null);
  }
}
}