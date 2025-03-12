import { Response } from 'express';

export class responseUtil{

       SuccessResponse  (res: Response, message: string, data: any)  {
         res.status(200).json({
            error: false,
            message,
            data,
        }); return;
    };
    
      errorResponse  (res: Response, statusCode: number, message: string, data: any = null)  {
         res.status(statusCode).json({
            error: true,
            message,
            data,
        });return;
    };

     returnResponse (error: boolean, message: string, data: any) {
        return { error, message, data };
    };
}
