"use client";

// Next.js 14 (NEXT14) 환경에서 RSA 디지털 서명을 구현하는 예시 코드입니다.
// 각 단계는 "키 생성", "서명 생성", "서명 검증"으로 구성됩니다.

// 필요한 모듈 설치
// npm install node-rsa crypto-js
import { useState } from 'react';
import NodeRSA from 'node-rsa';
import CryptoJS from 'crypto-js';

export default function RSADigitalSignature() {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isVerified, setIsVerified] = useState(null);

  const generateKeys = () => {
    // 키 생성
    const key = new NodeRSA({ b: 512 });
    setPrivateKey(key.exportKey('private'));
    setPublicKey(key.exportKey('public'));
  };

  const signMessage = () => {
    if (!privateKey) return alert('먼저 키를 생성하세요.');
    const key = new NodeRSA();
    key.importKey(privateKey, 'private');
    
    // 해시 생성 및 서명 과정
    const messageHash = CryptoJS.SHA256(message).toString(); // SHA-256 해시 함수 적용
    const signature = key.sign(messageHash, 'base64', 'utf8'); // 비공개 키를 이용해 서명 생성
    setSignature(signature);
  };

  const verifyMessage = () => {
    if (!publicKey || !signature) return alert('먼저 서명을 생성하세요.');
    const key = new NodeRSA();
    key.importKey(publicKey, 'public');

    // 서명 검증 과정
    const messageHash = CryptoJS.SHA256(message).toString(); // 원본 메시지 해시 생성
    const isValid = key.verify(messageHash, signature, 'utf8', 'base64'); // 공개 키를 이용해 서명 검증

    setIsVerified(isValid);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>RSA 디지털 서명 데모</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>1. 키 생성</h3>
        <button style={{ border: '1px solid black', padding: '5px' }} onClick={generateKeys}>
          키 생성
        </button>
        <div>
          <p>공개키: {publicKey}</p>
          <p>비공개키: {privateKey}</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>2. 서명 생성</h3>
        <textarea
          placeholder="메시지 입력"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button style={{ border: '1px solid black', padding: '5px' }} onClick={signMessage}>
          서명 생성
        </button>
        <div>
          <p>서명: {signature}</p>
          <p>서명 생성 과정 설명:</p>
          <ol>
            <li>1. 입력된 메시지에 대해 해시 함수(SHA-256)가 적용됩니다. 이 해시 함수는 메시지를 고정된 길이의 해시 값으로 변환합니다.</li>
            <li>2. 비공개 키를 사용하여 이 해시 값을 서명합니다. 이 암호화된 값이 디지털 서명입니다.</li>
            <li>3. 디지털 서명은 메시지와 함께 수신자에게 전달됩니다.</li>
          </ol>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>3. 서명 검증</h3>
        <button style={{ border: '1px solid black', padding: '5px' }} onClick={verifyMessage}>
          서명 검증
        </button>
        {isVerified !== null && (
          <div>
            <p>검증 결과: {isVerified ? '서명이 유효합니다.' : '서명이 유효하지 않습니다.'}</p>
            <p>서명 검증 과정 설명:</p>
            <ol>
              <li>1. 수신자는 전달받은 메시지에 대해 동일한 해시 함수를 적용하여 해시 값을 계산합니다.</li>
              <li>2. 공개 키를 사용하여 서명을 검증하고, 발신자가 생성한 해시 값인지 확인합니다.</li>
              <li>3. 두 해시 값이 같다면 데이터가 위변조되지 않았음을 증명합니다.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
