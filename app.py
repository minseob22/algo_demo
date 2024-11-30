from flask import Flask, request, render_template_string
import hashlib

def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

def modinv(a, m):
    m0, y, x = m, 0, 1
    if m == 1:
        return 0
    while a > 1:
        q = a // m
        t = m
        m = a % m
        a = t
        t = y
        y = x - q * y
        x = t
    if x < 0:
        x += m0
    return x

def generate_keys(p, q):
    n = p * q
    phi = (p - 1) * (q - 1)
    
    e = 65537
    while gcd(e, phi) != 1:
        e += 2
    
    d = modinv(e, phi)
    return (e, n), (d, n)

def hash_message(message, n):
    hash_value = int(hashlib.sha256(message.encode()).hexdigest(), 16)
    return hash_value % n

def sign_message(message, private_key):
    d, n = private_key
    message_hash = hash_message(message, n)
    signature = pow(message_hash, d, n)
    return signature

def verify_signature(message, signature, public_key):
    e, n = public_key
    message_hash = hash_message(message, n)
    verified_hash = pow(signature, e, n)
    return message_hash == verified_hash

# Example prime numbers for key generation
p = 32416190071
q = 32416187567

# Generate keys
public_key, private_key = generate_keys(p, q)

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def rsa_demo():
    message = ""
    signature = ""
    original_message_hash = ""
    decrypted_signature_hash = ""
    verification_result = None

    if request.method == 'POST':
        if 'sign' in request.form:
            # 서명 생성
            message = request.form['message']
            signature = sign_message(message, private_key)
            original_message_hash = hash_message(message, public_key[1])
        elif 'verify' in request.form:
            # 서명 검증
            message = request.form['message_verify']
            signature = int(request.form['signature'])
            original_message_hash = hash_message(message, public_key[1])
            decrypted_signature_hash = pow(signature, public_key[0], public_key[1])
            verification_result = original_message_hash == decrypted_signature_hash

    return render_template_string('''
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                min-height: 100vh;
                background-color: #f9f9f9;
            }
            .container {
                width: 400px;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-top: 20px;
            }
            .container h1 {
                font-size: 1.5em;
                text-align: center;
                margin-bottom: 20px;
            }
            .container form {
                margin-bottom: 20px;
            }
            .container label {
                display: block;
                margin: 10px 0 5px;
            }
            .container input[type="text"] {
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ccc;
                border-radius: 5px;
                width: 100%;
                box-sizing: border-box;
            }
            .container input[type="submit"] {
                padding: 10px;
                background-color: #007BFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            .container input[type="submit"]:hover {
                background-color: #0056b3;
            }
            .result {
                margin-top: 20px;
                padding: 15px;
                border-radius: 5px;
                background-color: #f0f0f0;
                color: #333;
            }
            .result.valid {
                background-color: lightgreen;
                color: green;
            }
            .result.invalid {
                background-color: lightcoral;
                color: red;
            }
        </style>
        <div class="container">
            <h1>RSA Signature Demo</h1>
            <form method="POST">
                <label for="message">Message:</label>
                <input type="text" id="message" name="message" value="{{ message }}">
                <input type="submit" name="sign" value="Sign Message">
            </form>

            <form method="POST">
                <label for="message_verify">Message (Verify):</label>
                <input type="text" id="message_verify" name="message_verify" value="{{ message }}">
                <label for="signature">Signature:</label>
                <input type="text" id="signature" name="signature" value="{{ signature }}">
                <input type="submit" name="verify" value="Verify Signature">
            </form>

            {% if message and signature %}
            <div class="result">
                <h2>Generated Signature Details:</h2>
                <p><strong>Message:</strong> {{ message }}</p>
                <p><strong>Signature:</strong> {{ signature }}</p>
                <p><strong>Message Hash:</strong> {{ original_message_hash }}</p>
            </div>
            {% endif %}

            {% if verification_result is not none %}
            <div class="result {{ 'valid' if verification_result else 'invalid' }}">
                <h2>Verification Result:</h2>
                <p><strong>Original Message Hash:</strong> {{ original_message_hash }}</p>
                <p><strong>Decrypted Signature Hash:</strong> {{ decrypted_signature_hash }}</p>
                <p><strong>Result:</strong> {{ 'Valid' if verification_result else 'Invalid' }}</p>
            </div>
            {% endif %}
        </div>
    ''', message=message, signature=signature, original_message_hash=original_message_hash, 
    decrypted_signature_hash=decrypted_signature_hash, verification_result=verification_result)



if __name__ == '__main__':
    app.run(debug=True)
