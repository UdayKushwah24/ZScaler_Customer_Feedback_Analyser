const BASE_URL = '/api/feedback';

async function handleResponse(response) {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export async function analyzeFeedback(comments) {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments }),
  });
  return handleResponse(response);
}

export async function listFeedback() {
  const response = await fetch(BASE_URL);
  return handleResponse(response);
}

export async function getSummary() {
  const response = await fetch(`${BASE_URL}/summary`);
  return handleResponse(response);
}

export async function getInsight() {
  const response = await fetch(`${BASE_URL}/insight`);
  return handleResponse(response);
}

export async function resetFeedback() {
  const response = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return handleResponse(response);
}

export async function getRules() {
  const response = await fetch(`${BASE_URL}/rules`);
  return handleResponse(response);
}
