import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../../../models/course.model';
import { Lesson } from '../../../models/lesson.model';
import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-lesson-details',
  templateUrl: './lesson-details.component.html',
  styleUrls: ['./lesson-details.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule]
})
export class LessonDetailsComponent implements OnInit {
  courseId: number = 0;
  lessonId: number | null = null;
  course: Course | null = null;
  lesson: Lesson | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  isOwner: boolean = false;

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
      this.lessonId = +params['lessonId'];
      this.loadCourseDetails();
      this.loadLessonData();
    });
  }

  loadCourseDetails(): void {
    this.courseService.getCourseById(this.courseId)
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isOwner = course.teacherId === this.authService.getUserId();
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
        },
        error: (error) => {
          this.errorMessage = 'Failed to load lesson data. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  backToLessons(): void {
    this.router.navigate(['/courses', this.courseId]);
  }
}