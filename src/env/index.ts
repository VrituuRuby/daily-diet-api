import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
	JWT_TOKEN: z.string(),
	DATABASE_CLIENT: z.enum(['sqlite3', 'pg']),
	DATABASE_URL: z.string(),
	PORT: z.coerce.number().default(3333)
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
	console.error('⚠️ INVALID ENVIROMENT VARIABLES 🚫', _env.error.format())
	throw new Error('Invalid enviroment variables')
}

export default _env.data