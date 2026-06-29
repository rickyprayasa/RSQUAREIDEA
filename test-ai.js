const fetch = require('node-fetch');
async function test() {
    const res = await fetch('http://localhost:3000/api/ai/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // using a mocked cookie for auth if needed? No, I'll bypass auth for testing by creating a temp route.
    });
}
test();
