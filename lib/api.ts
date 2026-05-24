const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function createAssignment(formData: FormData): Promise<{ assignmentId: string; jobId: string }> {
  const res = await fetch(`${API_URL}/api/assignments`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create assignment');
  return res.json();
}

export async function getAssignment(id: string) {
  const res = await fetch(`${API_URL}/api/assignments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch assignment');
  return res.json();
}

export async function getPaper(assignmentId: string) {
  const res = await fetch(`${API_URL}/api/papers/${assignmentId}`);
  if (!res.ok) throw new Error('Paper not ready');
  return res.json();
}

export async function listAssignments() {
  const res = await fetch(`${API_URL}/api/assignments`);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function deleteAssignment(id: string) {
  const res = await fetch(`${API_URL}/api/assignments/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete assignment');
  return res.json();
}

export async function regeneratePaper(assignmentId: string) {
  const res = await fetch(`${API_URL}/api/assignments/${assignmentId}/regenerate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to regenerate');
  return res.json();
}
