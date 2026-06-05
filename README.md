# Contract Testing POC

A working proof of concept for consumer-driven contract testing using [Pact](https://pact.foundation/) and Jest, with no Docker required.

## What is contract testing?

Contract testing verifies that two services can communicate correctly by checking each side against a shared **contract** (the pact file), rather than running both services together in an integration environment.

```
Consumer (UserApp)               Provider (UserService)
─────────────────                ─────────────────────
1. Defines expectations   ─────► 2. Pact file written
                                     │
                                     ▼
                                 3. Provider verifies
                                    it satisfies the pact
```

The consumer test runs first, writes a pact file, and the provider test verifies the real implementation against it — independently, no shared environment needed.

## Project structure

```
├── consumer/
│   └── tests/
│       └── consumer.test.ts       # Defines what UserApp expects from UserService
├── provider/
│   ├── userService.ts             # Express server (the real provider implementation)
│   └── tests/
│       └── provider.test.ts       # Verifies UserService satisfies the pact
├── pacts/
│   └── UserApp-UserService.json   # Generated contract — written by consumer, read by provider
├── jest.config.ts
├── tsconfig.json
└── package.json
```

## Running the tests

```bash
npm install

# Run everything: consumer generates the pact, provider verifies it
npm test

# Run steps individually
npm run test:consumer   # writes pacts/UserApp-UserService.json
npm run test:provider   # verifies the provider against that file
```

> `test:consumer` must run before `test:provider` — the pact file must exist before the provider can verify it. `npm test` handles this order automatically.

## How it works

### Consumer test

[consumer/tests/consumer.test.ts](consumer/tests/consumer.test.ts) uses `PactV3` to:
1. Declare an expected interaction (`GET /users/1` → `{ id: 1, name: 'John', status: 'ACTIVE' }`)
2. Spin up a Pact mock server that replays that response
3. Call the mock server with axios and assert the result
4. Write the interaction to `pacts/UserApp-UserService.json`

### Provider test

[provider/tests/provider.test.ts](provider/tests/provider.test.ts) uses `Verifier` to:
1. Start the real Express server ([provider/userService.ts](provider/userService.ts))
2. Read the pact file
3. Replay every interaction against the live server and check the responses match

### State handlers

When a consumer interaction declares a provider state (e.g. `'user exists'`), the provider test must register a handler for it. The handler sets up any data or conditions the provider needs before that interaction is verified.

```ts
stateHandlers: {
  'user exists': async () => {
    // seed test data here if needed
  },
},
```

## Adding a new interaction

**1. Add the interaction in the consumer test:**

```ts
test('POST /users', async () => {
  await pact.addInteraction({
    uponReceiving: 'a request to create a user',
    withRequest: {
      method: 'POST',
      path: '/users',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Jane', status: 'ACTIVE' },
    },
    willRespondWith: {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: { id: 3, name: 'Jane', status: 'ACTIVE' },
    },
  });

  return pact.executeTest(async (mockServer) => {
    const response = await axios.post(`${mockServer.url}/users`, {
      name: 'Jane',
      status: 'ACTIVE',
    });
    expect(response.status).toBe(201);
  });
});
```

**2. Make sure the provider implements the endpoint** (it already has `POST /users`).

**3. Run tests:**

```bash
npm test
```

## Technical notes

- **ESM** — Pact v16 depends on `https-proxy-agent` v9 which is pure ESM. Jest runs with `NODE_OPTIONS='--experimental-vm-modules'` to load ESM packages natively (Node ≥ 22).
- **ts-jest** — Configured with `useESM: true` to compile TypeScript in ESM mode.
- **No Docker** — Pact ships a prebuilt Rust binary (`pact-core`) that handles the mock server and verifier natively.

## Dependencies

| Package | Role |
|---|---|
| `@pact-foundation/pact` | Contract testing (consumer + provider) |
| `jest` + `ts-jest` | Test runner with TypeScript support |
| `axios` | HTTP client used in consumer test |
| `express` | Web framework for the provider service |
