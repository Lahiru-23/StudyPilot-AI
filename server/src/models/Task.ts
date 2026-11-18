import mongoose, { Schema } from 'mongoose';
const taskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, maxlength: 1000 },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
}, { timestamps: true });
taskSchema.index({ userId: 1, dueDate: 1 });
export default mongoose.model('Task', taskSchema);
