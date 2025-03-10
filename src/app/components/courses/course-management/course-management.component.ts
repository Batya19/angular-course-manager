import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { Course, CourseRequest } from '../../../models/course.model';
import { Lesson, LessonRequest } from '../../../models/lesson.model';

import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

}) export class CourseManagementComponent implements OnInit {
  // Course-related properties
  courseForm!: FormGroup;
  courseId: number | null = null;
  course: Course | null = null;
  isEditingCourse: boolean = false;
  isCreatingCourse: boolean = true;

  // Lesson-related properties
  lessonForm!: FormGroup;
  lessons: Lesson[] = [];
  selectedLesson: Lesson | null = null;
  isEditingLesson: boolean = false;
  isCreatingLesson: boolean = false;

  // Shared properties
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  isOwner: boolean = false;

  // Tab management
  activeTab: number = 0; // 0 for course, 1 for lessons, 2 for lesson details/edit

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private lessonService: LessonService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router, // Changed to public
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForms();

    this.route.params.subscribe(params => {
      // Reset forms and state
      this.resetState();

      if (params['id']) {
        this.courseId = +params['id'];
        this.isEditingCourse = true;
        this.isCreatingCourse = false;
        this.loadCourseData();

        // Check if we're in lesson mode
        if (params['tab'] === 'lessons') {
          this.activeTab = 1;
          this.loadLessons();
        }

        // Check if we're dealing with a specific lesson
        if (params['lessonId']) {
          if (params['lessonId'] === 'new') {
            this.isCreatingLesson = true;
            this.activeTab = 2;
          } else {
            const lessonId = +params['lessonId'];
            this.loadLessonData(lessonId);

            if (params['action'] === 'edit') {
              this.isEditingLesson = true;
              this.activeTab = 2;
            } else {
              // Viewing lesson details
              this.activeTab = 2;
            }
          }
        }
      } else {
        // Add this else block to handle new course creation
        this.isLoading = false;
        this.isCreatingCourse = true;
        this.isEditingCourse = false;
      }
    });
  }

  resetState(): void {
    this.isEditingCourse = false;
    this.isCreatingCourse = true;
    this.isEditingLesson = false;
    this.isCreatingLesson = false;
    this.selectedLesson = null;
    this.course = null;
    this.lessons = [];
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true; // Set initial loading state
    this.initForms();
  }

  initForms(): void {
    // Initialize the course form
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });

    // Initialize the lesson form
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadCourseData(): void {
    if (!this.courseId) return;

    this.isLoading = true;
    this.courseService.getCourseById(this.courseId)
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isOwner = course.teacherId === this.authService.getUserId();

          if (!this.isOwner) {
            this.router.navigate(['/courses']);
            return;
          }

          this.courseForm.patchValue({
            title: course.title,
            description: course.description
          });

          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load course data. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  loadLessons(): void {
    if (!this.courseId) return;

    this.isLoading = true;
    this.lessonService.getLessonsByCourseId(this.courseId)
      .subscribe({
        next: (lessons) => {
          this.lessons = lessons;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load lessons. Please try again later.';
          this.isLoading = false;
          console.error('Error loading lessons:', error);
        }
      });
  }

  loadLessonData(lessonId: number): void {
    if (!this.courseId) return;

    this.isLoading = true;
    this.lessonService.getLessonById(this.courseId, lessonId)
      .subscribe({
        next: (lesson) => {
          this.selectedLesson = lesson;

          if (this.isEditingLesson) {
            this.lessonForm.patchValue({
              title: lesson.title,
              content: lesson.content
            });
          }

          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load lesson data. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  // Course operations
  onSubmitCourse(): void {
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

    if (this.isEditingCourse && this.courseId) {
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
          this.courseId = course.id;
          this.isEditingCourse = true;
          this.isCreatingCourse = false;
          this.course = course;

          // Update the URL without navigating
          this.router.navigate(['/courses', course.id], { replaceUrl: true });

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
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
          this.course = course;

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update course. Please try again later.';
          this.isSubmitting = false;
        }
      });
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

  // Lesson operations
  onSubmitLesson(): void {
    if (this.lessonForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const lessonData: LessonRequest = {
      title: this.lessonForm.value.title,
      content: this.lessonForm.value.content,
      courseId: this.courseId!
    };

    if (this.isEditingLesson && this.selectedLesson) {
      this.updateLesson(lessonData);
    } else {
      this.createLesson(lessonData);
    }
  }

  createLesson(lessonData: LessonRequest): void {
    if (!this.courseId) return;

    this.lessonService.createLesson(this.courseId, lessonData)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Lesson created successfully!';
          this.isSubmitting = false;
          this.isCreatingLesson = false;

          // Reload the lessons list
          this.loadLessons();

          // Switch back to the lessons tab
          this.activeTab = 1;

          // Update URL without navigation
          this.router.navigate(['/courses', this.courseId, 'tab', 'lessons'],
            { replaceUrl: true, queryParamsHandling: 'preserve' });

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create lesson. Please try again later.';
          this.isSubmitting = false;
        }
      });
  }

  updateLesson(lessonData: Partial<LessonRequest>): void {
    if (!this.courseId || !this.selectedLesson) return;

    this.lessonService.updateLesson(this.courseId, this.selectedLesson.id, lessonData)
      .subscribe({
        next: () => {
          this.successMessage = 'Lesson updated successfully!';
          this.isSubmitting = false;
          this.isEditingLesson = false;

          // Reload the lessons list and the current lesson
          this.loadLessons();
          this.loadLessonData(this.selectedLesson!.id);

          // Update URL without navigation
          this.router.navigate(['/courses', this.courseId, 'tab', 'lessons', 'view', this.selectedLesson?.id],
            { replaceUrl: true, queryParamsHandling: 'preserve' });

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update lesson. Please try again later.';
          this.isSubmitting = false;
        }
      });
  }

  deleteLesson(lessonId: number): void {
    if (!this.courseId || !confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    this.lessonService.deleteLesson(this.courseId, lessonId)
      .subscribe({
        next: () => {
          this.successMessage = 'Lesson deleted successfully!';

          // If we're viewing the deleted lesson, go back to lessons list
          if (this.selectedLesson && this.selectedLesson.id === lessonId) {
            this.selectedLesson = null;
            this.activeTab = 1;
          }

          // Update the lessons list
          this.lessons = this.lessons.filter(lesson => lesson.id !== lessonId);

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete lesson. Please try again later.';
        }
      });
  }

  // Navigation operations
  viewLesson(lessonId: number): void {
    this.loadLessonData(lessonId);
    this.isEditingLesson = false;
    this.isCreatingLesson = false;
    this.activeTab = 2;

    // Update URL without navigation
    this.router.navigate(['/courses', this.courseId, 'tab', 'lessons', 'view', lessonId],
      { replaceUrl: true, queryParamsHandling: 'preserve' });
  }

  editLesson(lessonId: number): void {
    this.loadLessonData(lessonId);
    this.isEditingLesson = true;
    this.isCreatingLesson = false;
    this.activeTab = 2;

    // Update URL without navigation
    this.router.navigate(['/courses', this.courseId, 'tab', 'lessons', 'edit', lessonId],
      { replaceUrl: true, queryParamsHandling: 'preserve' });
  }

  createNewLesson(): void {
    if (!this.courseId) {
      this.errorMessage = 'Course ID is required to create a new lesson';
      return;
    }

    this.isCreatingLesson = true;
    this.isEditingLesson = false;
    this.selectedLesson = null;
    this.lessonForm.reset();
    this.activeTab = 2;

    // Update URL without navigation - now with null check
    this.router.navigate(['/courses', this.courseId, 'tab', 'lessons', 'new'], {
      replaceUrl: true,
      queryParamsHandling: 'preserve'
    }).catch(error => {
      console.error('Navigation error:', error);
      this.errorMessage = 'Navigation failed. Please try again.';
    });
  }

  handleTabChange(index: number): void {
    // Don't allow switching to lessons tab if creating a new course
    if (this.isCreatingCourse && index === 1) {
      return;
    }

    this.activeTab = index;

    if (this.activeTab === 1 && this.lessons.length === 0) {
      this.loadLessons();
    }

    if (this.courseId) {
      const navigationPath = ['/courses', this.courseId];

      if (this.activeTab === 1) {
        navigationPath.push('tab', 'lessons');
      }

      this.router.navigate(navigationPath, {
        replaceUrl: true,
        queryParamsHandling: 'preserve'
      }).catch(error => {
        console.error('Navigation error:', error);
        this.errorMessage = 'Navigation failed. Please try again.';
      });
    }
  }

  cancelEdit(): void {
    if (this.isEditingCourse) {
      // If we're editing the course, revert to view mode
      this.loadCourseData();
      this.isEditingCourse = true;
    } else if (this.isCreatingCourse) {
      // If creating a new course, go back to courses list
      this.router.navigate(['/courses']);
    } else if (this.isEditingLesson) {
      // If editing a lesson, go back to lesson view
      this.isEditingLesson = false;
      this.loadLessonData(this.selectedLesson!.id);
    } else if (this.isCreatingLesson) {
      // If creating a lesson, go back to lessons list
      this.isCreatingLesson = false;
      this.activeTab = 1;
    }
  }

  // Utility functions
  back(): void {
    if (this.activeTab === 2) {
      // From lesson details/edit back to lessons list
      this.activeTab = 1;
      this.selectedLesson = null;
      this.isEditingLesson = false;
      this.isCreatingLesson = false;
    } else if (this.activeTab === 1) {
      // From lessons list back to course details
      this.activeTab = 0;
    } else {
      // From course details back to courses list
      this.router.navigate(['/courses']);
    }
  }

  // Public navigation method
  navigateToCourses(): void {
    this.router.navigate(['/courses']);
  }
}