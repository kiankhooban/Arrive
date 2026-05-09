/**
 * Thin fetch wrapper that POSTs to /api/chat and streams SSE chunks.
 *
 * Usage:
 *   await sendMessage(payload, (chunk) => { ... });
 *
 * On timeout or error the caller (ChatBox) is responsible for
 * rendering the fallback — this module just rejects the promise.
 *
 * @param {Object}   payload            - { message, history, province, status, needs, filteredResources }
 * @param {Function} onChunk            - called with each decoded text chunk as it arrives
 * @returns {Promise<void>}             - resolves when stream ends, rejects on error
 */
export async function sendMessage(payload, onChunk) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(`/api/chat responded ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null — streaming not supported in this environment');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // SSE format: lines starting with "data: "
  // We accumulate partial lines across chunks.
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process all complete lines in the buffer
    const lines = buffer.split('\n');
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice('data: '.length).trim();
      if (raw === '[DONE]') return;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }

      // watsonx SSE payload: { results: [{ generated_text: "..." }] }
      const chunk = parsed?.results?.[0]?.generated_text ?? '';
      if (chunk) onChunk(chunk);
    }
  }

  // Flush any remaining buffer content
  if (buffer.startsWith('data: ')) {
    const raw = buffer.slice('data: '.length).trim();
    if (raw && raw !== '[DONE]') {
      try {
        const parsed = JSON.parse(raw);
        const chunk = parsed?.results?.[0]?.generated_text ?? '';
        if (chunk) onChunk(chunk);
      } catch {
        // ignore malformed trailing data
      }
    }
  }
}
