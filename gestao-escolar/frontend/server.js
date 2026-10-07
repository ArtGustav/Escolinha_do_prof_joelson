const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const frontendDirectory = __dirname;
const backend = new URL(process.env.BACKEND_URL || "http://127.0.0.1:3000");
const port = Number(process.env.FRONTEND_PORT || 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendText(response, status, message) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function proxyApi(request, response, pathname, search) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ mensagem: "Método não permitido" }));
    return;
  }

  if (!/^\/api\/(alunos|cursos|turmas)$/.test(pathname)) {
    response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ mensagem: "Rota da API não encontrada" }));
    return;
  }

  const target = new URL(pathname.slice(4) + search, backend);
  const proxyRequest = http.request(target, {
    method: request.method,
    headers: { Accept: request.headers.accept || "application/json" }
  }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode || 502, {
      "Content-Type": proxyResponse.headers["content-type"] || "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    proxyResponse.pipe(response);
  });

  proxyRequest.on("error", (error) => {
    if (!response.headersSent) {
      response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    }
    if (!response.writableEnded) {
      response.end(JSON.stringify({ mensagem: "Não foi possível conectar ao backend", detalhe: error.message }));
    }
  });
  proxyRequest.end();
}

const server = http.createServer((request, response) => {
  let url;
  try {
    url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  } catch {
    sendText(response, 400, "Endereço inválido");
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    proxyApi(request, response, url.pathname, url.search);
    return;
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    sendText(response, 400, "Endereço inválido");
    return;
  }
  if (pathname === "/") pathname = "/index.html";

  const filePath = path.resolve(frontendDirectory, `.${pathname}`);
  if (!filePath.startsWith(frontendDirectory + path.sep)) {
    sendText(response, 403, "Acesso negado");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      sendText(response, 404, "Arquivo não encontrado");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Content-Length": stats.size,
      "X-Content-Type-Options": "nosniff"
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Frontend disponível em http://localhost:${port}`);
  console.log(`API encaminhada para ${backend.origin}`);
});
