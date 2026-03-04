import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'http://127.0.0.1:3000';
const QUERY = 'иван';

export const options = {
  scenarios: {
    search_100rps: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 100,
      exec: 'searchFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export function searchFlow() {
  const url = `${BASE_URL}/api/public/search?q=${encodeURIComponent(QUERY)}`;
  const res = http.get(url);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    console.log(`STATUS=${res.status}`);
    console.log(`BODY=${String(res.body).slice(0, 300)}`);
  }
}