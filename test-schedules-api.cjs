/**
 * Test script for Schedules API
 * Run with: node test-schedules-api.cjs
 */

const CORE_API = process.env.CORE_API || 'http://localhost:4000'

async function testSchedulesAPI() {
  console.log('🧪 Testing Schedules API...\n')
  console.log(`API Base URL: ${CORE_API}\n`)

  // Test 1: Get all schedules
  console.log('📋 Test 1: GET /api/schedules (all schedules)')
  try {
    const res1 = await fetch(`${CORE_API}/api/schedules`)
    const data1 = await res1.json()
    console.log(`   Status: ${res1.status}`)
    console.log(`   Count: ${Array.isArray(data1) ? data1.length : 'N/A'}`)
    if (!res1.ok) {
      console.log(`   ❌ Error:`, data1)
    } else {
      console.log(`   ✅ Success`)
    }
  } catch (error) {
    console.log(`   ❌ Exception:`, error.message)
  }
  console.log()

  // Test 2: Get active schedules
  console.log('📋 Test 2: GET /api/schedules?status=ACTIVE')
  try {
    const res2 = await fetch(`${CORE_API}/api/schedules?status=ACTIVE`)
    const data2 = await res2.json()
    console.log(`   Status: ${res2.status}`)
    console.log(`   Count: ${Array.isArray(data2) ? data2.length : 'N/A'}`)
    if (!res2.ok) {
      console.log(`   ❌ Error:`, data2)
    } else {
      console.log(`   ✅ Success`)
      if (Array.isArray(data2) && data2.length > 0) {
        console.log(`   Sample schedule:`, {
          id: data2[0].id,
          className: data2[0].class?.name,
          subjectName: data2[0].class?.subject?.name,
          roomName: data2[0].room?.name,
          startTime: data2[0].startTime,
          endTime: data2[0].endTime,
          status: data2[0].status,
        })
      }
    }
  } catch (error) {
    console.log(`   ❌ Exception:`, error.message)
  }
  console.log()

  // Test 3: Get cancelled schedules
  console.log('📋 Test 3: GET /api/schedules?status=CANCELLED')
  try {
    const res3 = await fetch(`${CORE_API}/api/schedules?status=CANCELLED`)
    const data3 = await res3.json()
    console.log(`   Status: ${res3.status}`)
    console.log(`   Count: ${Array.isArray(data3) ? data3.length : 'N/A'}`)
    if (!res3.ok) {
      console.log(`   ❌ Error:`, data3)
    } else {
      console.log(`   ✅ Success`)
    }
  } catch (error) {
    console.log(`   ❌ Exception:`, error.message)
  }
  console.log()

  // Test 4: Get schedules with invalid status
  console.log('📋 Test 4: GET /api/schedules?status=INVALID')
  try {
    const res4 = await fetch(`${CORE_API}/api/schedules?status=INVALID`)
    const data4 = await res4.json()
    console.log(`   Status: ${res4.status}`)
    if (!res4.ok) {
      console.log(`   ✅ Expected error:`, data4)
    } else {
      console.log(`   ⚠️  Should have failed but didn't`)
    }
  } catch (error) {
    console.log(`   ❌ Exception:`, error.message)
  }
  console.log()

  // Test 5: Get schedules by type
  console.log('📋 Test 5: GET /api/schedules?type=MAIN')
  try {
    const res5 = await fetch(`${CORE_API}/api/schedules?type=MAIN`)
    const data5 = await res5.json()
    console.log(`   Status: ${res5.status}`)
    console.log(`   Count: ${Array.isArray(data5) ? data5.length : 'N/A'}`)
    if (!res5.ok) {
      console.log(`   ❌ Error:`, data5)
    } else {
      console.log(`   ✅ Success`)
    }
  } catch (error) {
    console.log(`   ❌ Exception:`, error.message)
  }
  console.log()

  // Test 6: Check room availability
  console.log('📋 Test 6: GET /api/rooms/:id/availability')
  try {
    // First get a room
    const roomsRes = await fetch(`${CORE_API}/api/rooms`)
    if (!roomsRes.ok) {
      console.log(`   ⚠️  Cannot fetch rooms: ${roomsRes.status}`)
    } else {
      const rooms = await roomsRes.json()
      
      if (Array.isArray(rooms) && rooms.length > 0) {
        const roomId = rooms[0].id
        const startTime = new Date().toISOString()
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        
        const url = `${CORE_API}/api/rooms/${roomId}/availability?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
        console.log(`   Testing room: ${roomId} (${rooms[0].name})`)
        console.log(`   Time range: ${startTime} to ${endTime}`)
        
        const res6 = await fetch(url)
        if (res6.headers.get('content-type')?.includes('application/json')) {
          const data6 = await res6.json()
          console.log(`   Status: ${res6.status}`)
          if (!res6.ok) {
            console.log(`   ❌ Error:`, data6)
          } else {
            console.log(`   ✅ Success`)
            console.log(`   Room available: ${data6.isAvailable}`)
            console.log(`   Room locked: ${data6.isLocked}`)
            if (data6.conflictingSchedule) {
              console.log(`   Conflict:`, data6.conflictingSchedule)
            }
          }
        } else {
          const text = await res6.text()
          console.log(`   Status: ${res6.status}`)
          console.log(`   ⚠️  Response is not JSON: ${text.substring(0, 100)}`)
        }
      } else {
        console.log(`   ⚠️  No rooms found to test`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Exception:`, error.message)
  }
  console.log()

  console.log('✅ Testing completed!')
}

// Run tests
testSchedulesAPI().catch(console.error)

