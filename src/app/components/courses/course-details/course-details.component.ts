import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { Course } from '../../../models/course.model';
import { Lesson } from '../../../models/lesson.model';

import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatListModule, MatDividerModule,]
})
export class CourseDetailsComponent implements OnInit {
  courseId: number = 0;
  course: Course | null = null;
  lessons: Lesson[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  isEnrolled: boolean = false;
  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private lessonService: LessonService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      this.loadCourseDetails();
    });
  }

  loadCourseDetails(): void {
    this.isLoading = true;
    this.courseService.getCourseById(this.courseId)
      .subscribe({
        next: (course) => {
          this.course = course;
          if (this.userId) {
            this.courseService.getStudentCourses(this.userId).subscribe(userCourses => {
              this.isEnrolled = userCourses.some(c => c.id === this.courseId);
            });
          }
          this.loadLessons();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load course details. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  loadLessons(): void {
    this.lessonService.getLessonsByCourseId(this.courseId)
      .subscribe({
        next: (lessons) => {
          this.lessons = lessons.slice(0, 5);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load lessons. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  viewLesson(lessonId: number): void {
    if (!this.isEnrolled) {
      this.enrollInCourse();
      return;
    }
    this.router.navigate(['/courses', this.courseId, 'lessons', lessonId]);
  }

  enrollInCourse(): void {
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.courseService.joinCourse(this.courseId, this.userId)
      .pipe(
        tap(() => {
          this.isEnrolled = true;
        }),
        catchError((error) => {
          this.errorMessage = 'Failed to enroll in the course. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loadCourseDetails();
        })
      )
      .subscribe();
  }

  unenrollFromCourse(): void {
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.courseService.leaveCourse(this.courseId, this.userId)
      .pipe(
        tap(() => {
          this.isEnrolled = false;
        }),
        catchError((error) => {
          this.errorMessage = 'Failed to unenroll from the course. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loadCourseDetails();
        })
      )
      .subscribe();
  }

  viewAllLessons(): void {
    if (!this.isEnrolled) {
      this.enrollInCourse();
      return;
    }
    this.router.navigate(['/courses', this.courseId, 'lessons']);
  }
}