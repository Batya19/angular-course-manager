import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Course } from '../../../models/course.model';
import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatListModule, MatDividerModule, MatIconModule]
})
export class MyCoursesComponent implements OnInit {
  courses: Course[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  userId: number | null = null;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadMyCourses();
  }

  loadMyCourses(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.courseService.getStudentCourses(this.userId)
      .subscribe({
        next: (courses) => {
          this.courses = courses;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load your courses. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  viewCourseDetails(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

  unenrollFromCourse(courseId: number, event: Event): void {
    event.stopPropagation();
    if (!this.userId) return;

    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    this.courseService.leaveCourse(courseId, this.userId)
      .subscribe({
        next: () => {
          this.courses = this.courses.filter(course => course.id !== courseId);
        },
        error: (error) => {
          this.errorMessage = 'Failed to unenroll from the course. Please try again.';
        }
      });
  }

  goToCourses() {
    this.router.navigate(['/courses']);
  }
}