const UPSTREAM = "https://jsonplaceholder.typicode.com";

export async function GET() {
  const res = await fetch(`${UPSTREAM}/users`);
  const data = await res.json();
  return Response.json(data);
}
