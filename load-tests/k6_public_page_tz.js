import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'http://127.0.0.1:3000';
const PAGE_SLUG = 'смирнов-алексей-1-cc69f188';

export const options = {
  scenarios: {
    public_page_50rps: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '3m',
      preAllocatedVUs: 30,
      maxVUs: 100,
      exec: 'publicPage',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

export function publicPage() {
  const url = `${BASE_URL}/api/public/pages/${encodeURIComponent(PAGE_SLUG)}`;
  const res = http.get(url);

  check(res, {
    'status 200': (r) => r.status === 200,
  });
}