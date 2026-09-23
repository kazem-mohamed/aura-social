/**
 * The password rule (`PASSWORD_REGEX`) split into the parts people can watch
 * tick off as they type.
 */
export function passwordRules(value: string): { label: string; met: boolean }[] {
  return [
    { label: "8+ characters", met: value.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(value) },
    { label: "Lowercase", met: /[a-z]/.test(value) },
    { label: "Number", met: /[0-9]/.test(value) },
    { label: "Symbol", met: /[#?!@$ %^&*-]/.test(value) },
  ];
}
