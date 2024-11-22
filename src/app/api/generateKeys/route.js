export async function POST(req) {
    try {
      const { primeP, primeQ } = await req.json();
      const p = parseInt(primeP, 10);
      const q = parseInt(primeQ, 10);
  
      console.log("Received P:", p, "Received Q:", q); // 입력 확인
  
      if (!isPrime(p) || !isPrime(q)) {
        console.error("Invalid primes. P or Q is not a prime number.");
        return new Response(
          JSON.stringify({ error: "P와 Q는 소수여야 합니다!" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      const n = p * q;
      const phi = (p - 1) * (q - 1);
      const e = 65537;
  
      console.log("Calculating modInverse...");
      const d = modInverse(e, phi);
  
      if (!d) {
        console.error("Failed to calculate modular inverse.");
        return new Response(
          JSON.stringify({ error: "모듈러 역원을 계산할 수 없습니다!" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      console.log("Keys generated successfully.");
      const publicKey = `n=${n}, e=${e}`;
      const privateKey = `n=${n}, d=${d}`;
  
      return new Response(JSON.stringify({ publicKey, privateKey }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Key generation failed:", error);
      return new Response(
        JSON.stringify({ error: "키 생성에 실패했습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  