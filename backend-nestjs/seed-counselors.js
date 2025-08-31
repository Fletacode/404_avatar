const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
const db = new sqlite3.Database('./database.sqlite');

// 한국 성씨와 이름 풀
const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전'];
const firstNames = ['민준', '서연', '도윤', '하은', '예준', '시우', '주원', '하린', '건우', '유나', '현우', '서현', '민서', '지우', '수아', '지호', '은서', '예원', '지안', '소현',
                   '미영', '정호', '소영', '민수', '지은', '현정', '태현', '유진', '경미', '준호', '선영', '동현', '혜원', '성민', '은정', '재현', '수정', '영수', '혜진', '승현'];

const specialties = ['GRIEF_COUNSELING', 'FAMILY_THERAPY', 'TRAUMA_THERAPY', 'GROUP_THERAPY', 'CHILD_COUNSELING', 'ELDERLY_COUNSELING'];
const relationships = ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'];
const supportLevels = ['HIGH', 'MEDIUM', 'LOW', 'NONE'];
const ageGroups = ['CHILD', 'YOUNG_ADULT', 'MIDDLE_AGED', 'SENIOR'];

const universities = ['서울대학교', '연세대학교', '고려대학교', '이화여자대학교', '성균관대학교', '한양대학교', '중앙대학교', '경희대학교', '부산대학교', '전남대학교'];
const majors = ['심리학과', '상담심리학과', '임상심리학과', '아동학과', '사회복지학과', '정신건강의학과'];
const degrees = ['박사', '석사'];

const experiences = [
  '서울대병원 정신건강의학과', '연세세브란스병원', '삼성서울병원', '서울아산병원', '가톨릭대병원',
  '국립정신건강센터', '한국애도상담센터', '가족상담센터', '트라우마센터', '청소년상담센터',
  '서울시 정신건강센터', '부산시 정신건강센터', '유가족지원센터', '위기상담센터', '생명의전화'
];

// 랜덤 선택 함수
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 랜덤 배열 요소 선택 함수
function getRandomElements(array, count = null) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const numElements = count || Math.floor(Math.random() * 3) + 1; // 1-3개 요소
  return shuffled.slice(0, Math.min(numElements, array.length));
}

// 상담사 데이터 생성 함수
function generateCounselor(index) {
  const lastName = getRandomElement(lastNames);
  const firstName = getRandomElement(firstNames);
  const name = lastName + firstName;
  const specialty = getRandomElement(specialties);
  const experienceYears = Math.floor(Math.random() * 25) + 3; // 3-27년
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5-5.0
  const totalReviews = Math.floor(Math.random() * 200) + 10; // 10-209
  const maxClientsPerDay = Math.floor(Math.random() * 6) + 5; // 5-10
  const currentClientsToday = Math.floor(Math.random() * maxClientsPerDay);
  
  // 전문 관계 선택 (specialty에 따라 조정)
  let specializedRelationships;
  if (specialty === 'CHILD_COUNSELING') {
    specializedRelationships = ['PARENT'];
  } else if (specialty === 'ELDERLY_COUNSELING') {
    specializedRelationships = ['SPOUSE', 'CHILD'];
  } else {
    specializedRelationships = getRandomElements(relationships, Math.floor(Math.random() * 3) + 1);
  }
  
  // 전문 연령대 선택
  let specializedAgeGroups;
  if (specialty === 'CHILD_COUNSELING') {
    specializedAgeGroups = ['CHILD', 'YOUNG_ADULT'];
  } else if (specialty === 'ELDERLY_COUNSELING') {
    specializedAgeGroups = ['MIDDLE_AGED', 'SENIOR'];
  } else {
    specializedAgeGroups = getRandomElements(ageGroups, Math.floor(Math.random() * 3) + 1);
  }
  
  const university = getRandomElement(universities);
  const major = getRandomElement(majors);
  const degree = getRandomElement(degrees);
  const experience1 = getRandomElement(experiences);
  const experience2 = getRandomElement(experiences.filter(exp => exp !== experience1));
  
  return {
    name: name,
    email: `${name.toLowerCase().replace(/\s/g, '')}.counselor${index}@example.com`,
    phone: `010-${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    licenseNumber: `COUN-${2018 + Math.floor(Math.random() * 7)}-${String(index).padStart(3, '0')}`,
    specialty: specialty,
    specializedRelationships: JSON.stringify(specializedRelationships),
    supportLevels: JSON.stringify(getRandomElements(supportLevels, Math.floor(Math.random() * 3) + 1)),
    specializedAgeGroups: JSON.stringify(specializedAgeGroups),
    introduction: `${experienceYears}년 경력의 ${specialty === 'GRIEF_COUNSELING' ? '애도상담' : 
                   specialty === 'FAMILY_THERAPY' ? '가족치료' :
                   specialty === 'TRAUMA_THERAPY' ? '트라우마 치료' :
                   specialty === 'GROUP_THERAPY' ? '집단상담' :
                   specialty === 'CHILD_COUNSELING' ? '아동·청소년 상담' : '노인 상담'} 전문가입니다.`,
    education: `${university} ${major} ${degree}`,
    experience: `${experience1}, ${experience2}`,
    experienceYears: experienceYears,
    rating: parseFloat(rating),
    totalReviews: totalReviews,
    status: Math.random() > 0.1 ? 'AVAILABLE' : 'BUSY', // 90% 가용, 10% 바쁨
    maxClientsPerDay: maxClientsPerDay,
    currentClientsToday: currentClientsToday
  };
}

// 50명의 상담사 데이터 생성
const counselors = [];
for (let i = 1; i <= 50; i++) {
  counselors.push(generateCounselor(i));
}


// 상담사 데이터 삽입
db.serialize(() => {
  // 기존 상담사 데이터 확인
  db.get("SELECT COUNT(*) as count FROM counselors", (err, row) => {
    if (err) {
      console.error('Error checking counselors:', err);
      return;
    }
    
    if (row.count > 0) {
      console.log('상담사 데이터가 이미 존재합니다. 스키핑합니다.');
      db.close();
      return;
    }

    // 상담사 데이터 삽입
    const stmt = db.prepare(`
      INSERT INTO counselors (
        name, email, phone, licenseNumber, specialty, specializedRelationships,
        supportLevels, specializedAgeGroups, introduction, education, experience, experienceYears,
        rating, totalReviews, status, maxClientsPerDay, currentClientsToday,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    counselors.forEach(counselor => {
      stmt.run([
        counselor.name,
        counselor.email,
        counselor.phone,
        counselor.licenseNumber,
        counselor.specialty,
        counselor.specializedRelationships,
        counselor.supportLevels,
        counselor.specializedAgeGroups,
        counselor.introduction,
        counselor.education,
        counselor.experience,
        counselor.experienceYears,
        counselor.rating,
        counselor.totalReviews,
        counselor.status,
        counselor.maxClientsPerDay,
        counselor.currentClientsToday
      ]);
    });

    stmt.finalize();
    
    console.log('상담사 샘플 데이터가 성공적으로 추가되었습니다.');
    console.log(`총 ${counselors.length}명의 상담사가 추가되었습니다.`);
    
    db.close();
  });
});
