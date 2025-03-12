import { responseUtil } from "../library/responseUtil";
import { appdb } from "./appdb";

const responseObj = new responseUtil();

interface BookingDetail {
  id?: number;
  booking_id: number;
  seat_id: number;
  passenger_name: string;
  age: number;
  gender: string; // "Male", "Female", "Other"
  relation: string; // e.g., "Self", "Family", "Friend"
  status: string; // "CONFIRMED", "CANCELLED"
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class bookingDetailsModel extends appdb {
  constructor() {
    super();
    this.table = "bookingdetails";
    this.uniqueField = "id";
  }

  // Add a new booking detail
  async addBookingDetail(bookingDetailData: BookingDetail): Promise<ServiceResponse> {
    try {
      this.table = "bookingdetails";
      const result = await this.insertRecord(bookingDetailData);
      return responseObj.returnResponse(false, "Booking detail added successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error adding booking detail", null);
    }
  }

  // Update booking detail
  async updateBookingDetail(id: number, bookingDetailData: Partial<BookingDetail>): Promise<ServiceResponse> {
    try {
      this.table = "bookingdetails";
      const result = await this.updateRecord(id, bookingDetailData);

      if (!result) {
        return responseObj.returnResponse(true, "Booking detail not updated or not found", null);
      }

      return responseObj.returnResponse(false, "Booking detail updated successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error updating booking detail", null);
    }
  }

  // Delete a booking detail
  async deleteBookingDetail(id: number): Promise<ServiceResponse> {
    try {
      this.table = "bookingdetails";
      const result = await this.deleteRecord(id);

      if (!result) {
        return responseObj.returnResponse(true, "Booking detail not found or not deleted", null);
      }

      return responseObj.returnResponse(false, "Booking detail deleted successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error deleting booking detail", null);
    }
  }

  // Get booking detail by ID
  async getBookingDetailById(id: number): Promise<ServiceResponse> {
    try {
      this.table = "bookingdetails";
      const detail = await this.selectRecord(id, "*");

      if (!detail) {
        return responseObj.returnResponse(true, "Booking detail not found", null);
      }

      return responseObj.returnResponse(false, "Booking detail fetched successfully", detail);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching booking detail", null);
    }
  }

  // Get all booking details for a booking
  async getDetailsByBooking(booking_id: number): Promise<ServiceResponse> {
    try {
      this.table = "bookingdetails";
      this.where = `WHERE booking_id = ${booking_id}`;
      
      const details = await this.allRecords("*");

      if (!details || details.length === 0) {
        return responseObj.returnResponse(true, "No booking details found for this booking", null);
      }

      return responseObj.returnResponse(false, "Booking details fetched successfully", details);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching booking details", null);
    }
  }
}
