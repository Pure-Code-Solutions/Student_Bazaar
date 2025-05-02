import { HttpRequest } from "@aws-sdk/protocol-http";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Sha256 } from "@aws-crypto/sha256-js";
import { URL } from "url";

const REGION = "us-west-2";
const ENDPOINT = process.env.OPENSEARCH_ENDPOINT;
const PORT = parseInt(process.env.OPENSEARCH_PORT || '443'); // fallback for safety

console.log("Connecting to OpenSearch at:", ENDPOINT);

async function sendSignedRequest(method, path, query = {}, body = null) {
  const url = new URL(`${ENDPOINT}${path}`);
  const request = new HttpRequest({
    method,
    protocol: url.protocol,
    hostname: url.hostname,
    port: PORT,
    path: url.pathname,
    query,
    headers: {
      host: url.hostname,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const signer = new SignatureV4({
    service: "es",
    region: REGION,
    credentials: defaultProvider(),
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);
  
  // TEMP FIX: Allow self-signed cert during local tunnel to OpenSearch (localhost -> AWS cert mismatch)
  const { response } = await new NodeHttpHandler({
    httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: false })
  }).handle(signedRequest);

  //Original line
  //const { response } = await new NodeHttpHandler().handle(signedRequest);

  return streamToString(response.body);
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export async function searchIndex(index, queryObject) {
  return sendSignedRequest("POST", `/${index}/_search`, {}, queryObject);
}

export async function indexDocument(index, document) {
  return sendSignedRequest("POST", `/${index}/_doc`, {}, document);
}

export async function deleteIndex(index) {
  return sendSignedRequest("DELETE", `/${index}`);
}

export { sendSignedRequest };