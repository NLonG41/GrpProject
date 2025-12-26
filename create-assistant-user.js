/**
 * Script để tạo Assistant user trong cả database và Firebase Auth
 */

const BASE_URL = 'http://localhost:4000';

async function createAssistantUser() {
  const userData = {
    fullName: 'Academic Assistant',
    email: 'assistant@usth.edu.vn',
    password: 'USTH@123',
    role: 'ASSISTANT'
  };

  console.log('🔐 Tạo Assistant user...\n');
  console.log('📋 Thông tin user:');
  console.log(`   Email: ${userData.email}`);
  console.log(`   Password: ${userData.password}`);
  console.log(`   Role: ${userData.role}\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ User đã được tạo thành công!\n');
    console.log('📝 Chi tiết:');
    console.log(`   ID: ${result.user.id}`);
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Full Name: ${result.user.fullName}`);
    console.log(`   Role: ${result.user.role}\n`);
    
    console.log('🎉 Bây giờ bạn có thể đăng nhập:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${userData.password}\n`);
    
    console.log('💡 Lưu ý:');
    console.log('   - User đã được tạo trong cả database và Firebase Auth');
    console.log('   - Có thể đăng nhập ngay qua frontend');
    console.log('   - Vào http://localhost:5173 và đăng nhập\n');

  } catch (error) {
    console.error('❌ Lỗi khi tạo user:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 User đã tồn tại!');
      console.log('   - Có thể user đã được tạo trước đó');
      console.log('   - Thử đăng nhập với email/password trên');
      console.log('   - Hoặc tạo user với email khác\n');
    } else {
      console.log('\n💡 Kiểm tra:');
      console.log('   - Backend có đang chạy không? (http://localhost:4000/health)');
      console.log('   - Firebase config có đúng không?');
      console.log('   - Database connection có OK không?\n');
    }
  }
}

createAssistantUser();


