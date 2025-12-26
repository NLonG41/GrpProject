import { Router } from "express";
import { prisma } from "../lib/prisma";
import { Role, RequestStatus, RequestType } from "../generated/prisma/enums";
import { requireAssistant } from "../middleware/auth";

const router = Router();

// GET /api/analytics/dashboard - Get dashboard analytics (Assistant only)
router.get("/dashboard", requireAssistant, async (req, res) => {
  console.log("[analytics] GET /api/analytics/dashboard called", {
    userId: req.header("x-user-id"),
    user: req.user?.email
  });

  try {
    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    // Helper function to safely execute queries
    const safeQuery = async <T>(
      queryFn: () => Promise<T>,
      fallback: T,
      sectionName: string
    ): Promise<T> => {
      try {
        return await queryFn();
      } catch (error: any) {
        console.error(`[analytics] Error in ${sectionName}:`, {
          message: error.message,
          code: error.code,
        });
        return fallback;
      }
    };

    // 1. User Statistics
    const userStats = await safeQuery(
      async () => {
        const totalUsers = await prisma.user.count();
        const usersByRole = await prisma.user.groupBy({
          by: ["role"],
          _count: {
            role: true,
          },
        });
        
        const newUsersThisMonth = await prisma.user.count({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        });

        const usersByRoleMap: Record<string, number> = {};
        usersByRole.forEach((item) => {
          usersByRoleMap[item.role] = item._count.role;
        });

        return {
          total: totalUsers,
          byRole: {
            ADMIN: usersByRoleMap[Role.ADMIN] || 0,
            ASSISTANT: usersByRoleMap[Role.ASSISTANT] || 0,
            LECTURER: usersByRoleMap[Role.LECTURER] || 0,
            STUDENT: usersByRoleMap[Role.STUDENT] || 0,
          },
          newThisMonth: newUsersThisMonth,
        };
      },
      {
        total: 0,
        byRole: { ADMIN: 0, ASSISTANT: 0, LECTURER: 0, STUDENT: 0 },
        newThisMonth: 0,
      },
      "User Statistics"
    );

    // 2. Subject Statistics
    const subjectStats = await safeQuery(
      async () => {
        const totalSubjects = await prisma.subject.count();
        const subjectsWithClasses = await prisma.subject.findMany({
          where: {
            classes: {
              some: {
                isActive: true,
              },
            },
          },
        });
        const activeSubjects = subjectsWithClasses.length;
        return { total: totalSubjects, active: activeSubjects };
      },
      { total: 0, active: 0 },
      "Subject Statistics"
    );

    // 3. Class Statistics
    const classStats = await safeQuery(
      async () => {
        const totalClasses = await prisma.class.count();
        const activeClasses = await prisma.class.count({
          where: {
            isActive: true,
          },
        });
        
        // Get all active classes to check which are full
        const activeClassesList = await prisma.class.findMany({
          where: {
            isActive: true,
          },
          select: {
            id: true,
            currentEnrollment: true,
            maxCapacity: true,
          },
        });
        
        const fullClasses = activeClassesList.filter(
          (c) => c.currentEnrollment >= c.maxCapacity
        ).length;
        
        const availableClasses = activeClasses - fullClasses;
        return {
          total: totalClasses,
          active: activeClasses,
          full: fullClasses,
          available: availableClasses,
        };
      },
      { total: 0, active: 0, full: 0, available: 0 },
      "Class Statistics"
    );

    // 4. Enrollment Statistics
    const enrollmentStats = await safeQuery(
      async () => {
        const totalEnrollments = await prisma.enrollment.count();
        const averagePerClass = classStats.total > 0 ? totalEnrollments / classStats.total : 0;

        // Get class with most enrollments
        const classEnrollmentCounts = await prisma.enrollment.groupBy({
          by: ["classId"],
          _count: {
            classId: true,
          },
          orderBy: {
            _count: {
              classId: "desc",
            },
          },
          take: 1,
        });

        let mostEnrolledClass: {
          id: string;
          name: string;
          subjectName: string;
          enrollmentCount: number;
        } | null = null;
        const topEnrollmentCount = classEnrollmentCounts[0];
        if (topEnrollmentCount && topEnrollmentCount.classId) {
          const topClass = await prisma.class.findUnique({
            where: { id: topEnrollmentCount.classId },
            include: {
              subject: {
                select: {
                  name: true,
                },
              },
            },
          });
          if (topClass && topClass.subject) {
            const enrollmentCount = topEnrollmentCount._count?.classId || 0;
            mostEnrolledClass = {
              id: topClass.id,
              name: topClass.name,
              subjectName: topClass.subject.name,
              enrollmentCount: enrollmentCount,
            };
          }
        }

        // Enrollment by Subject
        const enrollmentsBySubject = await prisma.enrollment.findMany({
          include: {
            class: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        const subjectEnrollmentMap: Record<string, { name: string; count: number }> = {};
        enrollmentsBySubject.forEach((enrollment) => {
          // Skip if class or subject is missing
          if (!enrollment.class || !enrollment.class.subject) {
            return;
          }
          const subjectId = enrollment.class.subject.id;
          const subjectName = enrollment.class.subject.name;
          if (!subjectEnrollmentMap[subjectId]) {
            subjectEnrollmentMap[subjectId] = { name: subjectName, count: 0 };
          }
          subjectEnrollmentMap[subjectId].count++;
        });

        const enrollmentBySubject = Object.entries(subjectEnrollmentMap)
          .map(([id, data]) => ({
            subjectId: id,
            subjectName: data.name,
            enrollmentCount: data.count,
          }))
          .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
          .slice(0, 10); // Top 10

        return {
          total: totalEnrollments,
          averagePerClass: Math.round(averagePerClass * 100) / 100,
          mostEnrolledClass: mostEnrolledClass,
          bySubject: enrollmentBySubject,
        };
      },
      {
        total: 0,
        averagePerClass: 0,
        mostEnrolledClass: null,
        bySubject: [],
      },
      "Enrollment Statistics"
    );

    // 5. Request Statistics
    const requestStats = await safeQuery(
      async () => {
        const totalRequests = await prisma.request.count();
        const pendingRequests = await prisma.request.count({
          where: {
            status: RequestStatus.PENDING,
          },
        });
        const approvedRequests = await prisma.request.count({
          where: {
            status: RequestStatus.APPROVED,
          },
        });
        const rejectedRequests = await prisma.request.count({
          where: {
            status: RequestStatus.REJECTED,
          },
        });

        const approvalRate =
          approvedRequests + rejectedRequests > 0
            ? (approvedRequests / (approvedRequests + rejectedRequests)) * 100
            : 0;

        const requestsByType = await prisma.request.groupBy({
          by: ["type"],
          _count: {
            type: true,
          },
        });

        const requestsByTypeMap: Record<string, number> = {};
        requestsByType.forEach((item) => {
          requestsByTypeMap[item.type] = item._count.type;
        });

        return {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          approvalRate: Math.round(approvalRate * 100) / 100,
          byType: {
            REQ_LEAVE: requestsByTypeMap[RequestType.REQ_LEAVE] || 0,
            REQ_MAKEUP: requestsByTypeMap[RequestType.REQ_MAKEUP] || 0,
          },
        };
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        approvalRate: 0,
        byType: { REQ_LEAVE: 0, REQ_MAKEUP: 0 },
      },
      "Request Statistics"
    );

    // 6. Schedule Statistics
    const scheduleStats = await safeQuery(
      async () => {
        const totalSchedulesThisWeek = await prisma.classSchedule.count({
          where: {
            startTime: {
              gte: startOfWeek,
            },
          },
        });

        const totalSchedulesThisMonth = await prisma.classSchedule.count({
          where: {
            startTime: {
              gte: startOfMonth,
            },
          },
        });

        // Get most used room
        const roomUsageCounts = await prisma.classSchedule.groupBy({
          by: ["roomId"],
          _count: {
            roomId: true,
          },
          orderBy: {
            _count: {
              roomId: "desc",
            },
          },
          take: 1,
        });

        let mostUsedRoom: {
          id: string;
          name: string;
          location: string;
          usageCount: number;
        } | null = null;
        const topRoomUsage = roomUsageCounts[0];
        if (topRoomUsage && topRoomUsage.roomId) {
          const topRoom = await prisma.room.findUnique({
            where: { id: topRoomUsage.roomId },
          });
          if (topRoom) {
            const usageCount = topRoomUsage._count?.roomId || 0;
            mostUsedRoom = {
              id: topRoom.id,
              name: topRoom.name,
              location: topRoom.location,
              usageCount: usageCount,
            };
          }
        }

        return {
          totalThisWeek: totalSchedulesThisWeek,
          totalThisMonth: totalSchedulesThisMonth,
          mostUsedRoom: mostUsedRoom,
        };
      },
      {
        totalThisWeek: 0,
        totalThisMonth: 0,
        mostUsedRoom: null,
      },
      "Schedule Statistics"
    );

    const analytics = {
      users: userStats,
      subjects: subjectStats,
      classes: classStats,
      enrollments: enrollmentStats,
      requests: requestStats,
      schedules: scheduleStats,
    };

    console.log(`[analytics] ✅ Dashboard analytics generated successfully`, {
      usersTotal: analytics.users.total,
      subjectsTotal: analytics.subjects.total,
      classesTotal: analytics.classes.total
    });
    res.json(analytics);
  } catch (error: any) {
    console.error("[analytics] ❌ Failed to generate dashboard analytics:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ 
      error: "Failed to generate dashboard analytics",
      message: error.message || "Internal server error"
    });
  }
});

export { router as analyticsRouter };

