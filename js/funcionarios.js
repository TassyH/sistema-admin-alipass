

let funcionarios = [];
let previewData = [];

let empresaSelect;
let fileUpload;
let fileInfo;
let btnPreview;
let btnImport;
let previewTable;
let previewSection;
let noPreviewMessage;
let funcionariosTable;
let funcionariosSection;
let noFuncionariosMessage;
let loadingModal;
let resultModal;

document.addEventListener('DOMContentLoaded', function() {
    initElements();
    setupEventListeners();
    loadEmpresas();
    loadFuncionarios();
});


function initElements() {
    empresaSelect = document.getElementById('empresa-select');
    fileUpload = document.getElementById('file-upload');
    fileInfo = document.getElementById('file-info');
    btnPreview = document.getElementById('btn-preview');
    btnImport = document.getElementById('btn-import');
    previewTable = document.getElementById('preview-table');
    previewSection = document.getElementById('preview-section');
    noPreviewMessage = document.getElementById('no-preview-message');
    funcionariosTable = document.getElementById('funcionarios-table');
    funcionariosSection = document.getElementById('funcionarios-section');
    noFuncionariosMessage = document.getElementById('no-funcionarios-message');
    loadingModal = document.getElementById('loading-modal');
    resultModal = document.getElementById('result-modal');
}


function setupEventListeners() {
    empresaSelect.addEventListener('change', function() {
        fileUpload.disabled = !this.value;
        if (!this.value) {
            fileUpload.value = '';
            fileInfo.textContent = 'Nenhum arquivo selecionado';
            btnPreview.disabled = true;
            btnImport.disabled = true;
        }
        loadFuncionarios();
    });
    
    fileUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            fileInfo.textContent = `Arquivo selecionado: ${file.name}`;
            btnPreview.disabled = false;
        } else {
            fileInfo.textContent = 'Nenhum arquivo selecionado';
            btnPreview.disabled = true;
            btnImport.disabled = true;
        }
    });
    
    btnPreview.addEventListener('click', previewFile);
    btnImport.addEventListener('click', importFile);
    document.getElementById('btn-close-result').addEventListener('click', function() {
        resultModal.classList.add('hidden');
    });
}


function loadEmpresas() {
    while (empresaSelect.options.length > 1) {
        empresaSelect.remove(1);
    }

    fetch('http://localhost:3002/admin/empresas', { mode: 'cors' })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar empresas: ' + response.status);
            return response.json();
        })
        .then(data => {
            if (data?.empresas?.length) {
                data.empresas.forEach(empresa => {
                    const option = document.createElement('option');
                    option.value = empresa.id;
                    option.textContent = empresa.nome_fantasia || empresa.razao_social;
                    empresaSelect.appendChild(option);
                });
            }
            hideLoading();
        })
        .catch(error => {
            console.error('Erro ao carregar empresas:', error);
            const savedEmpresas = localStorage.getItem('alipass_empresas');
            if (savedEmpresas) {
                const empresas = JSON.parse(savedEmpresas);
                empresas.forEach(empresa => {
                    const option = document.createElement('option');
                    option.value = empresa.id;
                    option.textContent = empresa.nome_fantasia || empresa.razao_social;
                    empresaSelect.appendChild(option);
                });
                alert('Usando dados locais. API indisponível.');
            }
            hideLoading();
        });
}


function showLoading(message = 'Carregando...') {
    loadingModal.classList.remove('hidden');
    document.getElementById('loading-message').textContent = message;
}

function hideLoading() {
    loadingModal.classList.add('hidden');
}


function loadFuncionarios() {
    funcionarios = [];
    const empresaId = empresaSelect.value;

    if (!empresaId) {
        renderFuncionariosTable();
        return;
    }

    showLoading('Carregando funcionários...');

    fetch(`http://localhost:3002/empresa/${empresaId}/funcionarios`, { mode: 'cors' })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar funcionários: ' + response.status);
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.funcionarios)) {
                funcionarios = data.funcionarios.map(func => ({
                    id: func.id_funcionario,
                    nome: func.nome,
                    cpf: func.cpf,
                    email: func.email,
                    empresa: func.empresa_nome || getEmpresaNome(empresaId),
                    empresaId: empresaId,
                    cep: func.cep,
                    cidade: func.cidade,
                    bairro: func.bairro,
                    saldo: parseFloat(func.saldo) || 0,
                    celular: func.celular,
                    whatsapp: func.whatsapp
                }));
            }
            renderFuncionariosTable();
            hideLoading();
        })
        .catch(error => {
            console.error('Erro ao carregar funcionários:', error);
            hideLoading();
        });
}


