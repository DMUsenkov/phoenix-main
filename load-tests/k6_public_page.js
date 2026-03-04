import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://127.0.0.1:3000';
const PAGE_SLUG = 'смирнов-алексей-1-cc69f188';

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/public/pages/${PAGE_SLUG}`);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  sleep(1);
}