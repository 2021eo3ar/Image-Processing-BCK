
import Job from '../models/Job.js';
import jobQueue from "../workers/jobWorker.js"

export const createJob = async (type, data) => {
  const job = new Job({ type, data });
  await job.save();
  
  await jobQueue.add('processJob', { jobId: job._id, type, data });
  return job;
};
