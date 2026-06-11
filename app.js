/**
 * NEXUS FINANCE // GLOBAL ENGINE APPLICATION ARCHITECTURE
 * CORE STATE LOGISTIC SYNC STORAGE ARRAYS
 */
let currentPersona = localStorage.getItem('nexus_persona') || '';
let incomes = JSON.parse(localStorage.getItem('nexus_incomes')) || [];
let expenses = JSON.parse(localStorage.getItem('nexus_expenses')) || [];
let obligations = JSON.parse(localStorage.getItem('nexus_obligations')) || [];
let historicalArchives = JSON.parse(localStorage.getItem('nexus_historical_vault')) || [];
let usersDatabase = JSON.parse(localStorage.getItem('nexus_users_db')) || [
    { username: "admin", password: "password", persona: "Professional" }
];
let activeCurrentUser = localStorage.getItem('nexus_active_user') || '';
let authMode = 'login';
let miniChartInstance = null;
let macroPieChartInstance = null;

/**
 * APPLICATION FRAMEWORK LAYER VIEW ROUTER
 */
function switchPage(pageId) {
    const screens = ['home-page', 'login-page', 'income-page', 'diary-page', 'checklist-page', 'analytics-page', 'history-page'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.remove('hidden');

    const nav = document.getElementById('main-nav');
    if (pageId === 'home-page' || pageId === 'login-page') {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
        document.getElementById('persona-badge').innerText = `${activeCurrentUser} (${currentPersona})`;
        document.getElementById('persona-badge').classList.remove('hidden');
        
        // Contextual Engine Triggers based on routing state
        if (pageId === 'analytics-page') renderMacroPieChartMatrix();
        if (pageId === 'history-page') renderHistoricalVaultTimeline();
    }
}

/**
 * DEMOGRAPHIC IDENTITY SELECTION PARSER
 */
function selectPersona(selectedRole) {
    currentPersona = selectedRole;
    localStorage.setItem('nexus_persona', selectedRole);
    setAuthMode('login');
    switchPage('login-page');
}

function setAuthMode(mode) {
    authMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const fieldEmail = document.getElementById('field-email');
    const fieldConfirmPass = document.getElementById('field-confirm-password');
    const submitBtn = document.getElementById('auth-submit-btn');
    const errorEl = document.getElementById('auth-error-msg');
    
    errorEl.classList.add('hidden');
    document.getElementById('auth-form').reset();

    if (mode === 'signup') {
        tabLogin.className = "flex-1 text-center font-bold tracking-wider text-xs uppercase py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-300";
        tabSignup.className = "flex-1 text-center font-black tracking-wider text-xs uppercase py-2 border-b-2 border-blue-500 text-white";
        fieldEmail.classList.remove('hidden');
        fieldConfirmPass.classList.remove('hidden');
        submitBtn.innerText = "Register New Workspace Node";
    } else {
        tabLogin.className = "flex-1 text-center font-black tracking-wider text-xs uppercase py-2 border-b-2 border-blue-500 text-white";
        tabSignup.className = "flex-1 text-center font-bold tracking-wider text-xs uppercase py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-300";
        fieldEmail.classList.add('hidden');
        fieldConfirmPass.classList.add('hidden');
        submitBtn.innerText = "Establish Secure Pipeline Sync";
    }
}

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const pass = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error-msg');

    if (authMode === 'signup') {
        const confirmPass = document.getElementById('auth-confirm-password').value;
        if (pass !== confirmPass) {
            errorEl.innerText = "CRITICAL FAILURE: Key phrases do not align with validation metric.";
            errorEl.classList.remove('hidden');
            return;
        }
        const userExists = usersDatabase.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (userExists) {
            errorEl.innerText = "SECURITY CONFLICT: Node Identifier already reserved.";
            errorEl.classList.remove('hidden');
            return;
        }
        usersDatabase.push({ username, password: pass, persona: currentPersona });
        localStorage.setItem('nexus_users_db', JSON.stringify(usersDatabase));
        activeCurrentUser = username;
        localStorage.setItem('nexus_active_user', username);
        incomes = []; expenses = []; obligations = [];
        applyPersonaDefaults();
    } else {
        const foundUser = usersDatabase.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
        if (!foundUser) {
            errorEl.innerText = "ACCESS REJECTED: Mismatching credential metrics.";
            errorEl.classList.remove('hidden');
            return;
        }
        activeCurrentUser = foundUser.username;
        currentPersona = foundUser.persona;
        localStorage.setItem('nexus_active_user', foundUser.username);
        localStorage.setItem('nexus_persona', foundUser.persona);
    }
    switchPage('income-page');
    renderAll();
});

