import { NextResponse } from "next/server";

export type ApiErrorBody = {
  status: "error";
  error: string;
  code?: string;
  details?: unknown;
};

export type ApiSuccessBody<T> = {
  status: "success";
  data: T;
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ status: "success", data } satisfies ApiSuccessBody<T>, {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

export function apiError(
  error: string,
  status = 400,
  options?: { code?: string; details?: unknown }
) {
  const body: ApiErrorBody = {
    status: "error",
    error,
    ...(options?.code ? { code: options.code } : {}),
    ...(options?.details !== undefined ? { details: options.details } : {}),
  };
  return NextResponse.json(body, { status });
}
