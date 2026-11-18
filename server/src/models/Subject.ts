import mongoose, { Schema } from 'mongoose';
const subjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  code: { type: String, trim: true, maxlength: 20 },
  description: { type: String, maxlength: 500 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  color: { type: String, default: '#8b5cf6' }
}, { timestamps: true });
subjectSchema.index({ userId: 1, name: 1 }, { unique: true });
export default mongoose.model('Subject', subjectSchema);
