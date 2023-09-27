import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { verify } from 'jsonwebtoken'
import env from '../env'

export function verifyJwtToken(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
	const tokenHeader = request.headers.authorization

	if (!tokenHeader) return reply.status(400).send({ error: 'Missing token' })

	if (tokenHeader.includes('Bearer ')) {
		const [_, token] = tokenHeader.split(' ')

		const payload = verify(token, env.JWT_TOKEN)

		if (!payload) {
			return reply.status(401).send({ error: 'Invalid token' })
		}

		const user_id = payload.sub as string

		request.user_id = user_id

		return done()
	}
}