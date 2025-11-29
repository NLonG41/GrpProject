import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { requestLogger, auditLog } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data", "demo-database.json");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const readData = () => {
  const json = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(json);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
};

// Simple password hashing (for demo - use bcrypt in production)
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

const verifyPassword = (password, hashed) => {
  return hashPassword(password) === hashed;
};

app.get("/api/portal-data", (req, res) => {
  const data = readData();
  console.log("[API]   → sending full portal-data snapshot");
  res.json(data);
});

// ------- Semesters --------
app.get("/api/semesters", (req, res) => {
  const semesters = readData().semesters;
  console.log(`[API]   → ${semesters.length} semesters returned`);
  res.json(semesters);
});

app.post("/api/semesters", (req, res) => {
  const data = readData();
  const newSemester = { id: Date.now(), ...req.body };
  data.semesters.push(newSemester);
  writeData(data);
  auditLog(
    {
      action: "semester:create",
      entityType: "semester",
      entityId: newSemester.id,
      payload: newSemester,
    },
    req
  );
  res.status(201).json(newSemester);
});

app.post("/api/semesters/:id/activate", (req, res) => {
  const targetId = Number(req.params.id);
  const data = readData();
  data.semesters = data.semesters.map((semester) => ({
    ...semester,
    status: semester.id === targetId ? "Active" : "Planned",
  }));
  writeData(data);
  auditLog(
    {
      action: "semester:activate",
      entityType: "semester",
      entityId: targetId,
    },
    req
  );
  res.json({ success: true, activeSemesterId: targetId });
});

// ------- Rooms --------
app.get("/api/rooms", (req, res) => {
  const rooms = readData().rooms || [];
  console.log(`[API]   → ${rooms.length} rooms returned`);
  res.json(rooms);
});

app.post("/api/rooms", (req, res) => {
  const data = readData();
  const newRoom = {
    name: req.body.name,
    capacity: Number(req.body.capacity) || 0,
    type: req.body.type || "Classroom",
    location: req.body.location || "Unknown",
    maintenance: Boolean(req.body.maintenance),
  };
  data.rooms.push(newRoom);
  writeData(data);
  auditLog(
    {
      action: "room:create",
      entityType: "room",
      entityId: newRoom.name,
      payload: newRoom,
    },
    req
  );
  res.status(201).json(newRoom);
});

// ------- Subjects (optional demo create) --------
app.post("/api/subjects", (req, res) => {
  const data = readData();
  const newSubject = {
    code: req.body.code,
    name: req.body.name,
    credit: Number(req.body.credit) || 0,
    faculty: req.body.faculty || "Unknown",
    prereq: req.body.prereq || [],
    syllabus: req.body.syllabus || "",
  };
  data.subjects.push(newSubject);
  writeData(data);
  auditLog(
    {
      action: "subject:create",
      entityType: "subject",
      entityId: newSubject.code,
      payload: newSubject,
    },
    req
  );
  res.status(201).json(newSubject);
});

// ------- Users & Student registration --------
app.get("/api/users", (req, res) => {
  const { role } = req.query;
  const data = readData();
  let users = data.users || [];
  if (role) {
    users = users.filter((u) => u.role === role);
  }
  res.json(users);
});

