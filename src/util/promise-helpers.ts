export function delay(seconds: number): Promise<void> {
  return new Promise((
    resolve: (a: void) => void,
    reject: (error: Error) => void
  ) => setTimeout(resolve, seconds));
};
