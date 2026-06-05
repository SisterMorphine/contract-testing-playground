import { Verifier } from '@pact-foundation/pact';
import { startServer } from '../userService';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('User Service Provider Contract', () => {
  let server: Server;

  beforeAll(() => {
    // Start the provider service on port 3000
    server = startServer(3000);
  });

  afterAll(() => {
    server.close();
  });

  it('should verify the contract', () => {
    const verifier = new Verifier({
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: [path.join(__dirname, '../../pacts/UserApp-UserService.json')],
      stateHandlers: {
        'user exists': async () => {
          // user 1 is seeded in the mock db by default — nothing to set up
        },
      },
    });

    return verifier.verifyProvider();
  });
});
