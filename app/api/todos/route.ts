const UPSTREAM = "https://jsonplaceholder.typicode.com";

export async function GET() {
  const res = await fetch(`${UPSTREAM}/todos`);
  const data = await res.json();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${UPSTREAM}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