function applyPersonaDefaults() {
    if (incomes.length === 0 && expenses.length === 0 && obligations.length === 0) {
        if (currentPersona === 'College Student') {
            incomes = [{ id: 101, source: "Research Lab Stipend Allowance", amount: 1200.00, type: "Household Allowance", date: "6/11/2026" }];
            expenses = [{ id: 201, desc: "Academic Learning Materials Pack", amount: 145.50, category: "Academics/Growth", date: "6/11/2026" }];
            obligations = [{ id: 301, title: "Campus Network Infrastructure", amount: 50.00, completed: false }];
        } else if (currentPersona === 'Homemaker') {
            incomes = [{ id: 102, source: "Central Domestic Operating Allocation", amount: 4000.00, type: "Household Allowance", date: "6/11/2026" }];
            expenses = [{ id: 202, desc: "Organic Provisions Wholesale Pack", amount: 320.00, category: "Logistics/Utilities", date: "6/11/2026" }];
            obligations = [{ id: 302, title: "Central Power Grid Obligation", amount: 180.00, completed: true }];
        } else {
            incomes = [{ id: 103, source: "Senior Enterprise Engineering Salary", amount: 6500.00, type: "Active Core", date: "6/11/2026" }];
            expenses = [{ id: 203, desc: "AWS Distributed Cloud Architecture", amount: 89.00, category: "Operational", date: "6/11/2026" }];
            obligations = [{ id: 303, title: "Central Corporate Dedicated Space", amount: 1100.00, completed: false }];
        }
        saveAllToStorage();
    }
}

function logout() {
    activeCurrentUser = '';
    localStorage.removeItem('nexus_active_user');
    switchPage('home-page');
}

function saveAllToStorage() {
    localStorage.setItem('nexus_incomes', JSON.stringify(incomes));
    localStorage.setItem('nexus_expenses', JSON.stringify(expenses));
    localStorage.setItem('nexus_obligations', JSON.stringify(obligations));
    localStorage.setItem('nexus_historical_vault', JSON.stringify(historicalArchives));
}

// ================= MACRO TRACKING SYSTEM DATA ENGINE VISUALIZERS =================
function renderMacroPieChartMatrix() {
    const totalEarnings = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0) + obligations.reduce((sum, item) => sum + (item.completed ? item.amount : 0), 0);
    const totalSavings = Math.max(0, totalEarnings - totalExpenses);

    const ctx = document.getElementById('macroDistributionPieChart').getContext('2d');
    if (macroPieChartInstance) macroPieChartInstance.destroy();

    if (totalEarnings === 0 && totalExpenses === 0) {
        ctx.clearRect(0, 0, 300, 300);
        return;
    }

    macroPieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Earning Flow ($)', 'Expense Allocation ($)', 'Retained Savings ($)'],
            datasets: [{
                data: [totalEarnings, totalExpenses, totalSavings],
                backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'monospace', size: 11 } }
                }
            }
        }
    });
}

/**
 * SECURE CONTENT ISOLATION TRANSMISSION VECTOR
 * Encodes only the non-sensitive itemized dynamic expenses into a link format.
 */
function generateSecureSharePayload() {
    if (expenses.length === 0) {
        alert("TRANSMISSION ERROR: Ledger contains no target variable records to parse.");
        return;
    }

    // Isolate only structural description and value parameters
    const safePayload = expenses.map(e => ({ d: e.desc, a: e.amount, c: e.category }));
    const base64Packet = btoa(JSON.stringify(safePayload));
    const uniqueTransmissionUrl = `${window.location.origin}${window.location.pathname}?sharePacket=${base64Packet}`;

    navigator.clipboard.writeText(uniqueTransmissionUrl).then(() => {
        alert("SECURE PAYLOAD DISPATCHED: Itemized monthly expenses wrapped and copied directly to clipboard.");
    }).catch(() => {
        alert(`Payload compiled successfully: ${uniqueTransmissionUrl}`);
    });
}

