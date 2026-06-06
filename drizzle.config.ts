import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/config/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
