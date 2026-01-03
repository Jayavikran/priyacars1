export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: '/priyacars1/',   // <<< REQUIRED

    plugins: [react()],
    ...
  }
})
