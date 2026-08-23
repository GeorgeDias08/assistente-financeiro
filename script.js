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

const btnOpenMenu = document.getElementById('btn-open-menu');
const btnCloseMenu = document.getElementById('btn-close-menu');
const sidebarMenu = document.getElementById('sidebar-menu');
const menuOverlay = document.getElementById('menu-overlay');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Função para formatar moeda em Real
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para atualizar valores do painel
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

// Função segura para renderizar a lista
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

// Máscara de digitação para o campo de valor
amountInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
        e.target.value = '';
        return;
    }

    value = (parseFloat(value) / 100).toFixed(2);

    e.target.value = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
});

// Bloqueia a digitação de números e símbolos na descrição
descInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
});

// Evento de envio do formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const cleanDescription = descInput.value.trim();

    // Converte a string formatada "10.000,00" de volta para número puro "10000.00"
    const rawValue = amountInput.value
        .replace(/\./g, '')
        .replace(',', '.');
    const rawAmount = parseFloat(rawValue);

    const apenasLetras = /^[A-Za-zÀ-ÿ\s]+$/;

    if (!cleanDescription || !apenasLetras.test(cleanDescription) || isNaN(rawAmount) || rawAmount <= 0) {
        alert('Por favor, insira uma descrição válida (apenas letras) e um valor maior que zero.');
        return;
    }

    const newTransaction = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        description: cleanDescription,
        amount: rawAmount,
        type: typeInput.value === 'income' ? 'income' : 'expense'
    };

    transactions.push(newTransaction);

    updateStorageAndUI();

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

// Exportar Transações para Arquivo CSV / Google Planilhas
function exportarParaCSV() {
    const transacoes = JSON.parse(localStorage.getItem('transactions')) || [];

    if (transacoes.length === 0) {
        alert('Você não possui nenhuma transação cadastrada para exportar.');
        return;
    }

    let csvContent = '\ufeffDescrição;Valor (R$);Tipo\n';

    transacoes.forEach((t) => {
        const valorFormatado = Number(t.amount).toFixed(2).replace('.', ',');
        const tipoFormatado = t.type === 'income' ? 'Entrada' : 'Saída';
        csvContent += `"${t.description}";"${valorFormatado}";"${tipoFormatado}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `financas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);

    toggleMenu();
}

// Menu Lateral Controls
function toggleMenu() {
    sidebarMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
}

btnOpenMenu?.addEventListener('click', toggleMenu);
btnCloseMenu?.addEventListener('click', toggleMenu);
menuOverlay?.addEventListener('click', toggleMenu);

const btnExportCSV = document.getElementById('btn-export-csv');
btnExportCSV?.addEventListener('click', exportarParaCSV);

// Service Worker Registration
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
        .then(() => {
            console.log("PWA ativo!");
        })
        .catch(err => {
            console.error("Erro:", err);
        });
}

// Inicializa o app ao carregar a página
renderList();
updateDashboard();