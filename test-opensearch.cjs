const { HttpRequest } = require("@aws-sdk/protocol-http");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const { Sha256 } = require("@aws-crypto/sha256-js");
const { URL } = require("url");

const REGION = "us-west-2"; 
const ENDPOINT = "https://localhost:9200"; 

async function queryOpenSearch() {
  const url = new URL(`${ENDPOINT}/_cat/indices?v`);

  const request = new HttpRequest({
    method: "GET",
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    headers: {
      host: url.hostname,
    },
  });

  const signer = new SignatureV4({
    service: "es",
    region: REGION,
    credentials: defaultProvider(),
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);
  const { response } = await new NodeHttpHandler().handle(signedRequest);

  const responseBody = await streamToString(response.body);
  console.log("Response:\n", responseBody);
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

queryOpenSearch().catch(console.error);