// ------- Authentication & User Registration --------
app.post("/api/auth/register", (req, res) => {
  const data = readData();
  const { fullName, email, password, role, studentCode, cohort, major } = req.body;

  // Validate required fields
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: "fullName, email và password là bắt buộc" });
  }

  // For students, studentCode is required
  if (role === "Student" && !studentCode) {
    return res.status(400).json({ error: "studentCode là bắt buộc cho học sinh" });
  }

  // Validate email format
  if (!email.includes("@")) {
    return res.status(400).json({ error: "Email không hợp lệ" });
  }

  // Validate role
  const validRoles = ["Admin", "Lecturer", "Student"];
  const userRole = role || "Student"; // Default to Student if not specified
  if (!validRoles.includes(userRole)) {
    return res.status(400).json({ error: `Role phải là một trong: ${validRoles.join(", ")}` });
  }

  // Check if email already exists
  const emailExists = (data.users || []).some((u) => u.email === email);
  if (emailExists) {
    return res.status(409).json({ error: "Email đã tồn tại" });
  }

  // For students, check if studentCode already exists
  if (userRole === "Student") {
    const studentCodeExists = (data.users || []).some(
      (u) => u.studentCode && u.studentCode === studentCode
    );
    if (studentCodeExists) {
      return res.status(409).json({ error: "Mã sinh viên đã tồn tại" });
    }
  }

  // Generate userId based on role
  const timestamp = Date.now();
  let userId;
  if (userRole === "Student") {
    userId = `user-student-${timestamp}`;
  } else if (userRole === "Lecturer") {
    userId = `user-lecturer-${timestamp}`;
  } else {
    userId = `user-admin-${timestamp}`;
  }

  // Create new user object matching ERD structure
  const newUser = {
    userId,
    email,
    password: hashPassword(password), // Hash password before storing
    role: userRole,
    fullName,
    createdAt: new Date().toISOString(),
  };

  // Add role-specific fields
  if (userRole === "Student") {
    newUser.studentCode = studentCode;
    newUser.cohort = cohort || null;
    newUser.major = major || null;
  } else if (userRole === "Lecturer") {
    newUser.department = req.body.department || null;
    newUser.specialty = req.body.specialty || null;
  } else if (userRole === "Admin") {
    newUser.department = req.body.department || "Academic Affairs";
  }

  // Save to database
  data.users = data.users || [];
  data.users.push(newUser);
  writeData(data);

  // Log the registration
  auditLog(
    {
      action: "user:register",
      entityType: "user",
      entityId: userId,
      payload: { ...newUser, password: "***" }, // Don't log password
    },
    req
  );

  // Return user without password
  const { password: _, ...userResponse } = newUser;
  res.status(201).json({
    message: "Đăng ký tài khoản thành công",
    user: userResponse,
  });
});

app.post("/api/auth/login", (req, res) => {
  const data = readData();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email và password là bắt buộc" });
  }

  const user = (data.users || []).find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Email hoặc password không đúng" });
  }

  // Check password
  if (!user.password || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: "Email hoặc password không đúng" });
  }

  auditLog(
    {
      action: "user:login",
      entityType: "user",
      entityId: user.userId || user.id, // Support both old and new structure
      payload: { email, role: user.role },
    },
    req
  );

  // Return user without password
  const { password: _, ...userResponse } = user;
  res.json({
    user: userResponse,
    message: "Đăng nhập thành công",
  });
});

// Get user by ID or email
app.get("/api/users/:identifier", (req, res) => {
  const { identifier } = req.params;
  const data = readData();
  
  // Try to find by userId, email, or studentCode
  const user = (data.users || []).find(
    (u) => 
      (u.userId || u.id) === identifier || 
      u.email === identifier || 
      (u.studentCode && u.studentCode === identifier)
  );
  
  if (!user) {
    return res.status(404).json({ error: "Không tìm thấy user" });
  }
  
  const { password: _, ...userResponse } = user;
  res.json(userResponse);
});

