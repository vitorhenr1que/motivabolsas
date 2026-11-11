const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, modules) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Response, Map, console: { error() {}, log() {} },
    process: { env: { INTER_ACCOUNT: 'test' } },
    require(name) {
      if (!(name in modules)) throw new Error(`Unexpected import: ${name}`);
      return modules[name];
    },
  });
  return exports;
}

function setup() {
  let period = '2027.1';
  let records = new Map();
  let renewals = 0;
  const notifications = [];
  const prisma = {
    async $transaction(callback) {
      const pending = new Map(records);
      let updated = false;
      const result = await callback({
        captureSettings: { findUnique: async () => ({ period }) },
        paymentPeriod: {
          findUnique: async ({ where }) => pending.get(where.codigoSolicitacao) ?? null,
          createMany: async ({ data }) => {
            if (pending.has(data.codigoSolicitacao)) return { count: 0 };
            pending.set(data.codigoSolicitacao, data);
            return { count: 1 };
          },
        },
        user: {
          updateMany: async () => ({ count: 0 }),
          update: async ({ where }) => {
            if (where.cpf !== 'valid-cpf') throw new Error('User not found');
            updated = true;
            return { id: 'user', renovacao: renewals + 1 };
          },
        },
      });
      records = pending;
      if (updated) renewals++;
      return result;
    },
    paymentPeriod: {
      findMany: async ({ where }) => [...records.values()].filter(row => where.codigoSolicitacao.in.includes(row.codigoSolicitacao)),
    },
  };
  const { getCapturePeriod } = load('src/app/lib/capture-period.ts', {
    '../services/prisma': { prisma },
    '../scripts/calcularSemestre': { calcularSemestre: () => '2026.2' },
  });
  const { registerInterPayment } = load('src/app/lib/payment-period.ts', {
    '../services/prisma': { prisma }, './capture-period': { getCapturePeriod },
  });
  const webhook = load('src/app/api/cobrancas/webhook/route.ts', {
    '@/app/services/prisma': { prisma },
    '@/app/lib/payment-period': { registerInterPayment },
    axios: { post: async (...args) => { notifications.push(args); } },
  });
  return {
    prisma, webhook, registerInterPayment, notifications,
    setPeriod: value => { period = value; },
    records: () => records, renewals: () => renewals,
  };
}

const request = payload => new Request('http://localhost', { method: 'POST', body: JSON.stringify(payload) });
const event = (code, status = 'RECEBIDO') => ({ codigoSolicitacao: code, seuNumero: 'valid-cpf', situacao: status });

test('preserves the confirmed period after settings change and webhook retries', async () => {
  const app = setup();
  assert.equal((await app.webhook.POST(request(event('first')))).status, 200);
  app.setPeriod('2027.2');
  assert.equal((await app.webhook.POST(request(event('first')))).status, 200);
  assert.equal((await app.webhook.POST(request(event('second')))).status, 200);
  assert.equal(app.records().get('first').period, '2027.1');
  assert.equal(app.records().get('second').period, '2027.2');
  assert.equal(app.renewals(), 2);
  assert.equal(app.notifications.length, 2);
});

test('registers every received event in a batch, including marked received', async () => {
  const app = setup();
  assert.equal((await app.webhook.POST(request([
    event('one'), event('two', 'MARCADO_RECEBIDO'), event('ignored', 'CANCELADO'),
  ]))).status, 200);
  assert.deepEqual([...app.records().keys()], ['one', 'two']);
  assert.equal(app.notifications[1][1].event[0].codigoSolicitacao, 'two');
});

test('rolls back period when user update fails, allowing a safe retry', async () => {
  const app = setup();
  const invalid = { ...event('retry'), seuNumero: 'missing-user' };
  assert.equal((await app.webhook.POST(request(invalid))).status, 500);
  assert.equal(app.records().size, 0);
  assert.equal(app.renewals(), 0);
  assert.equal((await app.webhook.POST(request(event('retry')))).status, 200);
  assert.equal(app.records().size, 1);
});

test('rejects confirmations without a charge reference', async () => {
  const app = setup();
  assert.equal((await app.webhook.POST(request(event('')))).status, 500);
  assert.equal(app.records().size, 0);
});

test('history uses saved periods and leaves legacy payments without an invented period', async () => {
  const app = setup();
  await app.registerInterPayment('saved', 'valid-cpf');
  app.setPeriod('2028.1');
  const find = load('src/app/api/boletos/find/route.ts', {
    '../../../services/prisma': { prisma: app.prisma },
    '../../../lib/interMtls': { createInterHttpsAgent: () => ({}) },
    axios: { get: async () => ({ data: {
      totalElementos: 2,
      cobrancas: [
        { cobranca: { codigoSolicitacao: 'saved', dataVencimento: '2028-08-01' } },
        { cobranca: { codigoSolicitacao: 'legacy', dataVencimento: '2025-01-01' } },
      ],
    } }) },
  });
  const response = await find.POST(request({ interToken: 'test', initialDate: '2025-01-01', finalDate: '2028-12-31', cpf: '12345678900' }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.cobrancas[0].cobranca.period, '2027.1');
  assert.equal(result.cobrancas[1].cobranca.period, null);
  assert.equal(result.totalElementos, 2);
});
