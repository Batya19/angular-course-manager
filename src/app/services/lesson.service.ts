import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Lesson, LessonRequest } from '../models/lesson.model';

@Injectable({
  providedIn: 'root'
})

export class LessonService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) { }

  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`);
  }

  getLessonById(courseId: number, lessonId: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`);
  }

  createLesson(courseId: number, lessonData: LessonRequest): Observable<{ message: string, lessonId: number }> {
    return this.http.post<{ message: string, lessonId: number }>(`${this.apiUrl}/${courseId}/lessons`, lessonData);
  }

  updateLesson(courseId: number, lessonId: number, lessonData: Partial<LessonRequest>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, lessonData);
  }

  deleteLesson(courseId: number, lessonId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`);
  }
}