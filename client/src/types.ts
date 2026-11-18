export interface User { id: string; name: string; email: string; role: 'student' | 'admin'; }
export interface Subject { _id: string; name: string; code?: string; difficulty: 'easy'|'medium'|'hard'; color: string; }
export interface Task { _id: string; title: string; dueDate: string; priority: 'low'|'medium'|'high'; status: 'pending'|'in-progress'|'completed'; subjectId: Subject | string; }
export interface Session { _id: string; duration: number; date: string; subjectId: Subject | string; notes?: string; }
