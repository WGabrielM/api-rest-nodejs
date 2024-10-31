import { z } from 'zod';
import { knex } from "../database"
import { FastifyInstance } from "fastify"
import { randomUUID } from 'node:crypto'


export async function transactionsRoutes(app: FastifyInstance) {
    app.post('/', async (request, replay) => {
        const createTransactionsBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })
        const { title, amount, type } = createTransactionsBodySchema.parse(request.body)

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
        })

        return replay.status(201).send()
    })
}