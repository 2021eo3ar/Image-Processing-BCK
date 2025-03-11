import Job from "../models/Job.js";
import jobQueue from "../workers/jobWorker.js";

export const submitJob = async (req, res) => {
  try {
    const { count, visits } = req.body;

    if (!count || !visits || visits.length !== count) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const job = new Job({ status: "ongoing", visits, results: [] });

    await job.save();

    await jobQueue.add("processJob", { jobId: job._id.toString() });

    return res.status(201).json({ job_id: job._id });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const { jobid } = req.query;
    if (!jobid) return res.status(400).json({});

    const job = await Job.findById(jobid);
    if (!job) return res.status(400).json({});

    const response = { status: job.status, job_id: jobid };
    
    if (job.status === "failed") response.error = job.error || [];
    
    return res.status(200).json(response);
    
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
