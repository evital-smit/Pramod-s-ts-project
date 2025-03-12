import { responseUtil } from "../library/responseUtil";
import { appdb } from "./appdb";

const responseObj = new responseUtil();

interface Seat {
  flight_id: number;
  seat_number: string;
  booking_id?: number | null;
  status?: string;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class seatModel extends appdb {
  constructor() {
    super();
    this.table = "Seats";
    this.uniqueField = "seat_id";
  }

  // Get available seats for a flight
  async getAvailableSeatsByFlight(flight_id: number): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      this.where = `WHERE flight_id = ${flight_id} AND status = 'AVAILABLE'`;

      const seats = await this.allRecords("seat_number"); 

      if (!seats || seats.length === 0) {
        return responseObj.returnResponse(true, "No available seats found", []);
      }

      return responseObj.returnResponse(false, "Available seats fetched successfully", seats);
    } catch (error) {
      console.error("Error fetching available seats:", error);
      return responseObj.returnResponse(true, "Error fetching available seats", null);
    }
  }

  // Get seat details by flight and seat number
  async getSeatByNumber(flight_id: number, seat_number: string): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      const query = `SELECT status FROM ${this.table} WHERE flight_id = $1 AND seat_number = $2`;
      const result = await this.executeQuery(query);

      if (!result.length) {
        return responseObj.returnResponse(true, "Seat not found", null);
      }

      return responseObj.returnResponse(false, "Seat details fetched successfully", result[0]);
    } catch (error) {
      console.error("Error fetching seat details:", error);
      return responseObj.returnResponse(true, "Error fetching seat details", null);
    }
  }

  // Book selected seats
  async bookSelectedSeats(flight_id: number, booking_id: number, seat_numbers: string[]): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      const query = `UPDATE ${this.table} SET status = 'BOOKED', booking_id = $1 WHERE flight_id = $2 AND seat_number = ANY($3)`;
      await this.executeQuery(query);

      return responseObj.returnResponse(false, "Seats booked successfully", null);
    } catch (error) {
      console.error("Error booking seats:", error);
      return responseObj.returnResponse(true, "Error booking seats", null);
    }
  }

  async updateSeatBooking(booking_id: number, flight_id: number, old_seats: string[], new_seats: string[]): Promise<ServiceResponse> {
    try {
      // Release old seats
      const releaseQuery = `UPDATE ${this.table} SET status = 'AVAILABLE', booking_id = NULL 
                            WHERE booking_id = $1 AND seat_number = ANY($2)`;
      await this.executeQuery(releaseQuery);

      // Book new seats
      const bookQuery = `UPDATE ${this.table} SET status = 'BOOKED', booking_id = $1 
                         WHERE flight_id = $2 AND seat_number = ANY($3)`;
      await this.executeQuery(bookQuery);

      return responseObj.returnResponse(false, "Seats updated successfully", null);
    } catch (error) {
      console.error("Error updating seat booking:", error);
      return responseObj.returnResponse(true, "Error updating seat booking", null);
    }
  }

  // Cancel booked seats
  async cancelBookedSeats(booking_id: number, seat_numbers: string[]): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      const query = `UPDATE ${this.table} SET status = 'AVAILABLE', booking_id = NULL WHERE booking_id = $1 AND seat_number = ANY($2)`;
      await this.executeQuery(query);

      return responseObj.returnResponse(false, "Seats cancelled successfully", null);
    } catch (error) {
      console.error("Error cancelling seats:", error);
      return responseObj.returnResponse(true, "Error cancelling seats", null);
    }
  }

      // Book new seats
      async bookNewSeats(flight_id: number, booking_id: number, seat_numbers: string[]) {
        try {
          const query = `UPDATE ${this.table} SET status = 'BOOKED', booking_id = ${booking_id} 
                         WHERE flight_id = ${flight_id} AND seat_number IN ('${seat_numbers.join("','")}')`;
          await this.executeQuery(query);
          return responseObj.returnResponse(false, "Seats booked successfully", null);
        } catch (error) {
          console.error("Error booking seats:", error);
          return responseObj.returnResponse(true, "Error booking seats", null);
        }
      }

       // Update seat details
  async updateSeat(seat_id: number, seatData: Partial<Seat>): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      
      // Construct SET clause dynamically
      const updateFields = Object.keys(seatData).map((key, index) => `${key} = $${index + 1}`).join(", ");
      const values = Object.values(seatData);
      
      if (!updateFields) {
        return responseObj.returnResponse(true, "No valid fields provided for update", null);
      }

      values.push(seat_id); // Add seat_id to the values array for WHERE clause

      const query = `UPDATE ${this.table} SET ${updateFields} WHERE seat_id = $${values.length}`;
      await this.executeQuery(query);

      return responseObj.returnResponse(false, "Seat updated successfully", null);
    } catch (error) {
      console.error("Error updating seat:", error);
      return responseObj.returnResponse(true, "Error updating seat", null);
    }
  }

  // Delete a seat
  async deleteSeat(seat_id: number): Promise<ServiceResponse> {
    try {
      this.table = "Seats";
      
      const query = `DELETE FROM ${this.table} WHERE seat_id = $1`;
      await this.executeQuery(query);

      return responseObj.returnResponse(false, "Seat deleted successfully", null);
    } catch (error) {
      console.error("Error deleting seat:", error);
      return responseObj.returnResponse(true, "Error deleting seat", null);
    }
  }
    
  // Release seats
  async releaseSeats(booking_id: number, seat_numbers: string[]) {
      try {
        const query = `UPDATE ${this.table} SET status = 'AVAILABLE', booking_id = NULL 
                       WHERE booking_id = ${booking_id} AND seat_number IN ('${seat_numbers.join("','")}')`;
        await this.executeQuery(query);
        return responseObj.returnResponse(false, "Seats released successfully", null);
      } catch (error) {
        console.error("Error releasing seats:", error);
        return responseObj.returnResponse(true, "Error releasing seats", null);
      }
    }
}
