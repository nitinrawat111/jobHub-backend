import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/ApiError.js";
import JobService from "./job.service.js";

class ApplicationService {
    static Model = Application;

    static async submitApplication(jobId, applicantId) {
        // Checking if given jobId is valid or not
        // Not checking applicantId assuming it is ontained after decoding a JWT token and hence authentic
        if (!mongoose.isValidObjectId(jobId))
            throw new ApiError(400, "Invalid job id");

        // Checking if job exists or not
        const job = await JobService.Model.findOne( { _id: jobId }, { _id: 1 });
        if(!job)
            throw new ApiError(404, 'Job id not found');

        const newApplication = new this.Model({
            jobId: jobId,
            applicantId: applicantId
        });
        
        try {
            // We have a compound index on [ jobId, applicantId]. So duplicate applications will be throw an error
            await newApplication.save();
        } catch(err) {
            if(err.code != 11000) // 11000 is the error code for Duplicate key error
                throw err;

            // If the combination of current [jobId, applicantId] already exists, it means user has already applied to the job before
            throw new ApiError(409, 'Already applied');
        }
    }
}

export default ApplicationService;