"use server"

import { cookies } from "next/headers"

import {
  CJNOA_SESSION_COOKIE,
  CJNOA_SESSION_MAX_AGE_SECONDS,
  getCJNoaPassword,
} from "@/lib/cjnoa-access"

export type CJNoaAccessState = { error: string | null }

export async function verifyCJNoaPassword(
  _prevState: CJNoaAccessState,
  formData: FormData,
): Promise<CJNoaAccessState> {
  const entered = String(formData.get("password") ?? "")
  const expected = getCJNoaPassword()

  if (!entered || entered !== expected) {
    return { error: "Contraseña incorrecta." }
  }

  const store = await cookies()
  store.set(CJNOA_SESSION_COOKIE, "ok", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: CJNOA_SESSION_MAX_AGE_SECONDS,
    path: "/interno/cjnoa-whatsapp",
  })

  return { error: null }
}
