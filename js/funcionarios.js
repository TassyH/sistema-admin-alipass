/**
 * Script para a página de gerenciamento de funcionários
 * Inclui funcionalidades para importação de planilhas
 */

let funcionarios = [];

let previewData = [];

// Elementos do DOM
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

/**
 * Inicializa referências aos elementos do DOM
 */
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

/**
 * Configura os listeners de eventos
 */
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

/**
 * Carrega as empresas cadastradas para o select
 */
function loadEmpresas() {
    while (empresaSelect.options.length > 1) {
        empresaSelect.remove(1);
    }
    

    
    fetch('http://localhost:3002/admin/empresas', {
        mode: 'cors' 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar empresas: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data && data.empresas && data.empresas.length > 0) {
            // Adiciona as empresas ao select
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
            
            // Adiciona as empresas ao select
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

/**
 * Mostra indicador de carregamento com mensagem personalizada
 */
function showLoading(message = 'Carregando...') {
    loadingModal.classList.remove('hidden');
    document.getElementById('loading-message').textContent = message;
}

/**
 * Esconde indicador de carregamento
 */
function hideLoading() {
    loadingModal.classList.add('hidden');
}

/**
 * Carrega os dados dos funcionários da empresa selecionada
 */
function loadFuncionarios() {
    funcionarios = [];
    
    // Verifica se há uma empresa selecionada
    const empresaId = empresaSelect.value;
    if (!empresaId) {
        renderFuncionariosTable();
        return;
    }
    
    // Mostra indicador de carregamento
    showLoading('Carregando funcionários...');
    
    fetch(`http://localhost:3002/empresa/${empresaId}/funcionarios`, {
        mode: 'cors' 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar funcionários: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data && data.funcionarios && Array.isArray(data.funcionarios)) {
            funcionarios = data.funcionarios.map(func => ({
                id: func.id_funcionario,
                nome: func.nome,
                cpf: func.cpf,
                email: func.email,
                empresa: func.empresa_nome || getEmpresaNome(empresaId),
                empresaId: empresaId,
                cep: func.cep,
                logradouro: func.logradouro,
                numero: func.numero,
                complemento: func.complemento,
                bairro: func.bairro,
                cidade: func.cidade,
                estado: func.estado,
                saldo: parseFloat(func.saldo) || 0,
                telefone: func.celular || func.telefone, 
            }));
        }
        
        renderFuncionariosTable();
        hideLoading();
    })
    .catch(error => {
        console.error('Erro ao carregar funcionários:', error);
        const savedFuncionarios = localStorage.getItem('alipass_funcionarios');
        if (savedFuncionarios) {
            funcionarios = JSON.parse(savedFuncionarios);
            if (empresaId) {
                funcionarios = funcionarios.filter(f => f.empresaId == empresaId);
            }
            alert('Usando dados locais. API indisponível.');
        }
        
        renderFuncionariosTable();
        hideLoading();
    });
}

/**
 * Renderiza a tabela de funcionários
 */
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
            <td>${funcionario.telefone}</td>
            <td>${funcionario.whatsapp}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Pré-visualiza o arquivo selecionado
 */
function previewFile() {
    if (!fileUpload.files.length) return;
    
    const file = fileUpload.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        alert('Formato de arquivo não suportado. Por favor, selecione um arquivo .csv, .xlsx ou .xls.');
        return;
    }
    
    loadingModal.classList.remove('hidden');
    document.getElementById('loading-message').textContent = 'Processando planilha...';
    
    if (fileExtension === 'csv') {
        processCSV(file);
    } else {
        processExcel(file);
    }
}

/**
 * Processa arquivo CSV
 */
function processCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const contents = e.target.result;
        const lines = contents.split('\n');
        
        const headers = lines[0].split(',').map(header => header.trim());
        
        // Mapeia os índices das colunas esperadas
        const indices = {
            nome: headers.indexOf('Nome'),
            cpf: headers.indexOf('CPF'),
            email: headers.indexOf('Email'),
            cep: headers.indexOf('CEP'),
            cidade: headers.indexOf('Cidade'),
            bairro: headers.indexOf('Bairro'),
            saldo: headers.indexOf('Saldo'),
            telefone: headers.indexOf('Telefone'),
            whatsapp: headers.indexOf('WhatsApp')
        };
        
        // Verifica se todas as colunas necessárias existem
        const missingColumns = Object.entries(indices)
            .filter(([_, index]) => index === -1)
            .map(([key, _]) => key);
        
        if (missingColumns.length > 0) {
            hideLoadingModal();
            alert(`As seguintes colunas estão faltando na planilha: ${missingColumns.join(', ')}`);
            return;
        }
        
        // Processa as linhas de dados
        previewData = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Pula linhas vazias
            
            const values = lines[i].split(',').map(value => value.trim());
            
            // Cria o objeto de funcionário
            const funcionario = {
                nome: values[indices.nome],
                cpf: values[indices.cpf],
                email: values[indices.email],
                empresa: getEmpresaNome(empresaSelect.value),
                empresaId: empresaSelect.value,
                cep: values[indices.cep],
                cidade: values[indices.cidade],
                bairro: values[indices.bairro],
                saldo: parseFloat(values[indices.saldo]) || 0,
                telefone: values[indices.telefone],
                whatsapp: values[indices.whatsapp]
            };
            
            previewData.push(funcionario);
        }
        
        // Atualiza a tabela de pré-visualização
        renderPreviewTable();
        hideLoadingModal();
    };
    
    reader.onerror = function() {
        hideLoadingModal();
        alert('Erro ao ler o arquivo.');
    };
    
    reader.readAsText(file);
}

