/**
 * 호박(Hobak) 중고거래 웹서비스 - 공통 데이터 및 Supabase 4개 테이블 실시간 연동 스토어 (mock-data.js)
 *
 * [연동된 Supabase PII-Free 테이블 구조]
 * 1. public.profiles         : 익명 판매자 프로필 (id UUID, nickname, location_dong, manner_temp, avatar_url)
 * 2. public.items            : 중고거래 상품 매물 (id, seller_id, title, category, price, status, hobak_pay, images, description, size, is_bumped, time_ago, likes_count, chats_count, views_count)
 * 3. public.item_likes       : 익명 클라이언트 UUID 기반 관심(하트) 내역 (id, item_id, client_anon_id)
 * 4. public.popular_keywords : 인기 검색어 태그 (id, keyword, search_count, display_order)
 *
 * 보안 원칙: 이메일·전화번호·실명 등 개인 식별 정보(PII)는 저장하지 않으며,
 * SUPABASE_SERVICE_ROLE_KEY는 .env에서만 관리하고 프론트엔드 코드에는 공개 anon key만 사용합니다.
 */

const HOBAK_STORAGE_KEY = 'hobak_market_items_v1';
const HOBAK_LIKES_KEY = 'hobak_market_liked_ids_v1';
const HOBAK_CLIENT_UUID_KEY = 'hobak_client_anon_uuid_v1';

const SUPABASE_CONFIG = {
  projectRef: 'ntnvttihrxhfuwuzgutf',
  url: 'https://ntnvttihrxhfuwuzgutf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50bnZ0dGlocnhoZnV3dXpndXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MjgyNTksImV4cCI6MjExMDQwNDI1OX0.9uou3l9_Kz156yJET09t07TD6j5U3y0Giby-2axvndo',
  tables: {
    profiles: 'profiles',
    items: 'items',
    itemLikes: 'item_likes',
    popularKeywords: 'popular_keywords'
  }
};

function getOrCreateClientAnonId() {
  try {
    let uuid = localStorage.getItem(HOBAK_CLIENT_UUID_KEY);
    if (uuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
      return uuid;
    }
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      uuid = window.crypto.randomUUID();
    } else {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem(HOBAK_CLIENT_UUID_KEY, uuid);
    return uuid;
  } catch (e) {
    return '00000000-0000-4000-a000-000000000099';
  }
}

