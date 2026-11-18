import mongoose, { Schema } from 'mongoose';
const studySessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  duration: { type: Number, required: true, min: 1, max: 1440 },
  date: { type: Date, default: Date.now },
  notes: { type: String, maxlength: 1000 }
}, { timestamps: true });
export default mongoose.model('StudySession', studySessionSchema);
