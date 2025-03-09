import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CourseRequest } from '../../../models/course.model';

import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css'],
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule]
})
export class CourseManagementComponent implements OnInit {
  courseForm!: FormGroup;
  courseId: number | null = null;
  isEditing: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.courseId = +params['id'];
        this.isEditing = true;
        this.loadCourseData();
      }
    });
  }

  initForm(): void {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  loadCourseData(): void {
    if (!this.courseId) return;

    this.courseService.getCourseById(this.courseId)
      .subscribe({
        next: (course) => {
          if (course.teacherId !== this.authService.getUserId()) {
            this.router.navigate(['/courses']);
            return;
          }

          this.courseForm.patchValue({
            title: course.title,
            description: course.description
          });
        },
        error: (error) => {
          this.errorMessage = 'Failed to load course data. Please try again later.';
        }
      });
  }

  onSubmit(): void {
    if (this.courseForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'You must be logged in to perform this action.';
      this.isSubmitting = false;
      return;
    }

    const courseData: CourseRequest = {
      title: this.courseForm.value.title,
      description: this.courseForm.value.description,
      teacherId: userId
    };

    if (this.isEditing && this.courseId) {
      this.updateCourse(courseData);
    } else {
      this.createCourse(courseData);
    }
  }

  createCourse(courseData: CourseRequest): void {
    this.courseService.addCourse(courseData)
      .subscribe({
        next: (course) => {
          this.successMessage = 'Course created successfully!';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/courses', course.id]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create course. Please try again later.';
          this.isSubmitting = false;
        }
      });
  }

  updateCourse(courseData: CourseRequest): void {
    if (!this.courseId) return;

    this.courseService.updateCourse(this.courseId, courseData)
      .subscribe({
        next: (course) => {
          this.successMessage = 'Course updated successfully!';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/courses', course.id]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update course. Please try again later.';
          this.isSubmitting = false;
        }
      });
  }

  cancelEdit(): void {
    if (this.isEditing && this.courseId) {
      this.router.navigate(['/courses', this.courseId]);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  deleteCourse(): void {
    if (!this.courseId || !confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    this.courseService.deleteCourse(this.courseId)
      .subscribe({
        next: () => {
          this.successMessage = 'Course deleted successfully!';
          setTimeout(() => {
            this.router.navigate(['/courses']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete course. Please try again later.';
        }
      });
  }
}