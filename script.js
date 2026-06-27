/**
 * IMPORTANTE PARA DESENVOLVEDORES:
 * A variável 'API_URL' é carregada a partir do arquivo externo 'config.js'.
 * Se você acabou de clonar este repositório, crie um arquivo chamado 'config.js'
 * na raiz do projeto e adicione: const API_URL = "SUA_URL_DO_GOOGLE_APPS_SCRIPT";
 * Isso garante que suas credenciais e URLs privadas fiquem seguras no ambiente local.
 */

const API_URL = typeof window.API_URL !== 'undefined' ? window.API_URL : '';

const form = document.getElementById('finance-form');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const listContainer = document.getElementById('transaction-list');
const emptyMsg = document.getElementById('empty-msg');

const balanceDisplay = document.getElementById('balance-val');
const incomesDisplay = document.getElementById('incomes-val');
const expensesDisplay = document.getElementById('expenses-val');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Função para formatar moeda em Real (R$)
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para atualizar os valores do painel (Saldo, Entradas, Saídas)
function updateDashboard() {
    const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);

    const total = amounts.reduce((acc, item) => acc + item, 0);

    const incomes = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => acc + item, 0);

    const expenses = Math.abs(amounts
        .filter(item => item < 0)
        .reduce((acc, item) => acc + item, 0));

    balanceDisplay.innerText = formatCurrency(total);
    incomesDisplay.innerText = formatCurrency(incomes);
    expensesDisplay.innerText = formatCurrency(expenses);

    if (total < 0) {
        balanceDisplay.style.color = 'var(--expense)';
    } else {
        balanceDisplay.style.color = 'var(--primary)';
    }
}

// SEGURANÇA: Função segura para renderizar a lista
function renderList() {
    listContainer.innerHTML = '';

    if (transactions.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    } else {
        emptyMsg.style.display = 'none';
    }

    transactions.forEach((t) => {
        const li = document.createElement('li');
        li.classList.add('transaction-item');

        const isIncome = t.type === 'income';
        const sign = isIncome ? '+' : '-';
        const classColor = isIncome ? 'plus' : 'minus';

        const itemInfo = document.createElement('div');
        itemInfo.classList.add('item-info');

        const itemTitle = document.createElement('span');
        itemTitle.classList.add('item-title');
        itemTitle.textContent = t.description; 

        const itemCategory = document.createElement('span');
        itemCategory.classList.add('item-category');
        itemCategory.textContent = isIncome ? 'Recebimento' : 'Despesa';

        itemInfo.appendChild(itemTitle);
        itemInfo.appendChild(itemCategory);

        const itemValueWrapper = document.createElement('div');
        itemValueWrapper.classList.add('item-value-wrapper');

        const itemValue = document.createElement('span');
        itemValue.classList.add('item-value', classColor);
        itemValue.textContent = `${sign} ${formatCurrency(t.amount)}`;

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btn-delete');
        btnDelete.textContent = '✕';
        btnDelete.addEventListener('click', () => deleteTransaction(t.id));

        itemValueWrapper.appendChild(itemValue);
        itemValueWrapper.appendChild(btnDelete);

        li.appendChild(itemInfo);
        li.appendChild(itemValueWrapper);
        listContainer.appendChild(li);
    });
}

// Evento de envio do formulário (Adicionar transação)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const cleanDescription = descInput.value.trim();
    const rawAmount = parseFloat(amountInput.value);

    const apenasLetras = /^[A-Za-zÀ-ÿ\s]+$/;

    if (!cleanDescription || !apenasLetras.test(cleanDescription) || isNaN(rawAmount) || rawAmount <= 0) {
        alert('Por favor, insira uma descrição válida (apenas letras) e um valor maior que zero.');
        return;
    }

    const newTransaction = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), // Gera um ID único e seguro por transação
        description: cleanDescription,
        amount: rawAmount,
        type: typeInput.value === 'income' ? 'income' : 'expense'
    };

    transactions.push(newTransaction);

    updateStorageAndUI();

    // Envia os dados de forma assíncrona para a planilha e e-mail se a API_URL existir
    if (API_URL) {
        fetch(API_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newTransaction)
        }).catch(erro => console.error("Erro ao enviar para o Google:", erro));
    } else {
        console.warn("Aviso: Dados salvos localmente, mas não enviados para a nuvem porque a 'API_URL' não está configurada.");
    }

    // Limpa os campos do formulário corretamente
    descInput.value = '';
    amountInput.value = ''; 
    descInput.focus();
});

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateStorageAndUI();
}

function updateStorageAndUI() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderList();
    updateDashboard();
}

// Inicializa o app ao carregar a página
renderList();
updateDashboard();

// Bloqueia a digitação de números e símbolos em tempo real
descInput.addEventListener('input', (e) => {
    // Substitui tudo o que NÃO for letra (A-Z) ou espaço por nada ""
    e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
});