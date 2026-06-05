import { PactV3 } from '@pact-foundation/pact';
import axios from 'axios';

const pact = new PactV3({
  consumer: 'UserApp',
  provider: 'UserService',
  port: 1234,
});

describe('User API contract', () => {
  test('GET /users/1', async () => {
    await pact.addInteraction({
      states: [{ description: 'user exists' }],
      uponReceiving: 'a request for user 1',
      withRequest: {
        method: 'GET',
        path: '/users/1',
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          id: 1,
          name: 'John',
          status: 'ACTIVE',
        },
      },
    });

    return pact.executeTest(async (mockServer) => {
      const response = await axios.get(`${mockServer.url}/users/1`);

      expect(response.data).toEqual({
        id: 1,
        name: 'John',
        status: 'ACTIVE',
      });
    });
  });
});
