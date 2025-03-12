import { responseUtil } from "../library/responseUtil";
import { appdb } from "./appdb";

const responseObj = new responseUtil();

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

  // Fetch booking by ID
  async getBookingById(booking_id: number): Promise<ServiceResponse> {
    try {
      this.table = "Bookings";
      const booking = await this.selectRecord(booking_id, "*");

      if (!booking) {
        return responseObj.returnResponse(true, "Booking not found", null);
      }
      return responseObj.returnResponse(false, "Booking details fetched successfully", booking);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching booking details", null);
    }
  }

  // Fetch available seats for a flight
  async getAvailableSeats(flight_id: number, seat_numbers: string[]): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      const query = `SELECT seat_id FROM ${this.table} WHERE flight_id = $1 AND seat_number = ANY($2) AND status = 'AVAILABLE'`;
      const result = await this.executeQuery(query);
      return responseObj.returnResponse(false, "Available seats fetched successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching available seats", null);
    }
  }

  // Book new seats
  async bookNewSeats(booking_id: number, flight_id: number, seat_numbers: string[]): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      const query = `UPDATE ${this.table} SET status = 'BOOKED', booking_id = $1 WHERE flight_id = $2 AND seat_number = ANY($3)`;
      await this.executeQuery(query);
      return responseObj.returnResponse(false, "Seats booked successfully", null);
    } catch (error) {
      return responseObj.returnResponse(true, "Error booking seats", null);
    }
  }

  // Cancel a booking and release seats
  async cancelBooking(booking_id: number): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      const query = `UPDATE ${this.table} SET status = 'AVAILABLE', booking_id = NULL WHERE booking_id = $1`;
      await this.executeQuery(query);
      
      this.table = "Bookings";
      await this.updateRecord(booking_id, { booking_status: "CANCELLED" });
      
      return responseObj.returnResponse(false, "Booking cancelled successfully", null);
    } catch (error) {
      return responseObj.returnResponse(true, "Error cancelling booking", null);
    }
  }

  // Fetch all bookings for a user
  async getUserBookings(user_id: number): Promise<ServiceResponse> {
    try {
      this.table = "Bookings";
      this.where = `WHERE user_id = ${user_id} ORDER BY created_at DESC`;
      const bookings = await this.allRecords("*");

      if (!bookings || bookings.length === 0) {
        return responseObj.returnResponse(true, "No bookings found for this user", null);
      }
      return responseObj.returnResponse(false, "User bookings fetched successfully", bookings);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching user bookings", null);
    }
  }

  
}