import { API_URL } from './api';
import { readSession } from './session';
import type { AnalysisResult } from '@/types';

type AnalysisEvent =
  | { event: 'status'; data: { step: string } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'final'; data: AnalysisResult }
  | { event: 'error'; data: { message: string } };

interface StartAnalysisCallbacks {
  onDelta: (text: string) => void;
  onFinal: (result: AnalysisResult) => void;
  onStatus?: (step: string) => void;
}

function parseSseEvents(buffer: string): { events: AnalysisEvent[]; rest: string } {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  const events = parts
    .map((part) => {
      const eventLine = part.split('\n').find((line) => line.startsWith('event:'));
      const dataLine = part.split('\n').find((line) => line.startsWith('data:'));
      if (!eventLine || !dataLine) {
        return null;
      }

      return {
        event: eventLine.replace('event:', '').trim(),
        data: JSON.parse(dataLine.replace('data:', '').trim()),
      } as AnalysisEvent;
    })
    .filter(Boolean) as AnalysisEvent[];

  return { events, rest };
}

function handleEvent(event: AnalysisEvent, callbacks: StartAnalysisCallbacks) {
  if (event.event === 'delta') {
    callbacks.onDelta(event.data.text);
  }

  if (event.event === 'status') {
    callbacks.onStatus?.(event.data.step);
  }

  if (event.event === 'final') {
    callbacks.onFinal(event.data);
  }

  if (event.event === 'error') {
    throw new Error(event.data.message);
  }
}

export async function startAnalysis(imageUri: string, callbacks: StartAnalysisCallbacks) {
  const session = await readSession();
  if (!session.accessToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const formData = new FormData();
  const extension = imageUri.split('.').pop()?.toLowerCase() ?? 'jpg';

  formData.append('image', {
    uri: imageUri,
    name: `selfie.${extension}`,
    type: extension === 'png' ? 'image/png' : 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${API_URL}/analysis`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'ANALYSIS_FAILED');
  }

  if (!response.body?.getReader) {
    const text = await response.text();
    const parsed = parseSseEvents(text);
    parsed.events.forEach((event) => handleEvent(event, callbacks));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseEvents(buffer);
    buffer = parsed.rest;
    parsed.events.forEach((event) => handleEvent(event, callbacks));
  }
}
