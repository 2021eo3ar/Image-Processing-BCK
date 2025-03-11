import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  status: { type: String, enum: ["ongoing", "completed", "failed"], default: "ongoing" },
  createdAt: { type: Date, default: Date.now },
  visits: [
    {
      store_id: String,
      image_url: [String],
      visit_time: String,
    }
  ],
  results: [
    {
      store_id: String,
      image_url: String,
      perimeter: Number,
      processedAt: Date,
    }
  ],
  error: [{
    store_id: String,
    error: String
  }]
});

export default mongoose.model("Job", jobSchema);
