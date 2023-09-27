import fastify from 'fastify'

import { authRoutes } from './routes/auth'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import { knex } from './database'

const app = fastify()

app.get('/', async () => {
	const test = await knex('sqlite_schema').select('*')
	return test
})

app.register(authRoutes, { prefix: '/login' })
app.register(usersRoutes, { prefix: '/users' })
app.register(mealsRoutes, { prefix: '/meals' })

export default app