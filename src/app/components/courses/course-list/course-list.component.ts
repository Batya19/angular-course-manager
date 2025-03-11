import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';

import { Course } from '../../../models/course.model';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatListModule, MatDividerModule, MatIconModule]
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  searchTerm: string = '';

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    const userId = this.authService.getUserId();

    if (userId) {
      this.courseService.getCourses().subscribe({
        next: (courses) => {
          this.courses = courses;

          this.courseService.getStudentCourses(userId).subscribe({
            next: (userCourses) => {
              this.courses.forEach(course => {
                course.isEnrolled = userCourses.some(userCourse => userCourse.id === course.id);
              });
              this.filteredCourses = [...this.courses];
              this.isLoading = false;
            },
            error: () => {
              this.filteredCourses = [...this.courses];
              this.isLoading = false;
            }
          });
        },
        error: () => {
          this.errorMessage = 'Failed to load courses. Please try again later.';
          this.isLoading = false;
        }
      });
    } else {
      this.courseService.getCourses().subscribe({
        next: (courses) => {
          this.courses = courses;
          this.filteredCourses = [...courses];
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load courses. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  filterCourses(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCourses = [...this.courses];
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    this.filteredCourses = this.courses.filter(course =>
      course.title.toLowerCase().includes(search) ||
      course.description.toLowerCase().includes(search)
    );
  }

  viewCourseDetails(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

  enrollInCourse(courseId: number, event: Event): void {
    event.stopPropagation();
    const userId = this.authService.getUserId();

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.courseService.joinCourse(courseId, userId).subscribe({
      next: () => {
        const courseIndex = this.courses.findIndex(c => c.id === courseId);
        if (courseIndex !== -1) {
          this.courses[courseIndex].isEnrolled = true;
          const filteredIndex = this.filteredCourses.findIndex(c => c.id === courseId);
          if (filteredIndex !== -1) {
            this.filteredCourses[filteredIndex].isEnrolled = true;
          }
        }
      },
      error: () => {
        this.errorMessage = 'Failed to enroll in the course. Please try again.';
      }
    });
  }
}