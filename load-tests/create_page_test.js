import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const USER_EMAIL = __ENV.USER_EMAIL || 'ghokih@yandex.ru';
const USER_PASSWORD = __ENV.USER_PASSWORD || '12345678';

const RATE = parseInt(__ENV.RATE || '2', 10);
const DURATION = __ENV.DURATION || '3m';

export const options = {
  scenarios: {
    create_page_flow: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: Math.max(5, RATE * 2),
      maxVUs: Math.max(20, RATE * 10),
      exec: 'createPageFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (loginRes.status !== 200) {
    throw new Error(`Login failed in setup: ${loginRes.status} ${loginRes.body}`);
  }

  return {
    token: loginRes.json('access_token'),
  };
}

export function createPageFlow(data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  const unique = `${__VU}-${__ITER}-${Date.now()}`;

  const payload = {
    person: {
      full_name: `Нагрузочный Тест ${unique}`,
      gender: 'unknown',
      life_status: 'deceased',
      birth_date: '1970-01-01',
      death_date: '2020-01-01',
      burial_place: `Тестовое место ${unique}`,
      burial_place_lat: 55.75,
      burial_place_lng: 37.61,
    },
    title: `Тестовая страница ${unique}`,
    biography: `Автоматически созданная страница ${unique}`,
    short_description: `Нагрузочный тест ${unique}`,
    visibility: 'public',
  };

  const res = http.post(
    `${BASE_URL}/api/pages`,
    JSON.stringify(payload),
    { headers }
  );

  check(res, {
    'status 200 or 201': (r) => r.status === 200 || r.status === 201,
    'has id': (r) => !!r.json('id'),
  });
}
