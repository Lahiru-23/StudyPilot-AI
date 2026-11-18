import mongoose, { Schema } from 'mongoose';

const itemSchema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String, required: true },
  subjectDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  taskTitle: { type: String },
  taskPriority: { type: String, enum: ['low', 'medium', 'high'] },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  activity: { type: String, required: true },
  reason: { type: String }
}, { _id: false });

const studyPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  availableHoursPerDay: { type: Number, min: 1, max: 12, default: 2 },
  durationDays: { type: Number, min: 1, max: 14, default: 3 },
  schedule: { type: [itemSchema], default: [] },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('StudyPlan', studyPlanSchema);
