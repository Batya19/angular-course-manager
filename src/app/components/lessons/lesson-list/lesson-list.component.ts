import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../../../models/course.model';
import { Lesson } from '../../../models/lesson.model';
import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-lesson-list',
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatListModule, MatDividerModule]
})
export class LessonListComponent implements OnInit {
  @Input() courseId: number = 0;
  course: Course | null = null;
  lessons: Lesson[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  isOwner: boolean = false;
  isEnrolled: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService,
    private courseService: CourseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = +params['courseId'];
      this.loadCourseDetails();
    });
  }

  loadCourseDetails(): void {
    this.courseService.getCourseById(this.courseId)
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isOwner = course.teacherId === this.authService.getUserId();
          this.isEnrolled = course.isEnrolled || false;
          this.loadLessons();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load course details. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  loadLessons(): void {
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
        }
      });
  }

  viewLesson(lessonId: number): void {
    if (this.isEnrolled || this.isOwner) {
      this.router.navigate(['/courses', this.courseId, 'lessons', lessonId]);
    } else {
      this.errorMessage = 'You must be enrolled in this course to view lessons.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  backToCourse(): void {
    this.router.navigate(['/courses', this.courseId]);
  }
}