function renderFuncionariosTable() {
    const tbody = funcionariosTable.querySelector('tbody');
    tbody.innerHTML = '';

    if (funcionarios.length === 0) {
        funcionariosSection.classList.add('hidden');
        noFuncionariosMessage.classList.remove('hidden');
        return;
    }

    funcionariosSection.classList.remove('hidden');
    noFuncionariosMessage.classList.add('hidden');

    funcionarios.forEach(funcionario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${funcionario.nome}</td>
            <td>${funcionario.cpf}</td>
            <td>${funcionario.email}</td>
            <td>${funcionario.empresa}</td>
            <td>${funcionario.cep}</td>
            <td>${funcionario.cidade}</td>
            <td>${funcionario.bairro}</td>
            <td>R$ ${funcionario.saldo.toFixed(2)}</td>
            <td>${funcionario.celular}</td>
            <td>${funcionario.whatsapp || '-'}</td>
            <td class="actions">
                <button class="action-btn toggle-status-btn" data-id="${funcionario.id}" data-status="${funcionario.ativo || 1}" title="${(funcionario.ativo || 1) == 1 ? 'Desativar' : 'Ativar'}">
                    ${(funcionario.ativo || 1) == 1 ? '🟢' : '🔴'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    addActionButtonsEvents();
}


function previewFile() {
    if (!fileUpload.files.length) return;

    const file = fileUpload.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        alert('Formato de arquivo não suportado. Selecione um arquivo .csv, .xlsx ou .xls.');
        return;
    }

    showLoading('Processando planilha...');

    if (fileExtension === 'csv') processCSV(file);
    else processExcel(file);
}


function processCSV(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const lines = e.target.result.split('\n').map(line => line.trim()).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());

        const indices = {
            nome: headers.indexOf('Nome'),
            cpf: headers.indexOf('CPF'),
            email: headers.indexOf('Email'),
            cep: headers.indexOf('CEP'),
            cidade: headers.indexOf('Cidade'),
            bairro: headers.indexOf('Bairro'),
            saldo: headers.indexOf('Saldo'),
            celular: headers.indexOf('Celular'),
            whatsapp: headers.indexOf('WhatsApp')
        };

        previewData = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (!cols[indices.nome]) continue;

            previewData.push({
                nome: cols[indices.nome],
                cpf: cols[indices.cpf],
                email: cols[indices.email],
                empresa: getEmpresaNome(empresaSelect.value),
                empresaId: empresaSelect.value,
                cep: cols[indices.cep],
                cidade: cols[indices.cidade],
                bairro: cols[indices.bairro],
                saldo: parseFloat(cols[indices.saldo]) || 0,
                celular: cols[indices.celular],
                whatsapp: cols[indices.whatsapp]
            });
        }

        renderPreviewTable();
        hideLoading();
    };

    reader.readAsText(file);
}

function processExcel(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const headers = jsonData[0];

            const indices = {
                nome: headers.indexOf('Nome'),
                cpf: headers.indexOf('CPF'),
                email: headers.indexOf('Email'),
                cep: headers.indexOf('CEP'),
                cidade: headers.indexOf('Cidade'),
                bairro: headers.indexOf('Bairro'),
                saldo: headers.indexOf('Saldo'),
                celular: headers.indexOf('Celular'),
                whatsapp: headers.indexOf('WhatsApp')
            };

            previewData = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || !row[indices.nome]) continue;

                previewData.push({
                    nome: row[indices.nome],
                    cpf: row[indices.cpf],
                    email: row[indices.email],
                    empresa: getEmpresaNome(empresaSelect.value),
                    empresaId: empresaSelect.value,
                    cep: row[indices.cep],
                    cidade: row[indices.cidade],
                    bairro: row[indices.bairro],
                    saldo: parseFloat(row[indices.saldo]) || 0,
                    celular: row[indices.celular],
                    whatsapp: row[indices.whatsapp]
                });
            }

            renderPreviewTable();
            hideLoading();
        } catch (error) {
            console.error('Erro ao processar Excel:', error);
            hideLoading();
            alert('Erro ao processar arquivo Excel.');
        }
    };

    reader.readAsArrayBuffer(file);
}


