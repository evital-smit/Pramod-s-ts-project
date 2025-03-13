import { functions } from "../library/functions";
import { appdb } from "./appdb";

const functionsObj = new functions();

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

  
async addBookingDetail(bookingDetailData: BookingDetail): Promise<ServiceResponse> {
  try {
      this.table = "bookingdetails";
      const result = await this.insertRecord(bookingDetailData);
      return functionsObj.output(201, "Booking detail added successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error adding booking detail", null);
  }
}


async updateBookingDetail(id: number, bookingDetailData: Partial<BookingDetail>): Promise<ServiceResponse> {
  try {
      this.table = "bookingdetails";
      const result = await this.updateRecord(id, bookingDetailData);

      if (!result) {
          return functionsObj.output(400, "Booking detail not updated or not found", null);
      }

      return functionsObj.output(200, "Booking detail updated successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error updating booking detail", null);
  }
}


async deleteBookingDetail(id: number): Promise<ServiceResponse> {
  try {
      this.table = "bookingdetails";
      const result = await this.deleteRecord(id);

      if (!result) {
          return functionsObj.output(404, "Booking detail not found or not deleted", null);
      }

      return functionsObj.output(200, "Booking detail deleted successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error deleting booking detail", null);
  }
}


async getBookingDetailById(id: number): Promise<ServiceResponse> {
  try {
      this.table = "bookingdetails";
      const detail = await this.selectRecord(id, "*");

      if (!detail) {
          return functionsObj.output(404, "Booking detail not found", null);
      }

      return functionsObj.output(200, "Booking detail fetched successfully", detail);
  } catch (error) {
      return functionsObj.output(500, "Error fetching booking detail", null);
  }
}


async getDetailsByBooking(booking_id: number): Promise<ServiceResponse> {
  try {
      this.table = "bookingdetails";
      this.where = `WHERE booking_id = $1`;
      
      const details = await this.allRecords("*");

      if (!details || details.length === 0) {
          return functionsObj.output(404, "No booking details found for this booking", null);
      }

      return functionsObj.output(200, "Booking details fetched successfully", details);
  } catch (error) {
      return functionsObj.output(500, "Error fetching booking details", null);
  }
}
}
