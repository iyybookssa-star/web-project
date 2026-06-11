import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const productListTrend = new Trend('product_list_duration', true);
const productDetailTrend = new Trend('product_detail_duration', true);
const healthTrend = new Trend('health_check_duration', true);

// Base URL — change this to your deployed Render URL if testing production
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  // Ramp-up capacity test: gradually increase load to find breaking point
  stages: [
    { duration: '30s', target: 10 },   // Warm-up: ramp to 10 users
    { duration: '1m',  target: 50 },   // Ramp-up: push to 50 users
    { duration: '1m',  target: 100 },  // Peak: push to 100 users
    { duration: '30s', target: 0 },    // Cool-down: ramp back to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests should be under 500ms
    errors: ['rate<0.1'],               // Error rate should be below 10%
    checks: ['rate>0.95'],              // 95%+ of checks must pass or test fails
    product_list_duration: ['p(95)<600'],
    product_detail_duration: ['p(95)<400'],
  },
  cloud: {
    projectID: 7798675,
    name: 'Partify Capacity Test',
  },
};

// Grab a random product ID from the listing for detail requests
let productIds = [];

export function setup() {
  const res = http.get(`${BASE_URL}/api/products?limit=20`);
  if (res.status === 200) {
    const body = JSON.parse(res.body);
    return { productIds: body.products.map((p) => p._id) };
  }
  return { productIds: [] };
}

export default function (data) {
  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  healthTrend.add(healthRes.timings.duration);
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
    'health body says OK': (r) => JSON.parse(r.body).status === 'OK',
    'health content-type json': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
  });
  errorRate.add(healthRes.status !== 200);

  sleep(0.5);

  // 2. Browse products (most common user action)
  const categories = ['All', 'Engines', 'Brakes', 'Lighting', 'Suspension', 'Electrical'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const page = Math.floor(Math.random() * 3) + 1;

  const listUrl = randomCategory === 'All'
    ? `${BASE_URL}/api/products?page=${page}&limit=20`
    : `${BASE_URL}/api/products?category=${randomCategory}&page=${page}&limit=20`;

  const listRes = http.get(listUrl);
  productListTrend.add(listRes.timings.duration);
  check(listRes, {
    'product list status 200': (r) => r.status === 200,
    'product list has products': (r) => Array.isArray(JSON.parse(r.body).products),
    'product list page is correct': (r) => JSON.parse(r.body).page === page,
    'product list content-type json': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
  });
  errorRate.add(listRes.status !== 200);

  sleep(0.5);

  // 3. View a single product detail (simulates clicking a product)
  if (data.productIds && data.productIds.length > 0) {
    const randomId = data.productIds[Math.floor(Math.random() * data.productIds.length)];
    const detailRes = http.get(`${BASE_URL}/api/products/${randomId}`);
    productDetailTrend.add(detailRes.timings.duration);
    check(detailRes, {
      'product detail status 200': (r) => r.status === 200,
      'product detail has name': (r) => JSON.parse(r.body).name !== undefined,
      'product detail id matches': (r) => JSON.parse(r.body)._id === randomId,
      'product detail content-type json': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
    });
    errorRate.add(detailRes.status !== 200);
  }

  sleep(0.5);

  // 4. Search products (simulates search bar usage)
  const searchTerms = ['brake', 'engine', 'oil', 'filter', 'light', 'spark'];
  const randomSearch = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const searchRes = http.get(`${BASE_URL}/api/products?search=${randomSearch}`);
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
    'search returns products': (r) => Array.isArray(JSON.parse(r.body).products),
    'search content-type json': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
  });
  errorRate.add(searchRes.status !== 200);

  sleep(Math.random() * 1.5 + 0.5); // Random think time 0.5-2s
}
