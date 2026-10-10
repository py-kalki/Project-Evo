/**
 * api.ts — shared response helpers for Route Handlers.
 * Keeps error shapes consistent across every endpoint.
 */
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Return a JSON error response with the right status code. */
export function err(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Return a 400 validation error, including Zod field details when available. */
export function validationError(error: ZodError): NextResponse {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'root';
    if (!details[key]) details[key] = [];
    details[key].push(issue.message);
  }
  return NextResponse.json({ error: 'Invalid input', details }, { status: 400 });
}

/** Wrap a Route Handler body and catch unhandled errors uniformly. */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    return err('Something went wrong', 500);
  }
}
