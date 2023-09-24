import app from './app'

app.get('/', () => {
	return {
		message: 'Hello World'
	}
})


app.listen({ port: 3333 }).then(() => {
	console.log('Server running on port 3333')
})