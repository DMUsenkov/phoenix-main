import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const USER_EMAIL = __ENV.USER_EMAIL || 'ghokih@yandex.ru';
const USER_PASSWORD = __ENV.USER_PASSWORD || '12345678';

const RATE = parseInt(__ENV.RATE || '10', 10);
const DURATION = __ENV.DURATION || '3m';

export const options = {
  scenarios: {
    login_flow: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: Math.max(10, RATE),
      maxVUs: Math.max(50, RATE * 5),
      exec: 'loginFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export function loginFlow() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(res, {
    'status 200': (r) => r.status === 200,
    'has access token': (r) => !!r.json('access_token'),
  });
}
