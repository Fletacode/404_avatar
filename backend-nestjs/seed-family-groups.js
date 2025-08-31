const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
const db = new sqlite3.Database('./database.sqlite');

// 유가족 그룹 데이터
const familyGroups = [
  {
    name: '배우자를 잃은 분들의 모임',
    description: '배우자를 잃은 슬픔을 함께 나누고 위로받는 공간입니다. 서로의 경험을 나누며 치유의 시간을 가집니다.',
    location: '서울시 강남구 테헤란로 123, 힐링센터 2층',
    meetingType: 'OFFLINE',
    targetRelationships: JSON.stringify(['SPOUSE']),
    targetAgeGroups: JSON.stringify(['MIDDLE_AGED', 'SENIOR']),
    maxMembers: 12,
    currentMembers: 8,
    nextMeetingDate: '2024-02-15 14:00:00',
    leaderName: '김미영 상담사',
    leaderEmail: 'kim.miyoung@example.com',
    leaderPhone: '010-1234-5678',
    status: 'ACTIVE',
    meetingDetails: '매주 목요일 오후 2시, 2시간 진행됩니다. 따뜻한 차와 함께 서로의 이야기를 나누는 시간입니다.',
    requirements: '배우자를 잃은 지 3개월 이상 경과한 분들을 대상으로 합니다.'
  },
  {
    name: '자녀를 떠나보낸 부모들의 만남',
    description: '자녀를 잃은 아픔을 함께 이겨내는 부모들의 자조모임입니다. 전문 상담사와 함께하는 집단상담 프로그램입니다.',
    location: '온라인 (Zoom)',
    meetingType: 'ONLINE',
    targetRelationships: JSON.stringify(['CHILD']),
    targetAgeGroups: JSON.stringify(['MIDDLE_AGED', 'SENIOR']),
    maxMembers: 15,
    currentMembers: 11,
    nextMeetingDate: '2024-02-10 19:00:00',
    leaderName: '박정호 상담사',
    leaderEmail: 'park.jungho@example.com',
    leaderPhone: '010-2345-6789',
    status: 'ACTIVE',
    meetingDetails: '매주 토요일 저녁 7시, 90분간 진행됩니다. 온라인으로 진행되어 전국 어디서나 참여 가능합니다.',
    requirements: '자녀를 잃은 경험이 있는 부모님들을 대상으로 합니다.'
  },
  {
    name: '젊은 유가족들의 힐링 모임',
    description: '20-30대 젊은 유가족들이 함께하는 온라인 모임입니다. 또래들과의 소통을 통해 위로와 힘을 얻습니다.',
    location: '온라인 (Discord)',
    meetingType: 'ONLINE',
    targetRelationships: JSON.stringify(['PARENT', 'SIBLING', 'OTHER']),
    targetAgeGroups: JSON.stringify(['YOUNG_ADULT']),
    maxMembers: 20,
    currentMembers: 14,
    nextMeetingDate: '2024-02-12 20:00:00',
    leaderName: '이소영 상담사',
    leaderEmail: 'lee.soyoung@example.com',
    leaderPhone: '010-3456-7890',
    status: 'ACTIVE',
    meetingDetails: '매주 월요일 저녁 8시, 온라인 채팅과 음성 통화를 통한 자유로운 대화 시간입니다.',
    requirements: '20-35세 젊은 유가족분들을 대상으로 합니다.'
  },
  {
    name: '부모님을 잃은 성인 자녀 모임',
    description: '부모님을 떠나보낸 성인 자녀들의 모임입니다. 효도에 대한 아쉬움과 그리움을 함께 나눕니다.',
    location: '서울시 마포구 홍대입구역 근처 커뮤니티센터',
    meetingType: 'OFFLINE',
    targetRelationships: JSON.stringify(['PARENT']),
    targetAgeGroups: JSON.stringify(['YOUNG_ADULT', 'MIDDLE_AGED']),
    maxMembers: 10,
    currentMembers: 6,
    nextMeetingDate: '2024-02-18 15:00:00',
    leaderName: '최민수 상담사',
    leaderEmail: 'choi.minsu@example.com',
    leaderPhone: '010-4567-8901',
    status: 'ACTIVE',
    meetingDetails: '격주 일요일 오후 3시, 2시간 30분간 진행됩니다. 차담과 함께하는 마음치유 시간입니다.',
    requirements: '부모님을 잃은 지 1개월 이상 경과한 성인 자녀분들을 대상으로 합니다.'
  },
  {
    name: '형제자매를 잃은 분들의 모임',
    description: '형제자매를 잃은 슬픔을 나누는 소중한 공간입니다. 가족 내에서 이해받기 어려운 마음을 함께 나눕니다.',
    location: '부산시 해운대구 센텀시티 상담센터',
    meetingType: 'OFFLINE',
    targetRelationships: JSON.stringify(['SIBLING']),
    targetAgeGroups: JSON.stringify(['YOUNG_ADULT', 'MIDDLE_AGED']),
    maxMembers: 8,
    currentMembers: 5,
    nextMeetingDate: '2024-02-20 18:00:00',
    leaderName: '황지은 상담사',
    leaderEmail: 'hwang.jieun@example.com',
    leaderPhone: '010-5678-9012',
    status: 'ACTIVE',
    meetingDetails: '매월 셋째 화요일 저녁 6시, 3시간 집중 상담 프로그램입니다.',
    requirements: '형제자매를 잃은 경험이 있는 분들을 대상으로 합니다.'
  },
  {
    name: '갑작스런 사고로 가족을 잃은 분들의 모임',
    description: '예상치 못한 사고로 소중한 가족을 잃은 분들을 위한 트라우마 전문 그룹입니다.',
    location: '온라인/오프라인 병행',
    meetingType: 'HYBRID',
    targetRelationships: JSON.stringify(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER']),
    targetAgeGroups: JSON.stringify(['YOUNG_ADULT', 'MIDDLE_AGED', 'SENIOR']),
    maxMembers: 12,
    currentMembers: 7,
    nextMeetingDate: '2024-02-16 16:00:00',
    leaderName: '정혜원 상담사',
    leaderEmail: 'jung.hyewon@example.com',
    leaderPhone: '010-6789-0123',
    status: 'ACTIVE',
    meetingDetails: '매주 금요일 오후 4시, 온라인 참여 또는 서울 강남 센터 직접 방문 가능합니다.',
    requirements: '갑작스런 사고나 사건으로 가족을 잃은 분들을 대상으로 합니다.'
  },
  {
    name: '시니어 유가족 돌봄 모임',
    description: '60세 이상 어르신들을 위한 전용 유가족 모임입니다. 연령대에 맞는 프로그램으로 진행됩니다.',
    location: '서울시 종로구 탑골공원 인근 경로당',
    meetingType: 'OFFLINE',
    targetRelationships: JSON.stringify(['SPOUSE', 'CHILD']),
    targetAgeGroups: JSON.stringify(['SENIOR']),
    maxMembers: 15,
    currentMembers: 12,
    nextMeetingDate: '2024-02-14 13:00:00',
    leaderName: '강순희 상담사',
    leaderEmail: 'kang.sunhee@example.com',
    leaderPhone: '010-7890-1234',
    status: 'ACTIVE',
    meetingDetails: '매주 수요일 오후 1시, 어르신들께 친숙한 환경에서 차담과 함께 진행됩니다.',
    requirements: '60세 이상 어르신 유가족분들을 대상으로 합니다.'
  },
  {
    name: '펜팔 및 편지쓰기 치유 모임',
    description: '직접 만나기 어려운 분들을 위한 펜팔과 편지쓰기를 통한 마음치유 프로그램입니다.',
    location: '전국 (우편)',
    meetingType: 'ONLINE',
    targetRelationships: JSON.stringify(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER']),
    targetAgeGroups: JSON.stringify(['YOUNG_ADULT', 'MIDDLE_AGED', 'SENIOR']),
    maxMembers: 25,
    currentMembers: 18,
    nextMeetingDate: '2024-02-11 10:00:00',
    leaderName: '안미경 상담사',
    leaderEmail: 'ahn.mikyoung@example.com',
    leaderPhone: '010-8901-2345',
    status: 'ACTIVE',
    meetingDetails: '월 1회 온라인 모임과 주 1회 편지 교환을 통한 프로그램입니다.',
    requirements: '편지쓰기를 통한 마음치유에 관심이 있는 모든 유가족분들을 대상으로 합니다.'
  }
];

// 유가족 그룹 데이터 삽입
db.serialize(() => {
  // 기존 유가족 그룹 데이터 확인
  db.get("SELECT COUNT(*) as count FROM family_groups", (err, row) => {
    if (err) {
      console.error('Error checking family groups:', err);
      return;
    }
    
    if (row && row.count > 0) {
      console.log('유가족 그룹 데이터가 이미 존재합니다. 스키핑합니다.');
      db.close();
      return;
    }

    // 유가족 그룹 데이터 삽입
    const stmt = db.prepare(`
      INSERT INTO family_groups (
        name, description, location, meetingType, targetRelationships,
        targetAgeGroups, maxMembers, currentMembers, nextMeetingDate,
        leaderName, leaderEmail, leaderPhone, status, meetingDetails,
        requirements, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    familyGroups.forEach(group => {
      stmt.run([
        group.name,
        group.description,
        group.location,
        group.meetingType,
        group.targetRelationships,
        group.targetAgeGroups,
        group.maxMembers,
        group.currentMembers,
        group.nextMeetingDate,
        group.leaderName,
        group.leaderEmail,
        group.leaderPhone,
        group.status,
        group.meetingDetails,
        group.requirements
      ]);
    });

    stmt.finalize();
    
    console.log('유가족 그룹 샘플 데이터가 성공적으로 추가되었습니다.');
    console.log(`총 ${familyGroups.length}개의 유가족 그룹이 추가되었습니다.`);
    
    db.close();
  });
});
