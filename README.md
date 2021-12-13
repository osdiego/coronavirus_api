# Desenvolvimento Web

## Atividade 4 - Front-end da API

Comentários sobre o funcionamento da API:

- É necessário rodar o comando "npm i" antes de correr o programa.

- Para aceder ao front-end acesse: http://localhost:8000

- Após o registo de um novo utilizador, deverá ir ao terminal do seu IDE e fazer ctrl+click no URL com o formato:  https://ethereal.email/message/... e ativar a conta criada.

- Existe uma conta teste já criada:

  - email: covid@api.pt
  - password: 1234

- Se fizer refresh à pagina web após ter feito login, a token não irá ser destruída, isto significa que a página vai ter um comportamento diferente do esperado. Terá de fazer login outra vez e de seguida logout para repor o estado inicial da página.

- É possivel que ao clicar no botão News ou Search após fazer login, o conteúdo não seja visível. Ao clicar outra vez em um dos botões o conteúdo irá aparecer.