// Legacy endpoint (keep for backward compatibility - redirects to new structure)
app.post("/api/students/register", (req, res) => {
  // Convert old format to new format and call the main register endpoint
  const { name, email, studentCode, cohort, major, password } = req.body;
  
  // Map old field names to new ones
  req.body.fullName = name;
  req.body.role = "Student";
  req.body.password = password || "123456"; // Default password
  
  // Call the main register handler
  const originalUrl = req.url;
  req.url = "/api/auth/register";
  
  // Use the main register endpoint logic
  const data = readData();
  const { fullName, email: emailNew, password: passwordNew, role, studentCode: studentCodeNew, cohort: cohortNew, major: majorNew } = {
    fullName: name,
    email: email,
    password: password || "123456",
    role: "Student",
    studentCode: studentCode,
    cohort: cohort,
    major: major
  };

  if (!fullName || !emailNew || !passwordNew) {
    return res
      .status(400)
      .json({ error: "name, email và password là bắt buộc" });
  }

  if (!studentCodeNew) {
    return res.status(400).json({ error: "studentCode là bắt buộc cho học sinh" });
  }

  if (!emailNew.includes("@")) {
    return res.status(400).json({ error: "Email không hợp lệ" });
  }

  const emailExists = (data.users || []).some((u) => u.email === emailNew);
  if (emailExists) {
    return res.status(409).json({ error: "Email đã tồn tại" });
  }

  const studentCodeExists = (data.users || []).some(
    (u) => u.studentCode && u.studentCode === studentCodeNew
  );
  if (studentCodeExists) {
    return res.status(409).json({ error: "Mã sinh viên đã tồn tại" });
  }

  const timestamp = Date.now();
  const userId = `user-student-${timestamp}`;

  const newUser = {
    userId,
    email: emailNew,
    password: hashPassword(passwordNew),
    role: "Student",
    fullName,
    studentCode: studentCodeNew,
    cohort: cohortNew || null,
    major: majorNew || null,
    createdAt: new Date().toISOString(),
  };

  data.users = data.users || [];
  data.users.push(newUser);
  writeData(data);

  auditLog(
    {
      action: "user:register",
      entityType: "user",
      entityId: userId,
      payload: { ...newUser, password: "***" },
    },
    req
  );

  const { password: __, ...userResponse } = newUser;
  res.status(201).json({
    message: "Đăng ký tài khoản thành công",
    user: userResponse,
  });
});

// ------- Enrollment / Learning tracking APIs --------
app.get("/api/students/:studentId/enrollments", (req, res) => {
  const { studentId } = req.params;
  const data = readData();
  const enrollments = (data.enrollments || []).filter(
    (e) => e.studentId === studentId && e.status === "enrolled"
  );
  res.json(enrollments);
});

app.post("/api/enrollments", (req, res) => {
  const data = readData();
  const { studentId, classId } = req.body;

  if (!studentId || !classId) {
    return res.status(400).json({ error: "studentId và classId là bắt buộc" });
  }

  const already = (data.enrollments || []).find(
    (e) =>
      e.studentId === studentId &&
      e.classId === classId &&
      e.status === "enrolled"
  );
  if (already) {
    return res.status(409).json({ error: "Đã enroll lớp này rồi" });
  }

  const id = Date.now();
  const newEnrollment = {
    id,
    studentId,
    classId,
    status: "enrolled",
    enrolledAt: new Date().toISOString(),
  };

  data.enrollments = data.enrollments || [];
  data.enrollments.push(newEnrollment);
  writeData(data);

  auditLog(
    {
      action: "enrollment:create",
      entityType: "enrollment",
      entityId: id,
      payload: newEnrollment,
    },
    req
  );

  res.status(201).json(newEnrollment);
});

app.post("/api/enrollments/:id/drop", (req, res) => {
  const { id } = req.params;
  const numericId = Number(id);
  const data = readData();
  const enrollment = (data.enrollments || []).find(
    (e) => e.id === numericId
  );

  if (!enrollment || enrollment.status === "dropped") {
    return res.status(404).json({ error: "Enrollment không tồn tại" });
  }

  enrollment.status = "dropped";
  enrollment.droppedAt = new Date().toISOString();
  writeData(data);

  auditLog(
    {
      action: "enrollment:drop",
      entityType: "enrollment",
      entityId: numericId,
      payload: enrollment,
    },
    req
  );

  res.json(enrollment);
});

app.get("/api/students/:studentId/schedule", (req, res) => {
  const { studentId } = req.params;
  const data = readData();
  const enrollments = (data.enrollments || []).filter(
    (e) => e.studentId === studentId && e.status === "enrolled"
  );
  const classIds = enrollments.map((e) => e.classId);
  const scheduleItems = (data.schedules || []).filter((s) =>
    classIds.includes(s.classId)
  );
  res.json(scheduleItems);
});

