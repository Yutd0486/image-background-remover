export const runtime = 'edge'

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', message: 'route works' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}