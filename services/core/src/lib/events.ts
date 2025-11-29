import { env } from "../config/env";

export interface RoomOccupiedEvent {
  roomId: string;
  classId: string;
  startTime: string;
  endTime: string;
  status: "occupied" | "available";
}

/**
 * Emit event to Service B (realtime service)
 * For now, uses HTTP webhook. Later can be replaced with RabbitMQ/Redis PubSub
 */
export const emitRoomStatusChange = async (event: RoomOccupiedEvent) => {
  if (!env.eventBrokerUrl) {
    // If no broker URL configured, just log (development mode)
    console.log("[event] room.status.change", event);
    return;
  }

  try {
    // For now, assume Service B exposes HTTP endpoint
    // Later: replace with RabbitMQ publish or Redis PubSub
    const response = await fetch(`${env.eventBrokerUrl}/events/room-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error("[event] Failed to emit to Service B", response.statusText);
    } else {
      console.log("[event] Successfully emitted to Service B", event);
    }
  } catch (error) {
    console.error("[event] Error emitting to Service B", error);
    // Don't throw - event emission failure shouldn't break the main flow
  }
};

