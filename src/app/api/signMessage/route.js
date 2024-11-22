import { createSign } from "crypto";

export async function POST(req) {
  try {
    const { privateKey, message } = await req.json();

    const [n, d] = privateKey.split(", ").map((part) => part.split("=")[1]);

    const sign = createSign("SHA256");
    sign.update(message);
    sign.end();

    const signature = sign.sign({ key: privateKey }, "base64");

    return new Response(JSON.stringify({ signature }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Message signing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
