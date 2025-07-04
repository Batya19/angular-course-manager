# 📚 Angular Course Manager

> A comprehensive online course management system built with Angular **19** and Node.js

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 🌐 Live Demo
[View Live Version](https://online-course-management-system.onrender.com)

## 🎯 Overview

Angular Course Manager is a full-stack web application that enables educational institutions to manage online courses efficiently. The system provides separate interfaces for teachers and students, allowing course creation, enrollment, lesson management, and progress tracking.

### ✨ Key Features

- **🔐 Authentication System**: Secure login/register with JWT tokens
- **👨‍🏫 Teacher Dashboard**: Create and manage courses and lessons
- **👩‍🎓 Student Portal**: Browse, enroll, and track course progress
- **📖 Course Management**: Complete CRUD operations for courses
- **📝 Lesson System**: Detailed lesson content and organization
- **🛡️ Role-Based Access**: Different permissions for teachers and students
- **📱 Responsive Design**: Modern UI compatible with all devices

## 🏗️ Architecture

### Frontend (Angular 19)
```
src/
├── app/
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── courses/            # Course-related components
│   │   │   ├── course-details/
│   │   │   ├── course-list/
│   │   │   ├── course-management/
│   │   │   └── my-courses/
│   │   ├── lessons/            # Lesson components
│   │   │   ├── lesson-details/
│   │   │   └── lesson-list/
│   │   ├── home/               # Landing page
│   │   └── navbar/             # Navigation component
│   ├── guards/                 # Route protection
│   │   ├── auth.guard.ts
│   │   └── teacher.guard.ts
│   ├── interceptors/           # HTTP interceptors
│   │   └── token-interceptor.service.ts
│   ├── models/                 # TypeScript interfaces
│   │   ├── course.model.ts
│   │   ├── lesson.model.ts
│   │   └── user.model.ts
│   └── services/               # Business logic services
│       ├── auth.service.ts
│       ├── course.service.ts
│       ├── lesson.service.ts
│       └── user.service.ts
```

### Backend (Node.js + Express)
- **RESTful API** with comprehensive endpoints
- **SQLite Database** for data persistence
- **JWT Authentication** for secure sessions
- **Role-based authorization** (student/teacher)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Angular CLI** (v19)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Batya19/angular-course-manager.git
cd angular-course-manager
```

#### 2. Backend Setup
```bash
# Clone and setup backend server
git clone https://github.com/rivkamos/CourseOnlineServer.git
cd CourseOnlineServer
npm install
npm start
```
The backend server will run on `http://localhost:3000`

#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd courseOnlineClient
npm install
ng serve
```
The Angular app will run on `http://localhost:4200`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course (teachers only)
- `PUT /api/courses/:id` - Update course (teachers only)
- `DELETE /api/courses/:id` - Delete course (teachers only)
- `POST /api/courses/:courseId/enroll` - Enroll in course

### Lessons
- `GET /api/courses/:courseId/lessons` - Get course lessons
- `GET /api/courses/:courseId/lessons/:id` - Get lesson details
- `POST /api/courses/:courseId/lessons` - Create lesson (teachers only)
- `PUT /api/courses/:courseId/lessons/:id` - Update lesson (teachers only)
- `DELETE /api/courses/:courseId/lessons/:id` - Delete lesson (teachers only)

## 🔧 Core Angular Features Used

### 🎨 Modern Architecture
- **Standalone Components**: Latest Angular architecture
- **Reactive Forms**: Dynamic form handling
- **Angular Services**: Centralized business logic
- **HTTP Client**: Backend communication
- **Angular Router**: SPA navigation

### 🛡️ Security & Performance
- **Route Guards**: Access control (auth.guard.ts, teacher.guard.ts)
- **HTTP Interceptors**: Automatic token injection
- **JWT Authentication**: Secure session management
- **Role-based Authorization**: Different user permissions

### 🎯 Component Communication
- **Input/Output**: Parent-child data flow
- **Services**: Cross-component data sharing
- **Observables**: Reactive programming patterns

## 🎨 User Interface

### Student Features
- **📋 Course Catalog**: Browse available courses
- **📚 My Courses**: Enrolled courses dashboard
- **📖 Lesson Viewer**: Access course content
- **👤 Profile Management**: Update personal information

### Teacher Features
- **➕ Course Creation**: Add new courses
- **✏️ Course Management**: Edit/delete courses
- **📝 Lesson Management**: Create and organize lessons
- **👥 Student Tracking**: Monitor course enrollments

## 🌟 Learning Objectives

This project demonstrates proficiency in:

- **Angular Framework**: Components, services, routing, guards
- **TypeScript**: Strong typing and modern JavaScript features
- **REST API Integration**: HTTP client and data management
- **Authentication**: JWT tokens and secure sessions
- **State Management**: Service-based state handling
- **Responsive Design**: Mobile-first approach
- **Full-Stack Development**: Frontend-backend integration

## 📁 Project Structure Details

### Components Breakdown

#### Authentication (`auth/`)
- **LoginComponent**: User login form with validation
- **RegisterComponent**: New user registration

#### Courses (`courses/`)
- **CourseListComponent**: Display all available courses
- **CourseDetailsComponent**: Detailed course information
- **CourseManagementComponent**: Teacher course administration
- **MyCoursesComponent**: Student enrolled courses

#### Lessons (`lessons/`)
- **LessonListComponent**: Course lessons overview
- **LessonDetailsComponent**: Individual lesson content

#### Navigation (`navbar/`)
- **NavbarComponent**: Main navigation with user context

### Services Architecture

```typescript
// Auth Service - User authentication
AuthService {
  login(credentials)
  register(userData)
  logout()
  getCurrentUser()
}

// Course Service - Course management
CourseService {
  getAllCourses()
  getCourseById(id)
  createCourse(course)
  enrollInCourse(courseId)
}

// Lesson Service - Lesson operations
LessonService {
  getLessonsByCourse(courseId)
  getLessonById(id)
  createLesson(lesson)
}
```

## 🛠️ Development Workflow

### 1. Development Server
```bash
ng serve --open
```

### 2. Build for Production
```bash
ng build --prod
```

### 3. Code Quality
```bash
ng lint
ng test --code-coverage
```

## 🔐 Security Features

- **JWT Token Management**: Automatic token refresh
- **Route Protection**: Authenticated and role-based routes
- **Input Validation**: Both frontend and backend validation
- **CORS Configuration**: Secure cross-origin requests
- **SQL Injection Prevention**: Parameterized queries

## 📱 Browser Support

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
```bash
# Ensure backend CORS is configured for frontend URL
# Check backend server is running on port 3000
```

#### Authentication Issues
```bash
# Verify JWT token is being sent in headers
# Check token expiration and refresh logic
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **Batya Zilberberg** – *Designed, implemented, and maintained the full-stack application* – [Batya19](https://github.com/Batya19)  
- **Rivka M.** – *Contributed to backend development in early stages* – [rivkamos](https://github.com/rivkamos)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Node.js community for excellent backend tools
- All contributors who helped improve this project

---

<div align="center">
  <strong>Built with ❤️ using Angular & Node.js</strong>
</div>