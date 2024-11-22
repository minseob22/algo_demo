import { createVerify } from "crypto";

export async function POST(req) {
  try {
    const { publicKey, message, signature } = await req.json();

    const [n, e] = publicKey.split(", ").map((part) => part.split("=")[1]);

    const verify = createVerify("SHA256");
    verify.update(message);
    verify.end();

    const isValid = verify.verify({ key: publicKey }, signature, "base64");

    return new Response(JSON.stringify({ isValid }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Signature verification failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
