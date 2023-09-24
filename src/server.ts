import app from './app'
import { knex } from './database'

app.get('/', async () => {
	const test = await knex('sqlite_schema').select('*')

	return test
})

app.listen({ port: 3333 }).then(() => {
	console.log('Server running on port 3333')
})