/**
 * Processa arquivo Excel (XLSX/XLS)
 */
function processExcel(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Assume que queremos a primeira planilha
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Converte para JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Assume que a primeira linha contém os cabeçalhos
            const headers = jsonData[0];
            
            // Mapeia os índices das colunas esperadas
            const indices = {
                nome: headers.indexOf('Nome'),
                cpf: headers.indexOf('CPF'),
                email: headers.indexOf('Email'),
                cep: headers.indexOf('CEP'),
                cidade: headers.indexOf('Cidade'),
                bairro: headers.indexOf('Bairro'),
                saldo: headers.indexOf('Saldo'),
                telefone: headers.indexOf('Telefone'),
                whatsapp: headers.indexOf('WhatsApp')
            };
            
            // Verifica se todas as colunas necessárias existem
            const missingColumns = Object.entries(indices)
                .filter(([_, index]) => index === -1)
                .map(([key, _]) => key);
            
            if (missingColumns.length > 0) {
                hideLoadingModal();
                alert(`As seguintes colunas estão faltando na planilha: ${missingColumns.join(', ')}`);
                return;
            }
            
            // Processa as linhas de dados
            previewData = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue; // Pula linhas vazias
                
                // Cria o objeto de funcionário
                const funcionario = {
                    nome: row[indices.nome],
                    cpf: row[indices.cpf],
                    email: row[indices.email],
                    empresa: getEmpresaNome(empresaSelect.value),
                    empresaId: empresaSelect.value,
                    cep: row[indices.cep],
                    cidade: row[indices.cidade],
                    bairro: row[indices.bairro],
                    saldo: parseFloat(row[indices.saldo]) || 0,
                    telefone: row[indices.telefone],
                    whatsapp: row[indices.whatsapp]
                };
                
                previewData.push(funcionario);
            }
            
            // Atualiza a tabela de pré-visualização
            renderPreviewTable();
            hideLoadingModal();
            
        } catch (error) {
            console.error('Erro ao processar arquivo Excel:', error);
            hideLoadingModal();
            alert('Erro ao processar o arquivo Excel.');
        }
    };
    
    reader.onerror = function() {
        hideLoadingModal();
        alert('Erro ao ler o arquivo.');
    };
    
    reader.readAsArrayBuffer(file);
}

/**
 * Renderiza a tabela de pré-visualização
 */
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
    
    previewData.forEach(funcionario => {
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
            <td>${funcionario.telefone}</td>
            <td>${funcionario.whatsapp}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Importa os dados da pré-visualização
 */
function importFile() {
    if (previewData.length === 0) {
        alert('Não há dados para importar.');
        return;
    }
    
    // Mostra o modal de carregamento
    loadingModal.classList.remove('hidden');
    document.getElementById('loading-message').textContent = 'Importando dados...';
    
    // Simula uma chamada de API (em um ambiente real, isso seria uma requisição AJAX)
    setTimeout(() => {
        // Adiciona IDs aos funcionários
        previewData.forEach(funcionario => {
            funcionario.id = Date.now().toString() + Math.floor(Math.random() * 1000);
        });
        
        // Adiciona os funcionários ao array
        funcionarios = [...funcionarios, ...previewData];
        
        // Salva no localStorage
        localStorage.setItem('alipass_funcionarios', JSON.stringify(funcionarios));
        
        // Atualiza a tabela de funcionários
        renderFuncionariosTable();
        
        // Esconde o modal de carregamento
        hideLoadingModal();
        
        // Mostra o modal de resultado
        document.getElementById('result-title').textContent = 'Importação Concluída';
        document.getElementById('result-message').textContent = 
            `${previewData.length} funcionários foram importados com sucesso.`;
        resultModal.classList.remove('hidden');
        
        // Limpa a pré-visualização
        previewData = [];
        previewSection.classList.add('hidden');
        
        // Reseta o formulário
        fileUpload.value = '';
        fileInfo.textContent = 'Nenhum arquivo selecionado';
        btnPreview.disabled = true;
        btnImport.disabled = true;
    }, 1500); // Simula um atraso de 1.5 segundos para a chamada da API
}

/**
 * Esconde o modal de carregamento
 */
function hideLoadingModal() {
    loadingModal.classList.add('hidden');
}

/**
 * Obtém o nome da empresa pelo ID
 */
function getEmpresaNome(empresaId) {
    // Verifica se há uma opção selecionada com esse ID no select
    const option = empresaSelect.querySelector(`option[value="${empresaId}"]`);
    if (option) {
        return option.textContent;
    }
    
    // Caso não encontre no select, tenta buscar no localStorage
    const savedEmpresas = localStorage.getItem('alipass_empresas');
    if (savedEmpresas) {
        const empresas = JSON.parse(savedEmpresas);
        const empresa = empresas.find(e => e.id == empresaId);
        if (empresa) {
            return empresa.nome_fantasia || empresa.razao_social;
        }
    }
    
    return 'Empresa não encontrada';
}