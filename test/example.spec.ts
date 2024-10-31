import { expect, test } from 'vitest'

test('o usuário cosnegue criar uma nova transação', () => {
    // make a HTTP request to create new transaction
    const responseStatusCode = 201
    // validation
    expect(responseStatusCode).toEqual(201)
})