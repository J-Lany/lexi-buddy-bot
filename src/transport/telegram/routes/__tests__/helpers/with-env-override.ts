/**
 * `env` (and its nested objects like `env.studentMedia`) is a plain,
 * module-level singleton read once at process start — there's no DI to
 * inject a different config per test. This temporarily mutates the given
 * fields, runs `fn`, and always restores the original values afterward
 * (even if `fn` throws), so one test's override can never leak into
 * another.
 */
export async function withEnvOverride<T extends object>(
  target: T,
  overrides: Partial<T>,
  fn: () => Promise<void>,
): Promise<void> {
  const original: Partial<T> = {};
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    original[key] = target[key];
  }

  Object.assign(target, overrides);

  try {
    await fn();
  } finally {
    Object.assign(target, original);
  }
}
