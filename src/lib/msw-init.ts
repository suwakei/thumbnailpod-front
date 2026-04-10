export async function initMSW() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;
  if (process.env.NEXT_PUBLIC_MSW_ENABLED !== 'true') return;

  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}
