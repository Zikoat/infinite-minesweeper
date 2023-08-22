export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(
      message ||
        "assertion failed, value is " + value + ", but should be truthy",
    );
  }
}
