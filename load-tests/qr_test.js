import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const QR_CODE = __ENV.QR_CODE || 'powbPI4B';

const RATE = parseInt(__ENV.RATE || '20', 10);
const DURATION = __ENV.DURATION || '3m';

export const options = {
  scenarios: {
    qr_redirect: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: Math.max(10, RATE),
      maxVUs: Math.max(50, RATE * 5),
      exec: 'qrFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export function qrFlow() {
  const res = http.get(`${BASE_URL}/q/${QR_CODE}`, { redirects: 0 });

  check(res, {
    'status is redirect': (r) => r.status === 302 || r.status === 307,
    'location header exists': (r) => !!r.headers.Location,
  });
}
