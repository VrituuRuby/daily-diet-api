import app from './app'
import { knex } from './database'
import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'

app.get('/', async () => {
	const test = await knex('sqlite_schema').select('*')
	return test
})

app.register(usersRoutes, { prefix: '/users' })
app.register(mealsRoutes, { prefix: '/meals' })

app.listen({ port: 3333 }).then(() => {
	console.log('Server running on port 3333')
})