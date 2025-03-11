import { Worker, Queue } from "bullmq";
import redisClient from "../config/redis.js";
import axios from "axios";
import sharp from "sharp";
import Job from "../models/Job.js";

const jobQueue = new Queue('jobQueue', { connection: redisClient });

const worker = new Worker('jobQueue', async (job) => {
  try {
    console.log(`Processing job: ${job.data.jobId}`);

    const dbJob = await Job.findById(job.data.jobId);
    if (!dbJob) throw new Error("Job not found in database");

    dbJob.status = "ongoing";
    await dbJob.save();

    let results = [];
    let errors = [];

    for (const visit of dbJob.visits) {
      for (const imageUrl of visit.image_url) {
        try {
          const response = await axios({ url: imageUrl, responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data, 'binary');

          const metadata = await sharp(imageBuffer).metadata();
          const perimeter = 2 * (metadata.width + metadata.height);

          await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));

          results.push({
            store_id: visit.store_id,
            image_url: imageUrl,
            perimeter,
            processedAt: new Date(),
          });

        } catch (error) {
          console.error(`Error processing image ${imageUrl}:`, error);
          errors.push({ store_id: visit.store_id, error: error.message });
        }
      }
    }

    dbJob.status = errors.length > 0 ? "failed" : "completed";
    dbJob.results = results;
    dbJob.error = errors.length > 0 ? errors : null;

    await dbJob.save();
    console.log(`Job completed: ${job.data.jobId}`);

  } catch (error) {
    console.error(`Job failed: ${job.data.jobId}`, error);
    await Job.findByIdAndUpdate(job.data.jobId, { status: "failed", error: [{ error: error.message }] });
  }
}, { connection: redisClient });

worker.on('failed', (job, err) => {
  console.error(`Job failed: ${job.id}`, err);
});

export default jobQueue;