/**
 * IN-MEMORY RESTRUCTURING INTERCEPT VECTOR FOR COMPILING LOG TARGET LINKS
 */
function processIncomingSharedPayload() {
    const urlParams = new URLSearchParams(window.location.search);
    const packet = urlParams.get('sharePacket');
    if (!packet) return;

    try {
        const decodedString = atob(packet);
        const externalExpenses = JSON.parse(decodedString);

        setTimeout(() => {
            alert(`🔍 SYSTEM MANIFEST: Reading external shared record payload (${externalExpenses.length} entries detected). Clear system state to return to normal operation.`);
            // Present inbound shared data logs seamlessly in visual arrays
            expenses = externalExpenses.map((e, idx) => ({ id: idx, desc: e.d, amount: e.a, category: e.c, date: "Shared Item" }));
            incomes = []; obligations = [];
            switchPage('diary-page');
            renderAll();
        }, 600);
    } catch (err) {
        console.error("METRIC PARSING REJECTION: Encoded package corrupt.", err);
    }
}

/**
 * ARCHIVE DATA INTERCEPT METRIC LOG ENGINE
 */
function sealAndArchiveCurrentCycle() {
    const labelInput = document.getElementById('archive-month-label');
    const periodLabel = labelInput.value.trim();

    if (!periodLabel) {
        alert("ARCHIVE REJECTION: Valid classification period string required.");
        return;
    }

    const totalEarnings = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0) + obligations.reduce((sum, item) => sum + (item.completed ? item.amount : 0), 0);
    
    const historicalNode = {
        id: Date.now(),
        period: periodLabel,
        earnings: totalEarnings,
        outflows: totalExpenses,
        savings: Math.max(0, totalEarnings - totalExpenses),
        rawSnapshot: [...expenses]
    };

    historicalArchives.unshift(historicalNode);
    
    // Clear primary volatile tracking matrices to restart cycle
    expenses = [];
    obligations = obligations.map(o => ({ ...o, completed: false }));
    
    saveAllToStorage();
    labelInput.value = '';
    alert(`Vault entry generated for ${periodLabel}. Core operational indices reset.`);
    switchPage('history-page');
}

/**
 * RENDER HISTORY VAULT INDEX TIMELINE
 */
