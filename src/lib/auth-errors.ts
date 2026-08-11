import type { AuthError } from "@supabase/supabase-js";

/** Supabase auth error codes → Arabic messages. */
const BY_CODE: Record<string, string> = {
  invalid_credentials: "البريد أو كلمة المرور غير صحيحة",
  email_not_confirmed: "لم يُؤكَّد هذا البريد بعد. افتح رابط التأكيد في بريدك",
  user_already_exists: "هذا البريد مسجَّل مسبقاً",
  email_exists: "هذا البريد مسجَّل مسبقاً",
  weak_password: "كلمة المرور ضعيفة — استخدم ٦ أحرف على الأقل",
  validation_failed: "تحقّق من صيغة البريد وكلمة المرور",
  email_address_invalid: "صيغة البريد غير صحيحة",
  over_request_rate_limit: "محاولات كثيرة متتالية. انتظر قليلاً ثم أعد المحاولة",
  over_email_send_rate_limit:
    "أُرسلت رسائل كثيرة لهذا البريد. انتظر قليلاً ثم أعد المحاولة",
  signup_disabled: "التسجيل مغلق حالياً",
};

export function authErrorMessage(error: AuthError): string {
  if (error.code && BY_CODE[error.code]) {
    return BY_CODE[error.code];
  }

  // Older responses carry no code — fall back to the English text.
  const message = error.message.toLowerCase();
  if (message.includes("invalid login credentials")) {
    return BY_CODE.invalid_credentials;
  }
  if (message.includes("email not confirmed")) {
    return BY_CODE.email_not_confirmed;
  }
  if (message.includes("already registered")) {
    return BY_CODE.user_already_exists;
  }
  if (message.includes("password should be at least")) {
    return BY_CODE.weak_password;
  }
  if (message.includes("failed to fetch")) {
    return "تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت";
  }

  return "حدث خطأ غير متوقّع. أعد المحاولة";
}
