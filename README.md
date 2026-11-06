# website-motiva-bolsas
Website da Empresa Motiva Bolsas

## Atualização automática do Prismic

1. Configure `PRISMIC_WEBHOOK_SECRET` no ambiente de produção com um segredo aleatório privado. Use um segredo próprio para o webhook, separado do token de acesso à API do Prismic.
2. Publique a aplicação com essa variável disponível em runtime.
3. No repositório `bolsafacil-ba` do Prismic, abra **Settings > Webhooks** e crie ou edite o webhook:
   - URL: `https://www.motivabolsas.com.br/api/prismic/webhook`
   - Secret: o mesmo valor de `PRISMIC_WEBHOOK_SECRET`.
   - Triggers: publicação e despublicação de documentos, incluindo releases se utilizadas.
4. Execute o teste do webhook no Prismic. A resposta esperada é HTTP 200 com `revalidated: true`. Reative o webhook caso esteja desabilitado por falhas anteriores.

O Prismic envia um POST com o campo `secret` no corpo JSON. A rota invalida a tag `prismic`, usada pelo cliente em produção, e o conteúdo atualizado é buscado no próximo acesso. Páginas já abertas precisam ser recarregadas.

`POST /api/revalidate` também aceita o mesmo webhook, para compatibilidade com configurações existentes. `GET /api/revalidate` continua disponível para revalidação manual.

Sem o segredo configurado, o POST retorna 503; JSON inválido retorna 400; segredo ausente ou incorreto retorna 401.