function renderHistoricalVaultTimeline() {
    const root = document.getElementById('history-timeline-root');
    root.innerHTML = '';

    if (historicalArchives.length === 0) {
        root.innerHTML = `<p class="text-slate-600 text-center font-mono py-16 text-xs tracking-widest">⚠️ VAULT REPOSITORIES UNPOPULATED.</p>`;
        return;
    }

    historicalArchives.forEach(archive => {
        const block = document.createElement('div');
        block.className = "relative pl-8 space-y-2 group animate-fadeIn";
        block.innerHTML = `
            <div class="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-4 border-slate-950 group-hover:scale-125 transition-transform"></div>
            <div class="bg-slate-900 p-5 rounded-xl border border-slate-800/80 shadow-md">
                <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                    <h4 class="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">${archive.period}</h4>
                    <span class="text-[10px] font-mono text-slate-500">ID: ${archive.id}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-slate-950/60 p-2 rounded border border-slate-850">
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Revenue</span>
                        <span class="text-xs font-mono font-bold text-emerald-400">+$${archive.earnings.toFixed(2)}</span>
                    </div>
                    <div class="bg-slate-950/60 p-2 rounded border border-slate-850">
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Outflow</span>
                        <span class="text-xs font-mono font-bold text-red-400">-$${archive.outflows.toFixed(2)}</span>
                    </div>
                    <div class="bg-slate-950/60 p-2 rounded border border-slate-850">
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Retained</span>
                        <span class="text-xs font-mono font-bold text-blue-400">$${archive.savings.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        root.appendChild(block);
    });
}

// ================= REST OF RECURRING CORE LOGIC LAYERS =================
document.getElementById('income-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const source = document.getElementById('inc-source').value.trim();
    const amount = parseFloat(document.getElementById('inc-amount').value);
    const type = document.getElementById('inc-type').value;
    incomes.push({ id: Date.now(), source, amount, type, date: new Date().toLocaleDateString() });
    saveAllToStorage();
    document.getElementById('income-form').reset();
    renderIncomes();
});

function deleteIncome(id) {
    incomes = incomes.filter(item => item.id !== id);
    saveAllToStorage();
    renderIncomes();
}

function renderIncomes() {
    const listEl = document.getElementById('income-list');
    const totalEl = document.getElementById('income-total');
    if (!listEl) return;
    listEl.innerHTML = '';
    let totalInflow = 0;

    if (incomes.length === 0) {
        listEl.innerHTML = `<p class="text-slate-600 text-center py-16 font-mono text-xs tracking-widest">⚠️ NO ACTIVE ACCOUNT ARRAYS MOUNTED.</p>`;
        totalEl.innerText = "$0.00";
        updateNetLiquidityMatrix(0);
        return;
    }
    incomes.forEach(item => {
        totalInflow += item.amount;
        const li = document.createElement('li');
        li.className = "flex justify-between items-center bg-slate-950/80 p-4 rounded-xl border border-slate-850";
        li.innerHTML = `
            <div class="space-y-1">
                <p class="font-bold text-slate-200 text-sm tracking-tight">${item.source}</p>
                <div class="flex gap-2 items-center text-[10px]">
                    <span class="font-mono uppercase tracking-wider bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700/60">${item.type}</span>
                    <span class="text-slate-500 font-mono">${item.date}</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-mono font-bold text-emerald-400 text-sm">+$${item.amount.toFixed(2)}</span>
                <button onclick="deleteIncome(${item.id})" class="text-slate-600 hover:text-red-400 font-black px-1 text-xs">✕</button>
            </div>
        `;
        listEl.appendChild(li);
    });
    totalEl.innerText = `$${totalInflow.toFixed(2)}`;
    updateNetLiquidityMatrix(totalInflow);
}

function updateNetLiquidityMatrix(totalInflow) {
    const totalOutflow = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalFixedObligations = obligations.reduce((sum, item) => sum + (item.completed ? 0 : item.amount), 0);
    const balance = totalInflow - totalOutflow - totalFixedObligations;
    const walletEl = document.getElementById('net-wallet-status');
    if (walletEl) {
        walletEl.innerText = `$${balance.toFixed(2)}`;
        walletEl.className = balance < 0 ? "font-mono font-bold text-red-400 text-sm" : "font-mono font-bold text-emerald-400 text-sm";
    }
}

document.getElementById('expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('exp-desc').value.trim();
    const amount = parseFloat(document.getElementById('exp-amount').value);
    const category = document.getElementById('exp-category').value;
    expenses.push({ id: Date.now(), desc, amount, category, date: new Date().toLocaleDateString() });
    saveAllToStorage();
    document.getElementById('expense-form').reset();
    renderExpenses();
});

function deleteExpense(id) {
    expenses = expenses.filter(item => item.id !== id);
    saveAllToStorage();
    renderExpenses();
}

function renderExpenses() {
    const listEl = document.getElementById('expense-list');
    const totalEl = document.getElementById('diary-total');
    if (!listEl) return;
    listEl.innerHTML = '';
    let totalSum = 0;
    let chartMetrics = { "Operational": 0, "Academics/Growth": 0, "Logistics/Utilities": 0, "Leisure": 0 };

    if (expenses.length === 0) {
        listEl.innerHTML = `<p class="text-slate-600 text-center py-20 font-mono text-xs tracking-widest">⚠️ CACHE EMPTY.</p>`;
        if (totalEl) totalEl.innerText = "$0.00";
        initMiniChartDataMatrix(chartMetrics);
        updateNetLiquidityMatrix(incomes.reduce((sum, item) => sum + item.amount, 0));
        return;
    }
    expenses.forEach(item => {
        totalSum += item.amount;
        if (chartMetrics[item.category] !== undefined) chartMetrics[item.category] += item.amount;
        const li = document.createElement('li');
        li.className = "flex justify-between items-center bg-slate-950/80 p-4 rounded-xl border border-slate-850";
        li.innerHTML = `
            <div class="space-y-1">
                <p class="font-bold text-slate-200 text-sm tracking-tight">${item.desc}</p>
                <div class="flex gap-2 items-center text-[10px]">
                    <span class="font-mono uppercase tracking-wider bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700/60">${item.category}</span>
                    <span class="text-slate-500 font-mono">${item.date}</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-mono font-bold text-red-400 text-sm">-$${item.amount.toFixed(2)}</span>
                <button onclick="deleteExpense(${item.id})" class="text-slate-600 hover:text-red-400 font-black px-1 text-xs">✕</button>
            </div>
        `;
        listEl.appendChild(li);
    });
    if (totalEl) totalEl.innerText = `$${totalSum.toFixed(2)}`;
    initMiniChartDataMatrix(chartMetrics);
    updateNetLiquidityMatrix(incomes.reduce((sum, item) => sum + item.amount, 0));
}

function initMiniChartDataMatrix(chartValues) {
    const canvas = document.getElementById('categoryMiniChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (miniChartInstance) miniChartInstance.destroy();
    miniChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(chartValues),
            datasets: [{
                data: Object.values(chartValues),
                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
                borderRadius: 4,
                barThickness: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { display: false }, y: { display: false } },
            plugins: { legend: { display: false } }
        }
    });
}

document.getElementById('checklist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('chk-title').value.trim();
    const amount = parseFloat(document.getElementById('chk-amount').value);
    obligations.push({ id: Date.now(), title, amount, completed: false });
    saveAllToStorage();
    document.getElementById('checklist-form').reset();
    renderObligations();
});

function toggleObligationStatus(id) {
    obligations = obligations.map(o => o.id === id ? { ...o, completed: !o.completed } : o);
    saveAllToStorage();
    renderObligations();
}

function deleteObligationElement(id) {
    obligations = obligations.filter(o => o.id !== id);
    saveAllToStorage();
    renderObligations();
}

function renderObligations() {
    const listEl = document.getElementById('checklist-items-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (obligations.length === 0) {
        listEl.innerHTML = `<p class="text-slate-600 text-center font-mono py-12 text-xs tracking-widest">⚠️ NO STRUCTURE BILL ENTRIES RECOGNIZED.</p>`;
        return;
    }
    obligations.forEach(o => {
        const li = document.createElement('li');
        li.className = `flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ${o.completed ? 'bg-purple-950/20 border-purple-900/50 opacity-75 shadow-inner' : 'bg-slate-950 border-slate-850/80'}`;
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" ${o.completed ? 'checked' : ''} onchange="toggleObligationStatus(${o.id})" class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-500 focus:ring-0 accent-purple-500 cursor-pointer">
                <span class="text-sm tracking-wide font-medium ${o.completed ? 'line-through text-slate-500' : 'text-slate-200'}">${o.title}</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-mono text-sm font-bold ${o.completed ? 'text-slate-500' : 'text-purple-400'}">$${o.amount.toFixed(2)}</span>
                <button onclick="deleteObligationElement(${o.id})" class="text-slate-600 hover:text-red-400 text-xs font-bold px-1">✕</button>
            </div>
        `;
        listEl.appendChild(li);
    });
    updateNetLiquidityMatrix(incomes.reduce((sum, item) => sum + item.amount, 0));
}

