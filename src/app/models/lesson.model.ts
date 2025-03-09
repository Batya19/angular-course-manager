export interface Lesson {
  id: number;
  title: string;
  content: string;
  courseId: number;
}

export interface LessonRequest {
  title: string;
  content: string;
  courseId: number;
}