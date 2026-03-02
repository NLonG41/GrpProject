# 3.1 Functional Requirements

This subsection outlines the core functional requirements of the Academic Suite system. These requirements define the specific actions the system must support for each user role, ensuring that the system meets the needs of administrators, academic assistants, lecturers, and students. The requirements are grouped into functional areas such as account management, academic structure management, enrollment, grading, attendance, scheduling, and notifications.

## 3.1.1 Client Applications (Mobile/Web)

### 1. Account Management

#### Login
- Authenticate users using:
  - Email + password (`POST /api/auth/login`).

#### Register
- Allow users to register using email, full name, password, and role (`POST /api/auth/register`).
- For **STUDENT** role, the system must require a `studentCode`.
- The system must prevent duplicate email and duplicate student code.

#### View Profile
- Display user personal information retrieved from the `User` table:
  - Full name
  - Email
  - Role
  - Student code / cohort / major / department / specialty (if applicable)
- Retrieve profile via user listing endpoints (e.g., `GET /api/users/:identifier`).

#### Change Password
- Allow users to change password by providing current password and a new password (`POST /api/auth/change-password`).

#### Forgot Password
- Allow users to request password reset using email (`POST /api/auth/forgot-password`).
- The system must not reveal whether an email exists in the database.

#### Logout
- Log out the user by clearing local session/token on the client.

### 2. Academic Catalog (Subjects)

#### View All Subjects
- Display a list of all available subjects (`GET /api/subjects`).

#### View Subject Details
- Display subject details (`GET /api/subjects/:id`), including:
  - Subject name
  - Credits
  - Faculty
  - Description

#### Manage Subjects (Academic Assistant)
- Academic assistants must be able to:
  - Create a subject (`POST /api/subjects`).
  - Bulk create subjects (`POST /api/subjects/bulk`).
  - Update a subject (`PUT /api/subjects/:id`).
  - Delete a subject (`DELETE /api/subjects/:id`).
- The system must prevent deleting a subject if it has existing classes.

### 3. Subject Prerequisites

#### Manage Prerequisites (Academic Assistant)
- Academic assistants must be able to manage prerequisite relationships between subjects (`/api/subject-prerequisites`).

### 4. Class Management

#### View Classes
- Users must be able to view all classes (`GET /api/classes`).
- Users must be able to view class details (`GET /api/classes/:id`), including:
  - Subject information
  - Lecturer information
  - Class capacity and enrollment count
  - Start/end dates

#### Manage Classes (Academic Assistant)
- Academic assistants must be able to:
  - Create a class (`POST /api/classes`).
  - Update a class (`PUT /api/classes/:id`).
  - Delete a class (`DELETE /api/classes/:id`).
- The system must validate:
  - Subject exists.
  - Lecturer exists and has role `LECTURER`.
  - `endDate` must be greater than `startDate`.
  - Deletion is blocked if the class has enrollments or schedules.

### 5. Enrollment Management

#### View Enrollments
- Users must be able to view enrollments (`GET /api/enrollments`) with optional filters:
  - by `studentId`
  - by `classId`
- Users must be able to view enrollment details (`GET /api/enrollments/:id`).

#### Enroll in a Class
- Students (or authorized staff on behalf of students) must be able to enroll into a class (`POST /api/enrollments`).
- The system must enforce:
  - The student exists and has role `STUDENT`.
  - The class exists and is active.
  - The class is not full.
  - No duplicate enrollment for the same student and class.
- On successful enrollment, the system must increment the class enrollment counter.

#### Cancel Enrollment
- Users must be able to delete an enrollment (`DELETE /api/enrollments/:id`).
- On successful deletion, the system must decrement the class enrollment counter.

### 6. Scheduling

#### View Schedule
- Users must be able to view class schedules (`/api/schedules`).
- Schedules must include time and room information (where applicable).

### 7. Attendance Management

#### Attendance Tracking
- Lecturers must be able to record student attendance (`/api/attendance`).
- Students must be able to view their attendance history per class/subject.

### 8. Grade Management

#### Grade Items
- Lecturers must be able to define grade items (assessment components) for a class (`/api/grade-items`).

#### Grade Records
- Lecturers must be able to record and update student grades (`/api/grade-records`).
- Students must be able to view their grades.

#### Enrollment Scores
- The system supports storing score fields directly on enrollments (`PUT /api/enrollments/:id`):
  - midterm score
  - final score
  - total grade

### 9. Requests

#### Request-based Operations
- The system must provide endpoints for request-based workflows (`/api/requests`), such as enrollment-related requests that may require approval.

### 10. Notifications

#### Notifications
- The system must provide endpoints for creating and retrieving notifications (`/api/notifications`).

### 11. Rooms

#### Room Management
- The system must provide endpoints for managing rooms (`/api/rooms`).

### 12. Analytics

#### Reporting & Analytics
- The system must provide analytics endpoints for aggregated reporting (`/api/analytics`).

### 13. Health Check

#### Service Monitoring
- The system must provide a health endpoint (`GET /health`) for monitoring availability.

## 3.1.2 Authorization & Access Control

- The system must support role-based access control.
- Academic assistant-only operations must be protected by middleware (`requireAssistant`).
- The system includes Firebase token verification middleware (`verifyFirebaseToken`) which:
  - Verifies Firebase ID tokens.
  - Maps Firebase email to a user in the database.
  - Attaches user information to the request context.

