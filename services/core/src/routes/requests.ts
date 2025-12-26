import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { RequestType, RequestStatus } from "../generated/prisma/enums";
import { requireAssistant } from "../middleware/auth";

const router = Router();

// Debug endpoint to test database connection
router.get("/debug", async (req, res) => {
  try {
    const count = await prisma.request.count();
    const sample = await prisma.request.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      count,
      sample: sample ? { id: sample.id, senderId: sample.senderId, type: sample.type, status: sample.status } : null,
      message: "Database connection OK"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

const createRequestSchema = z.object({
  senderId: z.string().min(1),
  type: z.enum(["REQ_LEAVE", "REQ_MAKEUP"]),
  payload: z.record(z.string(), z.unknown()), // z.record needs keyType and valueType
});

const updateRequestSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  adminNote: z.string().optional(),
});

// GET /api/requests - List all requests (with optional filters)
router.get("/", async (req, res) => {
  const { status, type, senderId } = req.query;
  console.log("[requests] GET /api/requests called", { status, type, senderId });

  try {
    // First, get requests without sender relation to avoid foreign key issues
    const requests = await prisma.request.findMany({
      where: {
        ...(status && { status: status as RequestStatus }),
        ...(type && { type: type as RequestType }),
        ...(senderId && { senderId: senderId as string }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[requests] ✅ Found ${requests.length} requests (base query)`);

    // Then, fetch sender data for each request individually (graceful handling)
    const requestsWithSender = await Promise.all(
      requests.map(async (req) => {
        try {
          const sender = await prisma.user.findUnique({
            where: { id: req.senderId },
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          });
          return {
            ...req,
            sender: sender || null,
          };
        } catch (err: any) {
          console.warn(`[requests] ⚠️ Could not fetch sender for request ${req.id}:`, err.message);
          return {
            ...req,
            sender: null,
          };
        }
      })
    );

    console.log(`[requests] ✅ Returning ${requestsWithSender.length} requests`);
    res.json(requestsWithSender);
  } catch (error: any) {
    console.error("[requests] ❌ Failed to fetch requests:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ 
      error: "Failed to fetch requests",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/requests/:id - Get request by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[requests] GET /api/requests/:id called", { id });

  try {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    console.log(`[requests] ✅ Found request: ${request.id}`);
    res.json(request);
  } catch (error: any) {
    console.error("[requests] ❌ Failed to fetch request:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch request" });
  }
});

// POST /api/requests - Create new request
router.post("/", async (req, res) => {
  console.log("[requests] POST /api/requests called", req.body);
  
  const parseResult = createRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[requests] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { senderId, type, payload } = parseResult.data;

  try {
    // Verify sender exists
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
    });
    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const request = await prisma.request.create({
      data: {
        senderId,
        type: type as RequestType,
        payload: payload as any, // Cast to Prisma.JsonValue type
        status: RequestStatus.PENDING,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`[requests] ✅ Created request: ${request.id}`);
    res.status(201).json(request);
  } catch (error: any) {
    console.error("[requests] ❌ Failed to create request:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create request" });
  }
});

// PUT /api/requests/:id - Update request status (Assistant only)
router.put("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Request ID is required" });
  }
  console.log("[requests] PUT /api/requests/:id called", { id, body: req.body });

  const parseResult = updateRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[requests] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { status, adminNote } = parseResult.data;

  try {
    // Build update object, only including fields that are defined (not undefined)
    const prismaUpdateData: {
      status: RequestStatus;
      adminNote?: string | null;
    } = {
      status: status as RequestStatus,
    };
    
    if (adminNote !== undefined) {
      prismaUpdateData.adminNote = adminNote || null;
    }

    const request = await prisma.request.update({
      where: { id: id as string },
      data: prismaUpdateData,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`[requests] ✅ Updated request: ${request.id} to status ${status}`);
    res.json(request);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Request not found" });
    }
    console.error("[requests] ❌ Failed to update request:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update request" });
  }
});

// DELETE /api/requests/:id - Delete request
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[requests] DELETE /api/requests/:id called", { id });

  try {
    await prisma.request.delete({
      where: { id },
    });

    console.log(`[requests] ✅ Deleted request: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Request not found" });
    }
    console.error("[requests] ❌ Failed to delete request:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete request" });
  }
});

export { router as requestsRouter };

