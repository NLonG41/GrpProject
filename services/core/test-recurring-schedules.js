// Test recurring schedule creation logic (WEEKLY_DAYS)
// Run: node test-recurring-schedules.js
// Required env:
//   ASSISTANT_ID=<assistant-or-admin-user-id>
// Optional env:
//   CORE_API_URL=http://localhost:4000
//   CLASS_ID=<specific class id>
//   ROOM_ID=<specific room id>
//   CLEANUP=true   (delete created schedules after assertion)

const BASE_URL = process.env.CORE_API_URL || 'http://localhost:4000';
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const CLEANUP = String(process.env.CLEANUP || 'false').toLowerCase() === 'true';

if (!ASSISTANT_ID) {
  console.error('❌ Missing ASSISTANT_ID env var');
  process.exit(1);
}

function toVnDate(dateLike) {
  const d = new Date(dateLike);
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  return new Date(d.getTime() + vnOffsetMs);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} | ${JSON.stringify(data)}`);
  }
  return data;
}

async function getClassId() {
  if (process.env.CLASS_ID) return process.env.CLASS_ID;
  const classes = await fetchJson(`${BASE_URL}/api/classes`);
  if (!Array.isArray(classes) || classes.length === 0) {
    throw new Error('No classes found. Please provide CLASS_ID manually.');
  }
  return classes[0].id;
}

async function getRoomId() {
  if (process.env.ROOM_ID) return process.env.ROOM_ID;
  const rooms = await fetchJson(`${BASE_URL}/api/rooms`);
  if (!Array.isArray(rooms) || rooms.length === 0) {
    throw new Error('No rooms found. Please provide ROOM_ID manually.');
  }
  const availableRoom = rooms.find((r) => !r.isMaintenance) || rooms[0];
  return availableRoom.id;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function main() {
  console.log('=== Recurring Schedule Test (T2, T4, T6 | 08:30-10:30 | 10 sessions) ===');
  console.log('Base URL:', BASE_URL);

  const classId = await getClassId();
  const roomId = await getRoomId();

  const payload = {
    classId,
    roomId,
    type: 'MAIN',
    repeatType: 'WEEKLY_DAYS',
    repeatDaysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    startTime: '2026-02-27T08:30:00+07:00',
    endTime: '2026-03-27T10:30:00+07:00',
    repeatEndDate: '2026-03-27T10:30:00+07:00',
    startTimeOfDay: '08:30',
    endTimeOfDay: '10:30',
    numberOfSessions: 10,
  };

  console.log('Creating recurring schedule with payload:', payload);

  const created = await fetchJson(`${BASE_URL}/api/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ASSISTANT_ID,
    },
    body: JSON.stringify(payload),
  });

  const createdSchedules = Array.isArray(created?.schedules)
    ? created.schedules
    : created?.id
      ? [created]
      : [];

  assert(createdSchedules.length === 10, `expected 10 sessions, got ${createdSchedules.length}`);

  const expectedDays = new Set([1, 3, 5]); // VN local: Mon/Wed/Fri

  for (const [index, s] of createdSchedules.entries()) {
    assert(s.startTime && s.endTime, `session #${index + 1} missing startTime/endTime`);

    const startUtc = new Date(s.startTime);
    const endUtc = new Date(s.endTime);
    const startVn = toVnDate(startUtc);
    const endVn = toVnDate(endUtc);

    const day = startVn.getUTCDay();
    const hour = startVn.getUTCHours();
    const minute = startVn.getUTCMinutes();
    const durationMs = endUtc.getTime() - startUtc.getTime();

    assert(expectedDays.has(day), `session #${index + 1} day=${day} is not Mon/Wed/Fri`);
    assert(hour === 8 && minute === 30, `session #${index + 1} starts at ${hour}:${minute}, expected 08:30`);
    assert(durationMs === 2 * 60 * 60 * 1000, `session #${index + 1} duration is not 2 hours`);

    // Ensure no weekend
    assert(day !== 0 && day !== 6, `session #${index + 1} falls on weekend`);

    console.log(
      `✅ #${index + 1} | start=${startVn.toISOString().replace('T', ' ').slice(0, 16)} (VN) | day=${day}`
    );
  }

  console.log('🎉 PASS: recurring schedule generation is correct.');

  if (CLEANUP) {
    console.log('Cleanup enabled. Deleting created schedules...');
    for (const s of createdSchedules) {
      await fetchJson(`${BASE_URL}/api/schedules/${s.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': ASSISTANT_ID,
        },
      });
      console.log(`🗑️ deleted ${s.id}`);
    }
    console.log('Cleanup complete.');
  }
}

main().catch((err) => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
