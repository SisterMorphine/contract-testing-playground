import { PactV3, MatchersV3 } from '@pact-foundation/pact';
const { like } = MatchersV3;
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
          id: like(1),
          name: like('John'),
          status: like('ACTIVE'),
        },
      },
    });

    return pact.executeTest(async (mockServer) => {
      const response = await axios.get(`${mockServer.url}/users/1`);

      expect(response.data).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        status: expect.any(String),
      });
    });
  });
});
