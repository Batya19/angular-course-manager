import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Course, CourseRequest } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})

export class CourseService {
  private baseUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.baseUrl);
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }

  addCourse(course: CourseRequest): Observable<Course> {
    return this.http.post<Course>(this.baseUrl, course);
  }

  updateCourse(courseId: number, course: CourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}/${courseId}`, course);
  }

  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseId}`);
  }

  joinCourse(courseId: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${courseId}/enroll`, { userId });
  }

  leaveCourse(courseId: number, userId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${courseId}/unenroll`, { body: { userId } });
  }

  getStudentCourses(studentId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/student/${studentId}`);
  }
}