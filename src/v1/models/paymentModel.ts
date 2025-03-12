import { responseUtil } from "../library/responseUtil";
import { appdb } from "./appdb";

const responseObj = new responseUtil();

interface Payment {
  id?: number;
  booking_id: number;
  user_id: number;
  amount: number;
  payment_status: string; // "PENDING", "COMPLETED", "FAILED", "REFUNDED"
  payment_date: string;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class paymentModel extends appdb {
  constructor() {
    super();
    this.table = "payment";
    this.uniqueField = "id";
  }

  // Add a new payment record
  async addPayment(paymentData: Payment): Promise<ServiceResponse> {
    try {
      this.table = "payment";
      const result = await this.insertRecord(paymentData);
      return responseObj.returnResponse(false, "Payment added successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error adding payment", null);
    }
  }

  // Update payment status
  async updatePaymentStatus(id: number, payment_status: string): Promise<ServiceResponse> {
    try {
      this.table = "payment";
      const result = await this.updateRecord(id, { payment_status });

      if (!result) {
        return responseObj.returnResponse(true, "Payment status not updated or not found", null);
      }

      return responseObj.returnResponse(false, "Payment status updated successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error updating payment status", null);
    }
  }

  // Delete a payment record
  async deletePayment(id: number): Promise<ServiceResponse> {
    try {
      this.table = "payment";
      const result = await this.deleteRecord(id);

      if (!result) {
        return responseObj.returnResponse(true, "Payment record not found or not deleted", null);
      }

      return responseObj.returnResponse(false, "Payment record deleted successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error deleting payment record", null);
    }
  }

  // Get payment by ID
  async getPaymentById(id: number): Promise<ServiceResponse> {
    try {
      this.table = "payment";
      const payment = await this.selectRecord(id, "*");

      if (!payment) {
        return responseObj.returnResponse(true, "Payment record not found", null);
      }

      return responseObj.returnResponse(false, "Payment record fetched successfully", payment);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching payment record", null);
    }
  }

  // Get all payments for a booking
  async getPaymentsByBooking(booking_id: number): Promise<ServiceResponse> {
    try {
      this.table = "payment";
      this.where = `WHERE booking_id = ${booking_id}`;
      
      const payments = await this.allRecords("*");

      if (!payments || payments.length === 0) {
        return responseObj.returnResponse(true, "No payment records found for this booking", null);
      }

      return responseObj.returnResponse(false, "Payments fetched successfully", payments);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching payment records", null);
    }
  }
}
