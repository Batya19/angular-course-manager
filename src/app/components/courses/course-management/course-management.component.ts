import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import { AuthService } from '../../../services/auth.service';

import { Course } from '../../../models/course.model';
import { Lesson, LessonRequest } from '../../../models/lesson.model';

@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatProgressSpinnerModule, 
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule
  ]
})
export class CourseManagementComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  lessons: Lesson[] = [];
  selectedCourse: Course | null = null;
  
  // Form management
  courseForm!: FormGroup;
  lessonForm!: FormGroup;
  
  // UI state management
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  searchTerm: string = '';
  
  showCourseForm: boolean = false;
  showLessonManager: boolean = false;
  showLessonForm: boolean = false;
  showDeleteConfirmation: boolean = false;
  
  editMode: boolean = false;
  editingLesson: boolean = false;
  deletingLesson: boolean = false;
  itemToDeleteId: number | null = null;

  constructor(
    private courseService: CourseService,
    private lessonService: LessonService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Initialize forms
    this.initializeForms();
    
    // Check if we're editing an existing course
    this.route.params.subscribe(params => {
      const courseId = params['id'];
      
      if (courseId) {
        this.loadCourseDetails(Number(courseId));
      } else {
        this.loadTeacherCourses();
      }
    });
  }

  initializeForms(): void {
    this.courseForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });

    this.lessonForm = this.formBuilder.group({
      id: [null],
      title: ['', [Validators.required]],
      content: ['', [Validators.required]]
    });
  }

  loadTeacherCourses(): void {
    this.isLoading = true;
    const teacherId = this.authService.getUserId();
    
    if (!teacherId) {
      this.router.navigate(['/login']);
      return;
    }

    this.courseService.getCourses().subscribe({
      next: (courses) => {
        // Filter only courses created by this teacher
        this.courses = courses.filter(course => course.teacherId === teacherId);
        this.filteredCourses = [...this.courses];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load your courses. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadCourseDetails(courseId: number): void {
    this.isLoading = true;
    
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        // Check if the logged in teacher owns this course
        const teacherId = this.authService.getUserId();
        if (course.teacherId !== teacherId) {
          this.errorMessage = 'You do not have permission to manage this course.';
          this.isLoading = false;
          return;
        }
        
        this.selectedCourse = course;
        this.editCourse(course);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load course details. Please try again.';
        this.isLoading = false;
      }
    });
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

  // Course Form Operations
  openCourseForm(): void {
    this.editMode = false;
    this.courseForm.reset();
    this.showCourseForm = true;
  }

  editCourse(course: Course): void {
    this.editMode = true;
    this.courseForm.patchValue({
      title: course.title,
      description: course.description
    });
    this.selectedCourse = course;
    this.showCourseForm = true;
  }

  cancelCourseForm(): void {
    this.showCourseForm = false;
    this.courseForm.reset();
  }

  onSubmitCourse(): void {
    if (this.courseForm.invalid) return;

    const formData = this.courseForm.value;
    const teacherId = this.authService.getUserId();
    
    if (!teacherId) {
      this.errorMessage = 'You must be logged in to create or edit courses.';
      return;
    }

    const courseData = {
      title: formData.title,
      description: formData.description,
      teacherId: teacherId
    };

    this.isLoading = true;
    
    if (this.editMode && this.selectedCourse) {
      // Update existing course
      this.courseService.updateCourse(this.selectedCourse.id, courseData).subscribe({
        next: (updatedCourse) => {
          const index = this.courses.findIndex(c => c.id === this.selectedCourse!.id);
          if (index !== -1) {
            this.courses[index] = updatedCourse;
            this.filteredCourses = [...this.courses];
          }
          this.successMessage = 'Course updated successfully!';
          this.showCourseForm = false;
          this.isLoading = false;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update course. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      // Create new course
      this.courseService.addCourse(courseData).subscribe({
        next: (newCourse) => {
          this.courses.push(newCourse);
          this.filteredCourses = [...this.courses];
          this.successMessage = 'Course created successfully!';
          this.showCourseForm = false;
          this.isLoading = false;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create course. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  // Lesson Management
  manageLessons(course: Course): void {
    this.selectedCourse = course;
    this.showLessonManager = true;
    this.loadLessons(course.id);
  }

  loadLessons(courseId: number): void {
    this.isLoading = true;
    this.lessonService.getLessonsByCourseId(courseId).subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load lessons. Please try again.';
        this.isLoading = false;
      }
    });
  }

  backToCourses(): void {
    this.showLessonManager = false;
    this.selectedCourse = null;
    this.lessons = [];
  }

  // Lesson Form Operations
  openLessonForm(): void {
    this.editingLesson = false;
    this.lessonForm.reset();
    this.showLessonForm = true;
  }

  editLesson(lesson: Lesson): void {
    this.editingLesson = true;
    this.lessonForm.patchValue({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content
    });
    this.showLessonForm = true;
  }

  cancelLessonForm(): void {
    this.showLessonForm = false;
    this.lessonForm.reset();
  }

  onSubmitLesson(): void {
    if (this.lessonForm.invalid || !this.selectedCourse) return;

    const formData = this.lessonForm.value;
    const lessonData: LessonRequest = {
      title: formData.title,
      content: formData.content,
      courseId: this.selectedCourse.id
    };

    this.isLoading = true;

    if (this.editingLesson) {
      // Update existing lesson
      const lessonId = formData.id;
      this.lessonService.updateLesson(this.selectedCourse.id, lessonId, lessonData).subscribe({
        next: () => {
          this.loadLessons(this.selectedCourse!.id); // Refresh lesson list
          this.successMessage = 'Lesson updated successfully!';
          this.showLessonForm = false;
          this.isLoading = false;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update lesson. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      // Create new lesson
      this.lessonService.createLesson(this.selectedCourse.id, lessonData).subscribe({
        next: () => {
          this.loadLessons(this.selectedCourse!.id); // Refresh lesson list
          this.successMessage = 'Lesson created successfully!';
          this.showLessonForm = false;
          this.isLoading = false;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create lesson. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  // Delete Operations
  openDeleteDialog(course: Course): void {
    this.showDeleteConfirmation = true;
    this.deletingLesson = false;
    this.itemToDeleteId = course.id;
  }

  deleteLesson(lessonId: number): void {
    this.showDeleteConfirmation = true;
    this.deletingLesson = true;
    this.itemToDeleteId = lessonId;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.itemToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.itemToDeleteId === null) return;

    this.isLoading = true;

    if (this.deletingLesson) {
      // Delete lesson
      if (!this.selectedCourse) return;
      
      this.lessonService.deleteLesson(this.selectedCourse.id, this.itemToDeleteId).subscribe({
        next: () => {
          this.lessons = this.lessons.filter(lesson => lesson.id !== this.itemToDeleteId);
          this.successMessage = 'Lesson deleted successfully!';
          this.showDeleteConfirmation = false;
          this.isLoading = false;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete lesson. Please try again.';
          this.isLoading = false;
          this.showDeleteConfirmation = false;
        }
      });
    } else {
      // Delete course
      this.courseService.deleteCourse(this.itemToDeleteId).subscribe({
        next: () => {
          this.courses = this.courses.filter(course => course.id !== this.itemToDeleteId);
          this.filteredCourses = [...this.courses];
          this.successMessage = 'Course deleted successfully!';
          this.showDeleteConfirmation = false;
          this.isLoading = false;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete course. Please try again.';
          this.isLoading = false;
          this.showDeleteConfirmation = false;
        }
      });
    }
  }
}