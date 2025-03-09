export interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  isEnrolled?: boolean;
}

export interface CourseRequest {
  title: string;
  description: string;
  teacherId: number;
}