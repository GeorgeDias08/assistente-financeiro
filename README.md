# 💰 Assistente Financeiro PWA

O **Assistente Financeiro** é uma aplicação web moderna e responsiva voltada para o controle de finanças pessoais. O projeto permite registrar receitas e despesas, calcular o saldo em tempo real e persistir os dados localmente. Além disso, conta com integração assíncrona com o Google Sheets via Google Apps Script e suporte completo a PWA (Progressive Web App).

---

## 📷 Demonstração

![Demonstração do Assistente Financeiro](assets/preview.png)

---

## 🚀 Funcionalidades

* **Gerenciamento de Transações:** Adição e remoção de entradas (receitas) e saídas (despesas).
* **Painel Inteligente:** Atualização em tempo real do saldo total, entradas e saídas com formatação em Real (R$).
* **Validação de Dados:** Filtro em tempo real para impedir a digitação de números e símbolos no campo de descrição.
* **Persistência Local:** Salvamento automático das transações no `localStorage` do navegador.
* **Integração com a Nuvem:** Envio assíncrono para planilha do Google com notificação por e-mail.
* **Recursos PWA:** Instalação direta no smartphone/desktop e suporte a cache offline via Service Worker.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5** (Estrutura semântica)
* **CSS3** (Variáveis CSS, Flexbox, CSS Grid e responsividade)
* **JavaScript ES6+** (Manipulação do DOM, Fetch API, LocalStorage)
* **Service Workers & Manifest** (PWA e suporte offline)
* **Google Apps Script** (Persistência em nuvem)

---

## 🔐 Configuração e Execução

Caso deseje conectar o projeto à sua própria planilha do Google:

1. Clone o repositório:
   ```bash
   git clone [https://github.com/GeorgeDias08/assistente-financeiro.git](https://github.com/GeorgeDias08/assistente-financeiro.git)