const INITIAL_HOBAK_ITEMS = [
  {
    id: 1,
    sellerId: '00000000-0000-4000-a000-000000000001',
    title: '나이키 에어 조던 1 하이 다크 모카 270mm',
    category: '남성패션/잡화',
    isBumped: true,
    timeAgo: '끌올 1시간 전',
    price: 100000,
    status: '거래가능',
    hobakPay: true,
    size: '270',
    seller: {
      nickname: '락락',
      location: '부산 중구 대청동4가',
      mannerTemp: 50.2
    },
    description: `매력적인 나이키 에어 조던 1 하이 다크 모카를 소개해요. 깔끔한 디자인과 편안한 착용감으로 어떤 코디에도 잘 어울려요. 박스와 함께 보내드려요. 이 신발은 당신의 스타일을 한층 더 업그레이드 시켜줄 거예요.

나코탭 포함 풀구성
밑창 새거에 업체 보강맡겨두고 신발에 손이 잘 안가서 판매합니다 상태아주좋아요
궁금한점 바로구매 후 편하게 문의주세요`,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 24,
    chats: 6,
    views: 312,
    createdAt: '2026-11-16T18:55:00+09:00'
  },
  {
    id: 2,
    sellerId: '00000000-0000-4000-a000-000000000002',
    title: '삼성 갤럭시 S24 울트라 256G 화이트 자급제',
    category: '디지털기기',
    isBumped: false,
    timeAgo: '20분 전',
    price: 950000,
    status: '거래가능',
    hobakPay: true,
    size: '256GB / S급',
    seller: {
      nickname: '단호박왕',
      location: '부산 중구 중앙동4가',
      mannerTemp: 44.8
    },
    description: `삼성 스토어에서 구매한 갤럭시 S24 울트라 256GB 티타늄 화이트 자급제 모델입니다.

구매 직후 강화유리 필름과 정품 케이스를 장착해 찍힘이나 생활기스 전혀 없는 S급 컨디션입니다.
배터리 성능 최상이며 박스 및 미사용 케이블 풀박스로 드립니다.`,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 19,
    chats: 4,
    views: 198,
    createdAt: '2026-11-16T19:35:00+09:00'
  },
  {
    id: 3,
    sellerId: '00000000-0000-4000-a000-000000000003',
    title: '크림 아이보리 덕다운 푸퍼 숏패딩 (Free)',
    category: '여성패션/잡화',
    isBumped: false,
    timeAgo: '45분 전',
    price: 45000,
    status: '거래가능',
    hobakPay: true,
    size: 'Free (55~66)',
    seller: {
      nickname: '따뜻한겨울',
      location: '부산 중구 남포동',
      mannerTemp: 39.5
    },
    description: `포근한 크림 아이보리 컬러의 덕다운 푸퍼 숏패딩입니다.
핏이 부해 보이지 않고 깔끔하게 떨어져서 겨울 데일리 아우터로 딱 좋아요.

작년 시즌 백화점에서 구매 후 3회 착용하고 전문 세탁 완료해 두었습니다. 오염이나 하자 전혀 없어요!`,
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 14,
    chats: 2,
    views: 145,
    createdAt: '2026-11-16T19:10:00+09:00'
  },
  {
    id: 4,
    sellerId: '00000000-0000-4000-a000-000000000004',
    title: '포터 탱커 미니 숄더백 크로스백 블랙',
    category: '남성패션/잡화',
    isBumped: true,
    timeAgo: '끌올 2시간 전',
    price: 135000,
    status: '거래가능',
    hobakPay: true,
    size: '24 x 16cm',
    seller: {
      nickname: '모던보이',
      location: '부산 중구 부평동2가',
      mannerTemp: 46.1
    },
    description: `도쿄 여행 중 매장에서 직접 구매한 요시다 포터 탱커 미니 크로스백 블랙입니다.
가볍고 수납공간이 알차서 지갑, 휴대폰, 보조배터리, 에어팟 넣기 최고예요.

로고 라벨 해짐 전혀 없고 내부 오렌지 안감도 깨끗합니다.`,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 31,
    chats: 7,
    views: 289,
    createdAt: '2026-11-16T17:50:00+09:00'
  },
  {
    id: 5,
    sellerId: '00000000-0000-4000-a000-000000000005',
    title: '가민 포러너 265 러닝 스마트워치 블랙 풀박스',
    category: '스포츠/레저',
    isBumped: false,
    timeAgo: '3시간 전',
    price: 380000,
    status: '거래가능',
    hobakPay: true,
    size: '46mm',
    seller: {
      nickname: '런닝메이트',
      location: '부산 중구 광복동',
      mannerTemp: 61.4
    },
    description: `마라톤 대회 준비용으로 구매했던 가민 포러너 265 한글 정품입니다.
AMOLED 디스플레이가 정말 선명하고 GPS 정확도가 뛰어납니다.

액정 보호필름 부착 상태이며 정품 충전케이블, 여분 스트랩, 박스 모두 포함해 드립니다.`,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 27,
    chats: 5,
    views: 260,
    createdAt: '2026-11-16T16:45:00+09:00'
  },
  {
    id: 6,
    sellerId: '00000000-0000-4000-a000-000000000006',
    title: '쿠쿠 6인용 IH 전기압력밥솥 실버 (내솥 깨끗)',
    category: '생활가전',
    isBumped: false,
    timeAgo: '4시간 전',
    price: 80000,
    status: '거래가능',
    hobakPay: false,
    size: '6인용',
    seller: {
      nickname: '살림고수',
      location: '부산 중구 보수동1가',
      mannerTemp: 48.0
    },
    description: `1인 가구에서 주말에만 가끔 사용하던 쿠쿠 6인용 IH 전기압력밥솥입니다.
내솥 코팅 벗겨짐 전혀 없고 고무패킹도 최근에 새것으로 교체했습니다.

자동 스팀세척 완료해 두었으며 밥맛 정말 좋습니다.`,
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 9,
    chats: 3,
    views: 112,
    createdAt: '2026-11-16T15:30:00+09:00'
  },
  {
    id: 7,
    sellerId: '00000000-0000-4000-a000-000000000007',
    title: '폴로 랄프로렌 기모 후드 집업 네이비 L',
    category: '남성패션/잡화',
    isBumped: false,
    timeAgo: '5시간 전',
    price: 55000,
    status: '거래가능',
    hobakPay: true,
    size: 'L (100~105)',
    seller: {
      nickname: '빈티지러버',
      location: '부산 중구 동광동',
      mannerTemp: 39.2
    },
    description: `폴로 랄프로렌 백화점 매장판 정품 기모 후드 집업 네이비 색상입니다.
유행 타지 않는 클래식한 디자인이라 청바지나 조거팬츠 어디에나 잘 어울려요.

시보리 늘어남이나 색바램 없이 상태 깔끔합니다.`,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 16,
    chats: 2,
    views: 174,
    createdAt: '2026-11-16T14:20:00+09:00'
  },
  {
    id: 8,
    sellerId: '00000000-0000-4000-a000-000000000008',
    title: '아크네 스타일 버건디 울 100% 체크 머플러 목도리',
    category: '여성패션/잡화',
    isBumped: false,
    timeAgo: '6시간 전',
    price: 32000,
    status: '거래가능',
    hobakPay: true,
    size: '200 x 45cm',
    seller: {
      nickname: '가을산책',
      location: '부산 중구 대청동4가',
      mannerTemp: 37.8
    },
    description: `고급스러운 버건디 와인 색상의 울 100% 머플러입니다.
까슬거림 없이 부드러운 촉감이고 폭이 넉넉해서 겨울 코트에 포인트 주기 좋아요.

드라이클리닝 완료 후 보관 중입니다.`,
    images: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 11,
    chats: 1,
    views: 95,
    createdAt: '2026-11-16T13:10:00+09:00'
  },
  {
    id: 9,
    sellerId: '00000000-0000-4000-a000-000000000009',
    title: '크레모아 팬 V600+ 캠핑 타프팬 & 전용 하드케이스',
    category: '스포츠/레저',
    isBumped: false,
    timeAgo: '어제',
    price: 35000,
    status: '거래가능',
    hobakPay: true,
    size: 'V600+ 풀세트',
    seller: {
      nickname: '캠핑호박',
      location: '부산 중구 영주동',
      mannerTemp: 53.6
    },
    description: `감성 캠핑용으로 구매해 2회 사용한 크레모아 V600+ 서큘레이터입니다.
전용 수납 하드케이스까지 함께 세트로 드립니다.

삼각대 다리, 본체, C타입 충전선 모두 깨끗하게 보관 중입니다.`,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 22,
    chats: 4,
    views: 210,
    createdAt: '2026-11-15T20:00:00+09:00'
  },
  {
    id: 10,
    sellerId: '00000000-0000-4000-a000-000000000010',
    title: '블랙앤화이트 체커보드 패딩 숄더백 보부상 가방',
    category: '여성패션/잡화',
    isBumped: false,
    timeAgo: '2일 전',
    price: 24000,
    status: '예약중',
    hobakPay: true,
    size: '34 x 25cm',
    seller: {
      nickname: '체크메이트',
      location: '부산 중구 중앙동4가',
      mannerTemp: 41.0
    },
    description: `유니크한 체커보드 패턴의 폭신한 패딩 숄더백입니다.
아이패드와 파우치, 텀블러까지 거뜬히 들어가는 보부상 가방이에요.

가볍고 데일리룩에 포인트로 메기 정말 귀엽습니다!`,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85'
    ],
    likes: 15,
    chats: 3,
    views: 163,
    createdAt: '2026-11-14T18:00:00+09:00'
  }
];

