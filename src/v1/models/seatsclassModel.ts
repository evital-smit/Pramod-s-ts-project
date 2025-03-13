import { functions } from "../library/functions";
import { appdb } from "./appdb";

const functionsObj = new functions();

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

  
async addSeatClass(classData: SeatClass): Promise<ServiceResponse> {
  try {
      this.table = "seatclass";
      const result = await this.insertRecord(classData);
      return functionsObj.output(201, "Seat class added successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error adding seat class", null);
  }
}


async getSeatClassById(id: number): Promise<ServiceResponse> {
  try {
      this.table = "seatclass";
      const seatClass = await this.selectRecord(id, "*");

      if (!seatClass) {
          return functionsObj.output(404, "Seat class not found", null);
      }

      return functionsObj.output(200, "Seat class details fetched successfully", seatClass);
  } catch (error) {
      return functionsObj.output(500, "Error fetching seat class details", null);
  }
}


async listAllSeatClasses(): Promise<ServiceResponse> {
  try {
      this.table = "seatclass";
      const seatClasses = await this.allRecords("*");

      if (!seatClasses || seatClasses.length === 0) {
          return functionsObj.output(404, "No seat classes found", null);
      }

      return functionsObj.output(200, "Seat classes fetched successfully", seatClasses);
  } catch (error) {
      return functionsObj.output(500, "Error fetching seat classes", null);
  }
}


async updateSeatClass(id: number, classData: Partial<SeatClass>): Promise<ServiceResponse> {
  try {
      this.table = "seatclass";
      const result = await this.updateRecord(id, classData);

      if (!result) {
          return functionsObj.output(400, "Seat class not found or update failed", null);
      }

      return functionsObj.output(200, "Seat class updated successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error updating seat class", null);
  }
}


async deleteSeatClass(id: number): Promise<ServiceResponse> {
  try {
      this.table = "seatclass";
      const result = await this.deleteRecord(id);

      if (!result) {
          return functionsObj.output(404, "Seat class not found or deletion failed", null);
      }

      return functionsObj.output(200, "Seat class deleted successfully", result);
  } catch (error) {
      return functionsObj.output(500, "Error deleting seat class", null);
  }
}
}
