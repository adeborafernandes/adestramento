# Caderno do Ozzy

App privado para as aulas de adestramento, lição de casa, biblioteca, vídeos e saúde do Ozzy.
Next.js 15 + Supabase (login, banco, arquivos) + Vercel. Responsivo (celular e computador).

## 1. Supabase
1. Crie um projeto em supabase.com.
2. **SQL Editor** → cole e rode `supabase/migrations/0001_init.sql`, depois `supabase/seed.sql`
   (ajuste os e-mails; o seu já está como administradora).
3. **Authentication → Sign In / Providers**: mantenha *Email* ativo e ative *Google*
   (Client ID/Secret criados no Google Cloud → APIs e serviços → Credenciais → ID do cliente OAuth,
   com o *Callback URL* que o Supabase mostra na tela do provedor).
4. **Authentication → URL Configuration**: *Site URL* = endereço do app na Vercel;
   em *Redirect URLs* adicione `https://SEU-APP.vercel.app/**` e `http://localhost:3000/**`.
5. **Project Settings → API**: copie a URL e a *publishable key*.

## 2. Vercel
1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel: *Add New → Project* → importe o repositório.
3. Em *Environment Variables* crie:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy.

## Rodar local
```bash
cp .env.example .env.local   # preencha
npm install
npm run dev
```

## Permissões
| Papel | Aulas, lição, biblioteca, vídeos | Saúde | Conta/acessos |
|---|---|---|---|
| admin | edita | edita | gerencia |
| editor | edita | edita | — |
| comentarista (Silvia) | lê, comenta, salva materiais | não vê | — |

Só e-mails em `allowed_emails` conseguem criar conta (e-mail/senha ou Google); o bloqueio é no banco.
Arquivos ficam em buckets privados (`videos` até 50 MB, `clinico` até 20 MB) com links temporários.
Em planos gratuitos do Supabase o limite por arquivo é 50 MB; para vídeos maiores use a opção de link.
