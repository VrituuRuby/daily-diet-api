import type { Knex } from 'knex'
import env from './src/env'

const config: Knex.Config = {
	client: env.DATABASE_CLIENT,
	connection: env.DATABASE_CLIENT === 'sqlite' ? {
		filename: './database/app.db'
	} : env.DATABASE_URL,
	useNullAsDefault: true,
	migrations: {
		extension: 'ts',
		directory: './database/migrations/'
	}
}

export default config 