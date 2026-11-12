const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup(images = ['qr-image']) {
  const calls = [];
  const { outputText } = ts.transpileModule(fs.readFileSync('src/app/api/download-comprovante/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const modules = {
    'next/server': { NextResponse: class extends Response {
      static json(data, options) { return Response.json(data, options); }
    } },
    '../../scripts/calcularSemestre': { calcularSemestre: () => '2027.1' },
    '../../scripts/calcularDesconto': { calcularDesconto: () => 40 },
    '../../services/googleApisAuth': {
      duplicateGoogleDoc: async () => 'temporary-doc',
      listImageObjectIds: async (id) => { calls.push(['images', id]); return images; },
      replaceTextsAndImagesInGoogleDoc: async (...args) => calls.push(['replace', ...args]),
      exportGoogleDocAsPDF: async () => Buffer.from('%PDF-test'),
      deleteGoogleDoc: async (id) => calls.push(['delete', id]),
    },
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Response, URL, Uint8Array, Date,
    console: { log() {}, error() {} },
    require(name) {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
  });
  const request = new Request('https://localhost:3000/api/download-comprovante', {
    method: 'POST',
    headers: { host: 'www.motivabolsas.com.br', 'x-forwarded-proto': 'https' },
    body: JSON.stringify({ name: 'Aluno', cpf: 'test', course: 'Enfermagem', instituition: 'FAZAG', discount: '40', createdAt: '2026-11-06', id: 'student-id' }),
  });
  return { run: () => exports.POST(request), calls };
}

test('generates PDF behind a TLS proxy without an internal HTTP request', async () => {
  const { run, calls } = setup();
  const response = await run();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/pdf');
  assert.equal(await response.text(), '%PDF-test');
  const replacement = calls.find(([type]) => type === 'replace')[3][0];
  assert.equal(replacement.imageObjectId, 'qr-image');
  const qr = new URL(replacement.imageUrl);
  assert.equal(qr.origin, 'https://www.motivabolsas.com.br');
  assert.equal(qr.searchParams.get('text'), 'https://www.motivabolsas.com.br/consulta/student-id');
  assert.deepEqual(calls.at(-1), ['delete', 'temporary-doc']);
});

test('cleans up the copied document when the template has no QR image', async () => {
  const { run, calls } = setup([]);
  const response = await run();
  assert.equal(response.status, 500);
  assert.match((await response.json()).details, /QR code/);
  assert.equal(calls.some(([type]) => type === 'replace'), false);
  assert.deepEqual(calls.at(-1), ['delete', 'temporary-doc']);
});