let calcExpression = '';
function pressCalc(value) {
    const screen = document.getElementById('calc-screen');
    if (value === 'C') {
        calcExpression = '';
        screen.value = '0';
    } else if (value === '=') {
        try {
            if (calcExpression.trim() !== '') {
                let result = new Function(`return ${calcExpression}`)();
                screen.value = Number(result.toFixed(2)).toString();
                calcExpression = screen.value;
            }
        } catch (err) {
            screen.value = 'Error';
            calcExpression = '';
        }
    } else {
        if (['+', '-', '*', '/'].includes(value) && ['+', '-', '*', '/'].includes(calcExpression.slice(-1))) return;
        calcExpression += value;
        screen.value = calcExpression;
    }
}

function useCalcAmount() {
    const screenValue = parseFloat(document.getElementById('calc-screen').value);
    if (!isNaN(screenValue) && screenValue > 0) {
        document.getElementById('exp-amount').value = screenValue;
    }
}

function renderAll() {
    renderIncomes();
    renderExpenses();
    renderObligations();
}

// Initial Boot Execution Pipelines
processIncomingSharedPayload();

if (activeCurrentUser && !window.location.search.includes('sharePacket')) {
    switchPage('income-page');
    renderAll();
} else if (!window.location.search.includes('sharePacket')) {
    switchPage('home-page');
}