function renderPreviewTable() {
    const tbody = previewTable.querySelector('tbody');
    tbody.innerHTML = '';

    if (previewData.length === 0) {
        previewSection.classList.add('hidden');
        noPreviewMessage.classList.remove('hidden');
        btnImport.disabled = true;
        return;
    }

    previewSection.classList.remove('hidden');
    noPreviewMessage.classList.add('hidden');
    btnImport.disabled = false;

    previewData.forEach(func => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${func.nome}</td>
            <td>${func.cpf}</td>
            <td>${func.email}</td>
            <td>${func.empresa}</td>
            <td>${func.cep}</td>
            <td>${func.cidade}</td>
            <td>${func.bairro}</td>
            <td>R$ ${func.saldo.toFixed(2)}</td>
            <td>${func.celular}</td>
            <td>${func.whatsapp || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}


async function importFile() {
    if (!previewData.length) {
        alert('Nenhum dado para importar.');
        return;
    }

    const empresaId = empresaSelect.value;
    if (!empresaId) {
        alert('Selecione uma empresa antes de importar.');
        return;
    }

    showLoading('Importando dados...');

    try {
        const response = await fetch(`http://localhost:3002/empresa/${empresaId}/funcionarios/importar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ funcionarios: previewData })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.mensagem || 'Erro ao importar.');

        loadFuncionarios();
        hideLoading();

        document.getElementById('result-title').textContent = 'Importação concluída';
        document.getElementById('result-message').textContent = `${data.importados || previewData.length} funcionários importados com sucesso.`;
        resultModal.classList.remove('hidden');

        previewData = [];
        previewSection.classList.add('hidden');
        fileUpload.value = '';
        fileInfo.textContent = 'Nenhum arquivo selecionado';
        btnPreview.disabled = true;
        btnImport.disabled = true;
    } catch (error) {
        console.error('Erro ao importar funcionários:', error);
        hideLoading();
        alert('Erro ao importar: ' + error.message);
    }
}


function getEmpresaNome(empresaId) {
    const option = empresaSelect.querySelector(`option[value="${empresaId}"]`);
    if (option) return option.textContent;

    const savedEmpresas = localStorage.getItem('alipass_empresas');
    if (savedEmpresas) {
        const empresa = JSON.parse(savedEmpresas).find(e => e.id == empresaId);
        if (empresa) return empresa.nome_fantasia || empresa.razao_social;
    }
    return 'Empresa não encontrada';
}

function addActionButtonsEvents() {
    const toggleStatusButtons = document.querySelectorAll('.toggle-status-btn');
    toggleStatusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const status = this.getAttribute('data-status');
            toggleFuncionarioStatus(id, status);
        });
    });
}


function toggleFuncionarioStatus(id, currentStatus) {
    const funcionario = funcionarios.find(f => f.id == id);
    if (!funcionario) return;
    
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 0 ? 'desativar' : 'ativar';
    
    if (!confirm(`Tem certeza que deseja ${action} este funcionário?`)) {
        return;
    }
    
    showLoading();
    
    fetch(`http://localhost:3002/admin/funcionario/desativar/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao ${action} funcionário: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        funcionario.ativo = newStatus;
        
        localStorage.setItem('alipass_funcionarios', JSON.stringify(funcionarios));
        
        renderFuncionariosTable();
        
        hideLoading();
        
        alert(`Funcionário ${action}do com sucesso!`);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert(`Erro ao ${action} funcionário: ${error.message}`);
        hideLoading();
    });
}
