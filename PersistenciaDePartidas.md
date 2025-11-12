# 📄 Documentação do Jogo da Memória: Persistência

## Decisões Técnicas e de Negócio

Este projeto agora inclui a funcionalidade de **persistência de partidas** para que o usuário possa continuar o jogo após fechar o navegador.

| Aspecto | Decisão | Racional |
| :--- | :--- | :--- |
| **Método de Persistência** | **LocalStorage (Lado do Cliente)** | Decisão de negócio para simplicidade, velocidade e não depender do servidor. |
| **Formato do Dado** | **JSON Serializado** | Armazena o estado completo do jogo (incluindo a ordem das cartas, as cartas viradas e as tentativas) em uma única string. |
| **Implementação** | **`script.js`** | Implementado via JavaScript, sem alterações nos arquivos PHP de backend (`salvar_pontuacao.php` ou banco de dados), mantendo o escopo restrito à experiência do usuário. |
