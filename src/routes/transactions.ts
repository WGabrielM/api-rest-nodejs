import { z } from 'zod';
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from "fastify"

import { knex } from "../database"
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';


export async function transactionsRoutes(app: FastifyInstance) {

    app.addHook('preHandler', async (request, reply) => {
        console.log(`[${request.method}] - ${request.url}`);
    })

    app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies
        const transactions = await knex('transactions').where('session_id', sessionId).select()

        return { transactions }
    })

    // List specific transaction
    app.get('/:id', async (request) => {
        const getTransactionsParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionsParamsSchema.parse(request.params)

        const { sessionId } = request.cookies


        const transactions = await knex('transactions').where({
            session_id: sessionId,
            id,
        }).first()
        return { transactions }
    })

    // Get the summary of the user
    app.get('/summary', async (request, reply) => {
        const { sessionId } = request.cookies

        const summary = await knex('transactions').where('session_id', sessionId).sum('amount', { as: 'amount' }).first()

        return { summary }
    })

    app.post('/', async (request, reply) => {
        const createTransactionsBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionsBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId
        if (!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send()
    })
}