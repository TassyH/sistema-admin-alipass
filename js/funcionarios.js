/**
 * Script para a página de gerenciamento de funcionários
 * Inclui funcionalidades para importação de planilhas
 */

// Array para armazenar os dados dos funcionários (simulação de banco de dados)
let funcionarios = [];

// Array para armazenar os dados da pré-visualização da planilha
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

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa elementos do DOM
    initElements();
    
    // Configura eventos
    setupEventListeners();
    
    // Carrega dados das empresas para o select
    loadEmpresas();
    
    // Carrega dados dos funcionários
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
    // Evento de mudança no select de empresas
    empresaSelect.addEventListener('change', function() {
        // Habilita ou desabilita o upload de arquivo conforme seleção de empresa
        fileUpload.disabled = !this.value;
        if (!this.value) {
            fileUpload.value = '';
            fileInfo.textContent = 'Nenhum arquivo selecionado';
            btnPreview.disabled = true;
            btnImport.disabled = true;
        }
    });
    
    // Evento de seleção de arquivo
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
    
    // Botão de pré-visualização
    btnPreview.addEventListener('click', previewFile);
    
    // Botão de importação
    btnImport.addEventListener('click', importFile);
    
    // Botão para fechar o modal de resultado
    document.getElementById('btn-close-result').addEventListener('click', function() {
        resultModal.classList.add('hidden');
    });
}

/**
 * Carrega as empresas cadastradas para o select
 */
function loadEmpresas() {
    // Limpa as opções existentes, mantendo apenas a opção padrão
    while (empresaSelect.options.length > 1) {
        empresaSelect.remove(1);
    }
    
    // Obtém as empresas do localStorage
    const savedEmpresas = localStorage.getItem('alipass_empresas');
    if (savedEmpresas) {
        const empresas = JSON.parse(savedEmpresas);
        
        // Adiciona as empresas ao select
        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nome;
            empresaSelect.appendChild(option);
        });
    }
}

/**
 * Carrega os dados dos funcionários
 */
function loadFuncionarios() {
    // Verifica se há dados salvos no localStorage
    const savedFuncionarios = localStorage.getItem('alipass_funcionarios');
    if (savedFuncionarios) {
        funcionarios = JSON.parse(savedFuncionarios);
    }
    
    // Atualiza a tabela
    renderFuncionariosTable();
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
    
    // Verifica se o formato do arquivo é suportado
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        alert('Formato de arquivo não suportado. Por favor, selecione um arquivo .csv, .xlsx ou .xls.');
        return;
    }
    
    // Mostra o modal de carregamento
    loadingModal.classList.remove('hidden');
    document.getElementById('loading-message').textContent = 'Processando planilha...';
    
    // Processa o arquivo conforme o tipo
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
        
        // Assume que a primeira linha contém os cabeçalhos
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
function getEmpresaNome(id) {
    // Obtém as empresas do localStorage
    const savedEmpresas = localStorage.getItem('alipass_empresas');
    if (savedEmpresas) {
        const empresas = JSON.parse(savedEmpresas);
        const empresa = empresas.find(e => e.id == id);
        return empresa ? empresa.nome : 'Empresa não encontrada';
    }
    return 'Empresa não encontrada';
}