app.get("/api/students/:studentId/attendance", (req, res) => {
  const { studentId } = req.params;
  const data = readData();
  const items = (data.attendance || []).filter(
    (a) => a.studentId === studentId
  );
  res.json(items);
});

app.get("/api/students/:studentId/scores", (req, res) => {
  const { studentId } = req.params;
  const data = readData();
  const items = (data.scores || []).filter((s) => s.studentId === studentId);
  res.json(items);
});

// ------- Student actions -> Assistant review --------
app.get("/api/student-actions", (req, res) => {
  const { status } = req.query;
  const data = readData();
  let items = data.studentActions || [];
  if (status) {
    items = items.filter((a) => a.status === status);
  }
  res.json(items);
});

app.post("/api/student-actions", (req, res) => {
  const data = readData();
  const { studentId, type, payload } = req.body;

  if (!studentId || !type) {
    return res
      .status(400)
      .json({ error: "studentId và type là bắt buộc" });
  }

  const id = Date.now();
  const action = {
    id,
    studentId,
    type,
    payload: payload || {},
    status: "pending",
    createdAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
  };

  data.studentActions = data.studentActions || [];
  data.studentActions.push(action);
  writeData(data);

  auditLog(
    {
      action: "student-action:create",
      entityType: "studentAction",
      entityId: id,
      payload: action,
    },
    req
  );

  res.status(201).json(action);
});

app.post("/api/student-actions/:id/review", (req, res) => {
  const data = readData();
  const numericId = Number(req.params.id);
  const { decision, reviewerId } = req.body;

  const item = (data.studentActions || []).find(
    (a) => a.id === numericId
  );

  if (!item) {
    return res.status(404).json({ error: "Student action không tồn tại" });
  }

  item.status = decision === "approved" ? "approved" : "rejected";
  item.reviewedBy = reviewerId || "assistant-1";
  item.reviewedAt = new Date().toISOString();
  writeData(data);

  auditLog(
    {
      action: "student-action:review",
      entityType: "studentAction",
      entityId: numericId,
      payload: { decision: item.status, reviewerId: item.reviewedBy },
    },
    req
  );

  res.json(item);
});

// ------- Notifications Assistant -> Student --------
app.get("/api/notifications", (req, res) => {
  const { toUserId, unread } = req.query;
  const data = readData();
  let items = data.notifications || [];
  if (toUserId) {
    items = items.filter((n) => n.toUserId === toUserId);
  }
  if (unread === "true") {
    items = items.filter((n) => !n.read);
  }
  res.json(items);
});

app.post("/api/notifications", (req, res) => {
  const data = readData();
  const { toUserId, fromUserId, type, title, message, related } = req.body;

  if (!toUserId || !title || !message) {
    return res
      .status(400)
      .json({ error: "toUserId, title, message là bắt buộc" });
  }

  const id = Date.now();
  const notification = {
    id,
    toUserId,
    fromUserId: fromUserId || "assistant-1",
    type: type || "general",
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
    related: related || null,
  };

  data.notifications = data.notifications || [];
  data.notifications.push(notification);
  writeData(data);

  auditLog(
    {
      action: "notification:create",
      entityType: "notification",
      entityId: id,
      payload: notification,
    },
    req
  );

  res.status(201).json(notification);
});

app.post("/api/notifications/:id/read", (req, res) => {
  const data = readData();
  const numericId = Number(req.params.id);
  const item = (data.notifications || []).find(
    (n) => n.id === numericId
  );
  if (!item) {
    return res.status(404).json({ error: "Notification không tồn tại" });
  }
  item.read = true;
  writeData(data);

  res.json(item);
});

app.listen(PORT, () => {
  console.log(`Portal API running on http://localhost:${PORT}`);
});

