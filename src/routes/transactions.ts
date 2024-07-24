import { z } from 'zod';
import { FastifyInstance } from "fastify"

import { knex } from "../database"
import { randomUUID } from 'node:crypto'

export async function transactionsRoutes(app: FastifyInstance) {
    app.post('/', async (request, replay) => {
        // { title, amount, type: credit or debit }

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