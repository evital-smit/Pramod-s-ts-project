import { functions } from "../library/functions";
import { appdb } from "./appdb";

const functionsObj = new functions

interface Payment {
  id?: number;
  booking_id: number;
  user_id: number;
  amount: number;
  payment_status: string; 
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


async addPayment(paymentData: Payment): Promise<ServiceResponse> {
  try {
      this.table = "payment";
      const result = await this.insertRecord(paymentData);
      return functionsObj.output(201, "Payment added successfully", result);
  } catch (error) {
      console.error("Error adding payment:", error);
      return functionsObj.output(500, "Error adding payment", null);
  }
}


async updatePaymentStatus(id: number, payment_status: string): Promise<ServiceResponse> {
  try {
      this.table = "payment";
      const result = await this.updateRecord(id, { payment_status });

      if (!result) {
          return functionsObj.output(404, "Payment status not updated or not found", null);
      }

      return functionsObj.output(200, "Payment status updated successfully", result);
  } catch (error) {
      console.error("Error updating payment status:", error);
      return functionsObj.output(500, "Error updating payment status", null);
  }
}


async deletePayment(id: number): Promise<ServiceResponse> {
  try {
      this.table = "payment";
      const result = await this.deleteRecord(id);

      if (!result) {
          return functionsObj.output(404, "Payment record not found or not deleted", null);
      }

      return functionsObj.output(200, "Payment record deleted successfully", result);
  } catch (error) {
      console.error("Error deleting payment record:", error);
      return functionsObj.output(500, "Error deleting payment record", null);
  }
}


async getPaymentById(id: number): Promise<ServiceResponse> {
  try {
      this.table = "payment";
      const payment = await this.selectRecord(id, "*");

      if (!payment) {
          return functionsObj.output(404, "Payment record not found", null);
      }

      return functionsObj.output(200, "Payment record fetched successfully", payment);
  } catch (error) {
      console.error("Error fetching payment record:", error);
      return functionsObj.output(500, "Error fetching payment record", null);
  }
}


async getPaymentsByBooking(booking_id: number): Promise<ServiceResponse> {
  try {
      this.table = "payment";
      this.where = `WHERE booking_id = ${booking_id}`;
      
      const payments = await this.allRecords("*");

      if (!payments || payments.length === 0) {
          return functionsObj.output(404, "No payment records found for this booking", []);
      }

      return functionsObj.output(200, "Payments fetched successfully", payments);
  } catch (error) {
      console.error("Error fetching payment records:", error);
      return functionsObj.output(500, "Error fetching payment records", null);
  }
}

}
