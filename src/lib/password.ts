// Shared password rules for signup / password reset.
export interface PasswordCheck {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  valid: boolean;
}

export function checkPassword(pw: string): PasswordCheck {
  const minLength = pw.length >= 8;
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  return { minLength, hasLetter, hasNumber, valid: minLength && hasLetter && hasNumber };
}

const PT_ERRORS: Array<{ match: RegExp; msg: string }> = [
  { match: /password should be at least|password is too short|password.*6 characters/i, msg: "A senha precisa ter no mínimo 8 caracteres." },
  { match: /user already registered|already been registered|already registered/i, msg: "Este e-mail já está cadastrado." },
  { match: /email not confirmed|confirm your email/i, msg: "Confirme seu e-mail antes de entrar." },
  { match: /invalid login credentials/i, msg: "E-mail ou senha inválidos." },
  { match: /rate limit/i, msg: "Muitas tentativas. Tente novamente em alguns minutos." },
  { match: /network|failed to fetch/i, msg: "Falha de conexão. Verifique sua internet e tente novamente." },
];

export function translateAuthError(message: string | undefined | null): string {
  if (!message) return "Não foi possível concluir a operação.";
  for (const rule of PT_ERRORS) if (rule.match.test(message)) return rule.msg;
  return message;
}
