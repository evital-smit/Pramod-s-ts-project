import { responseUtil } from "../library/responseUtil";
import { appdb } from "./appdb";

const responseObj = new responseUtil();

interface SeatClass {
  class_name: string;
  price_multiplier: number;
}

interface ServiceResponse {
  error: boolean;
  message: string;
  data: any;
}

export class seatClassModel extends appdb {
  constructor() {
    super();
    this.table = "seatclass";
    this.uniqueField = "id";
  }

  // Add a new seat class
  async addSeatClass(classData: SeatClass): Promise<ServiceResponse> {
    try {
      this.table = "seatclass";
      const result = await this.insertRecord(classData);
      return responseObj.returnResponse(false, "Seat class added successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error adding seat class", null);
    }
  }

  // Get seat class by ID
  async getSeatClassById(id: number): Promise<ServiceResponse> {
    try {
      this.table = "seatclass";
      const seatClass = await this.selectRecord(id, "*");

      if (!seatClass) {
        return responseObj.returnResponse(true, "Seat class not found", null);
      }

      return responseObj.returnResponse(false, "Seat class details fetched successfully", seatClass);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching seat class details", null);
    }
  }

  // Get all seat classes
  async listAllSeatClasses(): Promise<ServiceResponse> {
    try {
      this.table = "seatclass";
      const seatClasses = await this.allRecords("*");

      if (!seatClasses || seatClasses.length === 0) {
        return responseObj.returnResponse(true, "No seat classes found", null);
      }

      return responseObj.returnResponse(false, "Seat classes fetched successfully", seatClasses);
    } catch (error) {
      return responseObj.returnResponse(true, "Error fetching seat classes", null);
    }
  }

  // Update seat class details
  async updateSeatClass(id: number, classData: Partial<SeatClass>): Promise<ServiceResponse> {
    try {
      this.table = "seatclass";
      const result = await this.updateRecord(id, classData);

      if (!result) {
        return responseObj.returnResponse(true, "Seat class not found or update failed", null);
      }

      return responseObj.returnResponse(false, "Seat class updated successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error updating seat class", null);
    }
  }

  // Delete a seat class
  async deleteSeatClass(id: number): Promise<ServiceResponse> {
    try {
      this.table = "seatclass";
      const result = await this.deleteRecord(id);

      if (!result) {
        return responseObj.returnResponse(true, "Seat class not found or deletion failed", null);
      }

      return responseObj.returnResponse(false, "Seat class deleted successfully", result);
    } catch (error) {
      return responseObj.returnResponse(true, "Error deleting seat class", null);
    }
  }
}
