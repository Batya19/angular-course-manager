import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Course } from '../../../models/course.model';
import { Lesson, LessonRequest } from '../../../models/lesson.model';

import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-lesson-details',
  templateUrl: './lesson-details.component.html',
  styleUrls: ['./lesson-details.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule]
})
export class LessonDetailsComponent implements OnInit {
  courseId: number = 0;
  lessonId: number | null = null;
  course: Course | null = null;
  lesson: Lesson | null = null;
  lessonForm!: FormGroup;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  isEditing: boolean = false;
  isCreating: boolean = false;
  isSubmitting: boolean = false;
  isTeacher: boolean = false;
  isOwner: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private lessonService: LessonService,
    private courseService: CourseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.isTeacher = this.authService.isTeacher();

    this.route.params.subscribe(params => {
      this.courseId = +params['courseId'];

      if (params['lessonId'] === 'new') {
        this.isCreating = true;
        this.isLoading = false;
        this.loadCourseDetails();
      } else if (params['action'] === 'edit') {
        this.lessonId = +params['lessonId'];
        this.isEditing = true;
        this.loadCourseDetails();
        this.loadLessonData();
      } else if (params['lessonId']) {
        this.lessonId = +params['lessonId'];
        this.loadCourseDetails();
        this.loadLessonData();
      }
    });
  }

  initForm(): void {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadCourseDetails(): void {
    this.courseService.getCourseById(this.courseId)
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isOwner = course.teacherId === this.authService.getUserId();

          if ((this.isCreating || this.isEditing) && !this.isOwner) {
            this.router.navigate(['/courses', this.courseId]);
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to load course details. Please try again later.';
        }
      });
  }

  loadLessonData(): void {
    if (!this.lessonId) return;

    this.lessonService.getLessonById(this.courseId, this.lessonId)
      .subscribe({
        next: (lesson) => {
          this.lesson = lesson;
          this.isLoading = false;

          if (this.isEditing) {
            this.lessonForm.patchValue({
              title: lesson.title,
              content: lesson.content
            });
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to load lesson data. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.lessonForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const lessonData: LessonRequest = {
      title: this.lessonForm.value.title,
      content: this.lessonForm.value.content,
      courseId: this.courseId
    };

    if (this.isEditing && this.lessonId) {
      this.updateLesson(lessonData);
    } else {
      this.createLesson(lessonData);
    }
  }

  createLesson(lessonData: LessonRequest): void {
    this.lessonService.createLesson(this.courseId, lessonData)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Lesson created successfully!';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/courses', this.courseId, 'lessons', response.lessonId]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create lesson. Please try again later.';
          this.isSubmitting = false;
        }
      });
  }

  updateLesson(lessonData: Partial<LessonRequest>): void {
    if (!this.lessonId) return;

    this.lessonService.updateLesson(this.courseId, this.lessonId, lessonData)
      .subscribe({
        next: () => {
          this.successMessage = 'Lesson updated successfully!';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/courses', this.courseId, 'lessons', this.lessonId]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update lesson. Please try again later.';
          this.isSubmitting = false;
        }
      });
  }

  deleteLesson(): void {
    if (!this.lessonId || !confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    this.lessonService.deleteLesson(this.courseId, this.lessonId)
      .subscribe({
        next: () => {
          this.successMessage = 'Lesson deleted successfully!';
          setTimeout(() => {
            this.router.navigate(['/courses', this.courseId]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete lesson. Please try again later.';
        }
      });
  }

  cancelEdit(): void {
    if (this.isEditing && this.lessonId) {
      this.router.navigate(['/courses', this.courseId, 'lessons', this.lessonId]);
    } else {
      this.router.navigate(['/courses', this.courseId]);
    }
  }

  editLesson(): void {
    if (this.lessonId) {
      this.router.navigate(['/courses', this.courseId, 'lessons', this.lessonId, 'edit']);
    }
  }

  backToLessons(): void {
    this.router.navigate(['/courses', this.courseId]);
  }
}