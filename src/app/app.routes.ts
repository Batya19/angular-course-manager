import { Routes } from '@angular/router';

// Components
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CourseListComponent } from './components/courses/course-list/course-list.component';
import { MyCoursesComponent } from './components/courses/my-courses/my-courses.component';
import { LessonDetailsComponent } from './components/lessons/lesson-details/lesson-details.component';
import { CourseDetailsComponent } from './components/courses/course-details/course-details.component';
import { CourseManagementComponent } from './components/courses/course-management/course-management.component';
import { LessonListComponent } from './components/lessons/lesson-list/lesson-list.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { TeacherGuard } from './guards/teacher.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'courses', component: CourseListComponent, canActivate: [AuthGuard] },
  { path: 'courses/:id', component: CourseDetailsComponent, canActivate: [AuthGuard] },
  { path: 'my-courses', component: MyCoursesComponent, canActivate: [AuthGuard] },
  { path: 'courses/:courseId/lessons/:lessonId', component: LessonDetailsComponent, canActivate: [AuthGuard] },
  { path: 'teacher/courses', component: CourseManagementComponent, canActivate: [TeacherGuard] },
  { path: 'course-management/:id', component: CourseManagementComponent },
  { path: 'course-management', component: CourseManagementComponent, },
  { path: 'courses/:courseId/lessons', component: LessonListComponent },
  { path: '**', redirectTo: '' }
];