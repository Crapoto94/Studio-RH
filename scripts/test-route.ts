import { GET } from '../app/api/agents/route'

async function test() {
  const req = new Request('http://localhost/api/agents?limit=10&page=1')
  const res = await GET(req as any)
  const json = await res.json()
  console.log('Status:', res.status)
  console.log('Result count:', json.count)
  console.log('First returned agent:', json.data?.[0]?.nom)
}

test().catch(console.error)