const HOBAK_CATEGORIES = [
  '전체',
  '남성패션/잡화',
  '여성패션/잡화',
  '디지털기기',
  '생활가전',
  '스포츠/레저',
  '가구/인테리어',
  '취미/게임/음반',
  '도서/티켓/문구'
];

const HOBAK_POPULAR_KEYWORDS = [
  '나이키', '조던', '갤럭시', '패딩', '포터', '가민',
  '아이폰', '밥솥', '폴로', '캠핑', '머플러', '가방'
];

const HOBAK_LOCATIONS = [
  '부산 중구 전체',
  '부산 중구 중앙동4가',
  '부산 중구 대청동4가',
  '부산 중구 남포동',
  '부산 중구 부평동2가',
  '부산 중구 광복동',
  '부산 중구 보수동1가',
  '부산 중구 동광동',
  '부산 중구 영주동'
];

function mapRowFromItemsTable(row) {
  const profileObj = row.profiles && typeof row.profiles === 'object' ? row.profiles : null;
  return {
    id: Number(row.id),
    sellerId: row.seller_id || null,
    title: row.title || '제목 없는 호박 매물',
    category: row.category || '남성패션/잡화',
    isBumped: Boolean(row.is_bumped),
    timeAgo: row.time_ago || '방금 전',
    price: Number(row.price) || 0,
    status: row.status || '거래가능',
    hobakPay: row.hobak_pay !== undefined ? Boolean(row.hobak_pay) : true,
    size: row.size || 'FREE',
    seller: {
      nickname: (profileObj && profileObj.nickname) || row.seller_nickname || '락락',
      location: (profileObj && profileObj.location_dong) || row.seller_location || '부산 중구 대청동4가',
      mannerTemp: Number((profileObj && profileObj.manner_temp) || row.seller_manner_temp) || 50.2
    },
    description: row.description || '',
    images: Array.isArray(row.images) ? row.images : [],
    likes: Number(row.likes_count !== undefined ? row.likes_count : row.likes) || 0,
    chats: Number(row.chats_count !== undefined ? row.chats_count : row.chats) || 0,
    views: Number(row.views_count !== undefined ? row.views_count : row.views) || 1,
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapItemToItemsTableRow(item, includeId = true) {
  const row = {
    seller_id: item.sellerId || null,
    seller_nickname: (item.seller && item.seller.nickname) || '락락',
    seller_location: (item.seller && item.seller.location) || '부산 중구 대청동4가',
    seller_manner_temp: Number(item.seller && item.seller.mannerTemp) || 50.2,
    title: item.title,
    category: item.category || '남성패션/잡화',
    price: Number(item.price) || 0,
    status: item.status || '거래가능',
    hobak_pay: Boolean(item.hobakPay),
    images: Array.isArray(item.images) ? item.images : [],
    description: item.description || '',
    size: item.size || 'FREE',
    is_bumped: Boolean(item.isBumped),
    time_ago: item.timeAgo || '방금 전',
    likes_count: Number(item.likes) || 0,
    chats_count: Number(item.chats) || 0,
    views_count: Number(item.views) || 1,
    created_at: item.createdAt || new Date().toISOString()
  };
  if (includeId && item.id !== undefined) {
    row.id = Number(item.id);
  }
  return row;
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_CONFIG.anonKey,
    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

function updateSupabaseStatusBadge(connected, itemCount) {
  let badge = document.getElementById('hobakSupabaseStatusBadge');
  if (!badge) {
    const target =
      document.querySelector('.hobak-global-brand') ||
      document.querySelector('.ag-control-dock') ||
      document.querySelector('.hobak-header-top');
    if (target) {
      badge = document.createElement('button');
      badge.type = 'button';
      badge.id = 'hobakSupabaseStatusBadge';
      badge.style.cssText =
        'display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid rgba(64,192,87,0.35);background:rgba(64,192,87,0.14);color:#2B8A3E;transition:all 0.2s ease;';
      badge.title = '클릭하여 Supabase DB(profiles, items, item_likes, popular_keywords) 즉시 동기화';
      badge.addEventListener('click', () => {
        HobakStore.syncFromSupabase(true);
      });
      target.appendChild(badge);
    }
  }
  if (badge) {
    const inDarkBar = Boolean(badge.closest('.hobak-global-bar'));
    if (connected) {
      badge.innerHTML = `<span>🟢</span><span>Supabase DB 연동됨 (${itemCount || 10}건)</span>`;
      badge.style.borderColor = 'rgba(64, 192, 87, 0.45)';
      badge.style.background = 'rgba(64, 192, 87, 0.18)';
      badge.style.color = inDarkBar ? '#8CE99A' : '#2B8A3E';
    } else {
      badge.innerHTML = `<span>🟡</span><span>로컬 캐시 모드</span>`;
      badge.style.color = inDarkBar ? '#FFE066' : '#E67700';
    }
  }
}

const HobakStore = {
  supabaseConfig: SUPABASE_CONFIG,
  clientAnonId: getOrCreateClientAnonId(),
  isConnected: false,

  async syncFromSupabase(showToastOnComplete = false) {
    try {
      // profiles 외래키 조인을 포함하여 items, item_likes, popular_keywords 조회 (최신순)
      const itemsUrl = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?select=*,profiles(nickname,location_dong,manner_temp,avatar_url)&order=created_at.desc,id.asc`;
      const likesUrl = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.itemLikes}?select=item_id&client_anon_id=eq.${this.clientAnonId}`;
      const keywordsUrl = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.popularKeywords}?select=keyword,search_count,display_order&order=search_count.desc,display_order.asc`;

      const [itemsRes, likesRes, kwRes] = await Promise.all([
        fetch(itemsUrl, { method: 'GET', headers: supabaseHeaders() }),
        fetch(likesUrl, { method: 'GET', headers: supabaseHeaders() }),
        fetch(keywordsUrl, { method: 'GET', headers: supabaseHeaders() })
      ]);

      let syncedCount = 0;
      if (itemsRes.ok) {
        const rows = await itemsRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows.map(mapRowFromItemsTable);
          localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(mapped));
          syncedCount = mapped.length;
          this.isConnected = true;
        }
      }

      if (likesRes.ok) {
        const likeRows = await likesRes.json();
        if (Array.isArray(likeRows)) {
          const likedIds = likeRows.map(r => Number(r.item_id)).filter(Boolean);
          localStorage.setItem(HOBAK_LIKES_KEY, JSON.stringify(likedIds));
        }
      }

      if (kwRes.ok) {
        const kwRows = await kwRes.json();
        if (Array.isArray(kwRows) && kwRows.length > 0) {
          window.HOBAK_POPULAR_KEYWORDS = kwRows.map(r => r.keyword);
        }
      }

      updateSupabaseStatusBadge(this.isConnected, syncedCount || this.getItems().length);

      if (window.HobakListPage && typeof window.HobakListPage.refresh === 'function') {
        window.HobakListPage.refresh();
      }

      if (showToastOnComplete) {
        let toast = document.getElementById('hobak-supabase-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'hobak-supabase-toast';
          toast.className = 'hobak-toast';
          document.body.appendChild(toast);
        }
        toast.textContent = `🔄 Supabase DB 동기화 완료 (매물 ${syncedCount}건)`;
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
      }

      return this.getItems();
    } catch (e) {
      updateSupabaseStatusBadge(false, 0);
      return null;
    }
  },

  getItems() {
    try {
      const raw = localStorage.getItem(HOBAK_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(INITIAL_HOBAK_ITEMS));
        return [...INITIAL_HOBAK_ITEMS];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(INITIAL_HOBAK_ITEMS));
        return [...INITIAL_HOBAK_ITEMS];
      }
      return parsed;
    } catch (e) {
      return [...INITIAL_HOBAK_ITEMS];
    }
  },

  getItemById(id) {
    const items = this.getItems();
    const numericId = Number(id);
    return items.find(item => Number(item.id) === numericId) || items[0] || null;
  },

  buildNewItemObject(newItemData) {
    const items = this.getItems();
    const nextId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const authUser =
      window.HobakAuth && typeof window.HobakAuth.getUser === 'function'
        ? window.HobakAuth.getUser()
        : null;

    const effectiveSellerId =
      newItemData.sellerId || (authUser && authUser.id) || this.clientAnonId;
    const sellerNickname =
      (newItemData.seller && newItemData.seller.nickname) ||
      (authUser && authUser.nickname) ||
      '호박주민';
    const sellerLocation =
      (newItemData.seller && newItemData.seller.location) ||
      (authUser && authUser.location) ||
      '부산 중구 대청동4가';
    const sellerMannerTemp =
      (newItemData.seller && Number(newItemData.seller.mannerTemp)) ||
      (authUser && Number(authUser.mannerTemp)) ||
      50.2;

    return {
      id: nextId,
      sellerId: effectiveSellerId,
      title: (newItemData.title || '').trim() || '제목 없는 호박 매물',
      category: newItemData.category || '남성패션/잡화',
      isBumped: false,
      timeAgo: '방금 전',
      price: Number(newItemData.price) || 0,
      status: newItemData.status || '판매중',
      hobakPay: newItemData.hobakPay !== undefined ? Boolean(newItemData.hobakPay) : true,
      size: (newItemData.size || '').trim() || 'FREE',
      seller: {
        nickname: sellerNickname,
        location: sellerLocation,
        mannerTemp: sellerMannerTemp
      },
      description: (newItemData.description || '').trim(),
      images: Array.isArray(newItemData.images) && newItemData.images.length > 0
        ? newItemData.images
        : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85'],
      likes: 0,
      chats: 0,
      views: 1,
      createdAt: new Date().toISOString()
    };
  },

  async persistNewItemToSupabase(item) {
    try {
      const effectiveSellerId = item.sellerId || this.clientAnonId;
      const accessToken =
        window.HobakAuth && typeof window.HobakAuth.getAccessToken === 'function'
          ? window.HobakAuth.getAccessToken()
          : null;
      const authHeaderOverride = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      // 1) public.profiles 테이블에 작성자 프로필(id, nickname, location_dong, manner_temp) Upsert
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.profiles}?on_conflict=id`, {
        method: 'POST',
        headers: supabaseHeaders({
          ...authHeaderOverride,
          Prefer: 'resolution=merge-duplicates,return=minimal'
        }),
        body: JSON.stringify({
          id: effectiveSellerId,
          nickname: item.seller.nickname,
          location_dong: item.seller.location,
          manner_temp: item.seller.mannerTemp
        })
      });

      // 2) public.items 테이블에 매물(seller_id, seller_nickname 포함) Insert 후 생성된 레코드 반환
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}`, {
        method: 'POST',
        headers: supabaseHeaders({
          ...authHeaderOverride,
          Prefer: 'return=representation'
        }),
        body: JSON.stringify(mapItemToItemsTableRow(item, false))
      });

      if (res.ok) {
        const inserted = await res.json();
        if (Array.isArray(inserted) && inserted[0]) {
          const syncedItem = mapRowFromItemsTable(inserted[0]);
          if (!syncedItem.seller.nickname && item.seller.nickname) {
            syncedItem.seller.nickname = item.seller.nickname;
          }
          const currentList = this.getItems().map(i =>
            Number(i.id) === Number(item.id) ? syncedItem : i
          );
          try {
            localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(currentList));
          } catch (e) {}
          updateSupabaseStatusBadge(true, currentList.length);
          return syncedItem;
        }
      }
    } catch (e) {}
    return item;
  },

  addItem(newItemData) {
    const items = this.getItems();
    const item = this.buildNewItemObject(newItemData);
    const updated = [item, ...items];
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    updateSupabaseStatusBadge(this.isConnected, updated.length);

    this.persistNewItemToSupabase(item);
    return item;
  },

  async addItemAsync(newItemData) {
    const items = this.getItems();
    const item = this.buildNewItemObject(newItemData);
    const updated = [item, ...items];
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    updateSupabaseStatusBadge(this.isConnected, updated.length);

    const syncedItem = await this.persistNewItemToSupabase(item);
    return syncedItem || item;
  },

  isOwner(item) {
    if (!item) return false;
    const authUser =
      window.HobakAuth && typeof window.HobakAuth.getUser === 'function'
        ? window.HobakAuth.getUser()
        : null;
    if (!authUser || !authUser.id || !item.sellerId) return false;
    return String(item.sellerId) === String(authUser.id);
  },

  isAvailableStatus(status) {
    return status === '판매중' || status === '거래가능' || !status;
  },

  _buildDbPatch(patch) {
    const dbPatch = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.price !== undefined) dbPatch.price = Number(patch.price);
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.hobakPay !== undefined) dbPatch.hobak_pay = Boolean(patch.hobakPay);
    if (patch.size !== undefined) dbPatch.size = patch.size;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.images !== undefined) dbPatch.images = Array.isArray(patch.images) ? patch.images : [];
    if (patch.seller && patch.seller.location !== undefined) {
      dbPatch.seller_location = patch.seller.location;
    }
    if (patch.likes !== undefined) dbPatch.likes_count = Number(patch.likes);
    if (patch.views !== undefined) dbPatch.views_count = Number(patch.views);
    return dbPatch;
  },

  updateItem(id, patch) {
    const items = this.getItems();
    const numericId = Number(id);
    const idx = items.findIndex(item => Number(item.id) === numericId);
    if (idx === -1) return null;

    const mergedSeller = patch.seller
      ? { ...(items[idx].seller || {}), ...patch.seller }
      : items[idx].seller;
    items[idx] = { ...items[idx], ...patch, seller: mergedSeller };
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}

    const dbPatch = this._buildDbPatch(patch);
    if (Object.keys(dbPatch).length > 0) {
      const accessToken =
        window.HobakAuth && typeof window.HobakAuth.getAccessToken === 'function'
          ? window.HobakAuth.getAccessToken()
          : null;
      const authHeaderOverride = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?id=eq.${numericId}`, {
        method: 'PATCH',
        headers: supabaseHeaders({ ...authHeaderOverride, Prefer: 'return=minimal' }),
        body: JSON.stringify(dbPatch)
      }).catch(() => {});
    }

    return items[idx];
  },

  async updateItemAsync(id, patch) {
    const items = this.getItems();
    const numericId = Number(id);
    const idx = items.findIndex(item => Number(item.id) === numericId);
    if (idx === -1) return null;

    const mergedSeller = patch.seller
      ? { ...(items[idx].seller || {}), ...patch.seller }
      : items[idx].seller;
    items[idx] = { ...items[idx], ...patch, seller: mergedSeller };
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}

    const dbPatch = this._buildDbPatch(patch);
    if (Object.keys(dbPatch).length > 0) {
      try {
        const accessToken =
          window.HobakAuth && typeof window.HobakAuth.getAccessToken === 'function'
            ? window.HobakAuth.getAccessToken()
            : null;
        const authHeaderOverride = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await fetch(
          `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?id=eq.${numericId}`,
          {
            method: 'PATCH',
            headers: supabaseHeaders({ ...authHeaderOverride, Prefer: 'return=representation' }),
            body: JSON.stringify(dbPatch)
          }
        );
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows[0]) {
            const synced = mapRowFromItemsTable(rows[0]);
            if (!synced.seller.nickname && items[idx].seller && items[idx].seller.nickname) {
              synced.seller.nickname = items[idx].seller.nickname;
            }
            items[idx] = synced;
            try {
              localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(items));
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    if (window.HobakListPage && typeof window.HobakListPage.refresh === 'function') {
      window.HobakListPage.refresh();
    }
    return items[idx];
  },

  incrementViewCount(id) {
    const numericId = Number(id);
    const items = this.getItems();
    const item = items.find(i => Number(i.id) === numericId);
    if (!item) return 0;
    item.views = (Number(item.views) || 0) + 1;
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}

    fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?id=eq.${numericId}`, {
      method: 'PATCH',
      headers: supabaseHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ views_count: item.views })
    }).catch(() => {});

    return item.views;
  },

  incrementKeywordSearch(keyword) {
    const kw = String(keyword || '').trim();
    if (!kw) return;
    fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.popularKeywords}?select=id,search_count&keyword=eq.${encodeURIComponent(kw)}`,
      {
        method: 'GET',
        headers: supabaseHeaders()
      }
    )
      .then(res => (res.ok ? res.json() : []))
      .then(rows => {
        if (Array.isArray(rows) && rows[0]) {
          const nextCount = (Number(rows[0].search_count) || 0) + 1;
          return fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.popularKeywords}?id=eq.${rows[0].id}`,
            {
              method: 'PATCH',
              headers: supabaseHeaders({ Prefer: 'return=minimal' }),
              body: JSON.stringify({ search_count: nextCount })
            }
          );
        }
      })
      .catch(() => {});
  },

  deleteItem(id) {
    const items = this.getItems();
    const numericId = Number(id);
    const filtered = items.filter(item => Number(item.id) !== numericId);
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {}

    fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?id=eq.${numericId}`, {
      method: 'DELETE',
      headers: supabaseHeaders({ Prefer: 'return=minimal' })
    })
      .then(() => updateSupabaseStatusBadge(true, filtered.length))
      .catch(() => {});

    return filtered;
  },

  async deleteItemAsync(id) {
    const items = this.getItems();
    const numericId = Number(id);
    const filtered = items.filter(item => Number(item.id) !== numericId);
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {}

    try {
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?id=eq.${numericId}`, {
        method: 'DELETE',
        headers: supabaseHeaders({ Prefer: 'return=minimal' })
      });
      updateSupabaseStatusBadge(true, filtered.length);
    } catch (e) {}

    return filtered;
  },

  resetToInitial() {
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(INITIAL_HOBAK_ITEMS));
      localStorage.removeItem(HOBAK_LIKES_KEY);
    } catch (e) {}

    fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?on_conflict=id`, {
      method: 'POST',
      headers: supabaseHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify(INITIAL_HOBAK_ITEMS.map(item => mapItemToItemsTableRow(item, true)))
    })
      .then(() => updateSupabaseStatusBadge(true, INITIAL_HOBAK_ITEMS.length))
      .catch(() => {});

    return [...INITIAL_HOBAK_ITEMS];
  },

  async resetToInitialAsync() {
    try {
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(INITIAL_HOBAK_ITEMS));
      localStorage.removeItem(HOBAK_LIKES_KEY);
    } catch (e) {}

    try {
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?on_conflict=id`, {
        method: 'POST',
        headers: supabaseHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(INITIAL_HOBAK_ITEMS.map(item => mapItemToItemsTableRow(item, true)))
      });
      updateSupabaseStatusBadge(true, INITIAL_HOBAK_ITEMS.length);
    } catch (e) {}

    return [...INITIAL_HOBAK_ITEMS];
  },

  getLikedIds() {
    try {
      const raw = localStorage.getItem(HOBAK_LIKES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  isLiked(id) {
    const likedIds = this.getLikedIds();
    return likedIds.includes(Number(id));
  },

  toggleLike(id) {
    const numericId = Number(id);
    const likedIds = this.getLikedIds();
    const items = this.getItems();
    const item = items.find(i => Number(i.id) === numericId);
    let nowLiked = false;

    if (likedIds.includes(numericId)) {
      const idx = likedIds.indexOf(numericId);
      likedIds.splice(idx, 1);
      if (item && item.likes > 0) item.likes -= 1;
      nowLiked = false;
    } else {
      likedIds.push(numericId);
      if (item) item.likes = (item.likes || 0) + 1;
      nowLiked = true;
    }

    try {
      localStorage.setItem(HOBAK_LIKES_KEY, JSON.stringify(likedIds));
      localStorage.setItem(HOBAK_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}

    // 1) public.item_likes 테이블에 익명 UUID 기준 INSERT 또는 DELETE
    if (nowLiked) {
      fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.itemLikes}`, {
        method: 'POST',
        headers: supabaseHeaders({ Prefer: 'resolution=ignore-duplicates,return=minimal' }),
        body: JSON.stringify({
          item_id: numericId,
          client_anon_id: this.clientAnonId
        })
      }).catch(() => {});
    } else {
      fetch(
        `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.itemLikes}?item_id=eq.${numericId}&client_anon_id=eq.${this.clientAnonId}`,
        {
          method: 'DELETE',
          headers: supabaseHeaders({ Prefer: 'return=minimal' })
        }
      ).catch(() => {});
    }

    // 2) public.items 테이블의 likes_count 동기화
    if (item) {
      fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tables.items}?id=eq.${numericId}`, {
        method: 'PATCH',
        headers: supabaseHeaders({ Prefer: 'return=minimal' }),
        body: JSON.stringify({ likes_count: item.likes })
      }).catch(() => {});
    }

    return { liked: nowLiked, likesCount: item ? item.likes : 0 };
  },

  formatPrice(price) {
    const num = Number(price);
    if (isNaN(num) || num === 0) return '나눔🧡';
    return num.toLocaleString('ko-KR') + '원';
  }
};

window.HOBAK_CATEGORIES = HOBAK_CATEGORIES;
window.HOBAK_POPULAR_KEYWORDS = HOBAK_POPULAR_KEYWORDS;
window.HOBAK_LOCATIONS = HOBAK_LOCATIONS;
window.INITIAL_HOBAK_ITEMS = INITIAL_HOBAK_ITEMS;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.HobakStore = HobakStore;

// 페이지 로드 시 Supabase DB(profiles, items, item_likes, popular_keywords)에서 최신 상태 동기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HobakStore.syncFromSupabase(false);
  });
} else {
  HobakStore.syncFromSupabase(false);
}
