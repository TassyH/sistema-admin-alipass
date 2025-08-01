/**
 * Script para a página de gerenciamento de empresas
 */

// Array para armazenar os dados das empresas (simulação de banco de dados)
let empresas = [];

// Elementos do DOM
let empresaForm;
let empresaTable;
let empresaFormSection;
let empresaTableSection;
let noEmpresasMessage;
let deleteModal;
let empresaIdToDelete;

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa elementos do DOM
    initElements();
    
    // Configura eventos
    setupEventListeners();
    
    // Carrega dados das empresas
    loadEmpresas();
});

/**
 * Inicializa referências aos elementos do DOM
 */
function initElements() {
    empresaForm = document.getElementById('empresa-form');
    empresaTable = document.getElementById('empresa-table');
    empresaFormSection = document.getElementById('empresa-form-section');
    empresaTableSection = document.getElementById('empresa-table-section');
    noEmpresasMessage = document.getElementById('no-empresas-message');
    deleteModal = document.getElementById('delete-modal');
}

/**
 * Configura os listeners de eventos
 */
function setupEventListeners() {
    // Botão para mostrar formulário de nova empresa
    document.getElementById('btn-new-empresa').addEventListener('click', showEmpresaForm);
    
    // Botão para cancelar cadastro
    document.getElementById('btn-cancel-empresa').addEventListener('click', hideEmpresaForm);
    
    // Formulário de cadastro
    empresaForm.addEventListener('submit', saveEmpresa);
    
    // Botões do modal de confirmação de exclusão
    document.getElementById('btn-cancel-delete').addEventListener('click', hideDeleteModal);
    document.getElementById('btn-confirm-delete').addEventListener('click', confirmDeleteEmpresa);
    
    // Evento para buscar CEP quando o campo perder o foco
    document.getElementById('cep').addEventListener('blur', function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length === 8) {
            fetchAddressByCep(cep);
        }
    });
    
    // Máscara para o campo de CNPJ
    document.getElementById('cnpj').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);
        
        if (value.length > 12) {
            this.value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        } else if (value.length > 8) {
            this.value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, "$1.$2.$3/$4");
        } else if (value.length > 5) {
            this.value = value.replace(/^(\d{2})(\d{3})(\d{1,3})$/, "$1.$2.$3");
        } else if (value.length > 2) {
            this.value = value.replace(/^(\d{2})(\d{1,3})$/, "$1.$2");
        } else {
            this.value = value;
        }
    });
    
    // Máscara para o campo de telefone
    document.getElementById('telefone').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            this.value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
        } else if (value.length > 6) {
            this.value = value.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, "($1) $2-$3");
        } else if (value.length > 2) {
            this.value = value.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
        } else {
            this.value = value;
        }
    });
    
    // Máscara para o campo de CEP
    document.getElementById('cep').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        
        if (value.length > 5) {
            this.value = value.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
        } else {
            this.value = value;
        }
    });
}

/**
 * Busca endereço pelo CEP usando a API ViaCEP
 */
function fetchAddressByCep(cep) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById('logradouro').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
                // Foca no campo número após preencher o endereço
                document.getElementById('numero').focus();
            }
        })
        .catch(error => console.error('Erro ao buscar CEP:', error));
}

/**
 * Carrega os dados das empresas
 * Em um ambiente real, isso seria uma chamada para uma API
 */
function loadEmpresas() {
    // Verifica se há dados salvos no localStorage
    const savedEmpresas = localStorage.getItem('alipass_empresas');
    if (savedEmpresas) {
        empresas = JSON.parse(savedEmpresas);
    }
    
    // Atualiza a tabela
    renderEmpresasTable();
}

/**
 * Renderiza a tabela de empresas
 */
function renderEmpresasTable() {
    const tbody = empresaTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (empresas.length === 0) {
        empresaTableSection.classList.add('hidden');
        noEmpresasMessage.classList.remove('hidden');
        return;
    }
    
    empresaTableSection.classList.remove('hidden');
    noEmpresasMessage.classList.add('hidden');
    
    empresas.forEach(empresa => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${empresa.nome}</td>
            <td>${empresa.cnpj}</td>
            <td>${empresa.email}</td>
            <td>${empresa.telefone}</td>
            <td>${empresa.cidade}/${empresa.estado}</td>
            <td class="actions">
                <button class="action-btn edit-btn" data-id="${empresa.id}" title="Editar">
                    ✏️
                </button>
                <button class="action-btn delete-btn" data-id="${empresa.id}" title="Excluir">
                    🗑️
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adiciona eventos aos botões de ação
    addActionButtonsEvents();
}

/**
 * Adiciona eventos aos botões de ação da tabela
 */
function addActionButtonsEvents() {
    // Botões de editar
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editEmpresa(id);
        });
    });
    
    // Botões de excluir
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showDeleteModal(id);
        });
    });
}

/**
 * Mostra o formulário de cadastro de empresa
 */
function showEmpresaForm() {
    // Limpa o formulário
    empresaForm.reset();
    // Remove o ID do formulário (caso esteja em modo de edição)
    empresaForm.removeAttribute('data-id');
    // Mostra o formulário
    empresaFormSection.classList.remove('hidden');
    // Foca no primeiro campo
    document.getElementById('nome').focus();
}

/**
 * Esconde o formulário de cadastro de empresa
 */
function hideEmpresaForm() {
    empresaFormSection.classList.add('hidden');
}

/**
 * Salva os dados da empresa (novo cadastro ou edição)
 */
function saveEmpresa(event) {
    event.preventDefault();
    
    // Obtém os dados do formulário
    const formData = new FormData(empresaForm);
    const empresaData = {
        nome: formData.get('nome'),
        cnpj: formData.get('cnpj'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        cep: formData.get('cep'),
        logradouro: formData.get('logradouro'),
        numero: formData.get('numero'),
        complemento: formData.get('complemento'),
        bairro: formData.get('bairro'),
        cidade: formData.get('cidade'),
        estado: formData.get('estado')
    };
    
    // Verifica se é uma edição ou novo cadastro
    const empresaId = empresaForm.getAttribute('data-id');
    
    if (empresaId) {
        // Edição de empresa existente
        const index = empresas.findIndex(e => e.id == empresaId);
        if (index !== -1) {
            empresaData.id = empresaId;
            empresas[index] = empresaData;
        }
    } else {
        // Nova empresa
        empresaData.id = Date.now().toString(); // ID único baseado no timestamp
        empresas.push(empresaData);
    }
    
    // Salva no localStorage
    localStorage.setItem('alipass_empresas', JSON.stringify(empresas));
    
    // Atualiza a tabela
    renderEmpresasTable();
    
    // Esconde o formulário
    hideEmpresaForm();
    
    // Exibe mensagem de sucesso
    alert(empresaId ? 'Empresa atualizada com sucesso!' : 'Empresa cadastrada com sucesso!');
}

/**
 * Carrega os dados de uma empresa para edição
 */
function editEmpresa(id) {
    const empresa = empresas.find(e => e.id == id);
    if (!empresa) return;
    
    // Preenche o formulário com os dados da empresa
    document.getElementById('nome').value = empresa.nome;
    document.getElementById('cnpj').value = empresa.cnpj;
    document.getElementById('email').value = empresa.email;
    document.getElementById('telefone').value = empresa.telefone;
    document.getElementById('cep').value = empresa.cep;
    document.getElementById('logradouro').value = empresa.logradouro;
    document.getElementById('numero').value = empresa.numero;
    document.getElementById('complemento').value = empresa.complemento || '';
    document.getElementById('bairro').value = empresa.bairro;
    document.getElementById('cidade').value = empresa.cidade;
    document.getElementById('estado').value = empresa.estado;
    
    // Define o ID no formulário para identificar que é uma edição
    empresaForm.setAttribute('data-id', id);
    
    // Mostra o formulário
    empresaFormSection.classList.remove('hidden');
    
    // Foca no primeiro campo
    document.getElementById('nome').focus();
}

/**
 * Mostra o modal de confirmação de exclusão
 */
function showDeleteModal(id) {
    empresaIdToDelete = id;
    deleteModal.classList.remove('hidden');
}

/**
 * Esconde o modal de confirmação de exclusão
 */
function hideDeleteModal() {
    deleteModal.classList.add('hidden');
    empresaIdToDelete = null;
}

/**
 * Confirma a exclusão da empresa
 */
function confirmDeleteEmpresa() {
    if (!empresaIdToDelete) return;
    
    // Remove a empresa do array
    empresas = empresas.filter(e => e.id != empresaIdToDelete);
    
    // Salva no localStorage
    localStorage.setItem('alipass_empresas', JSON.stringify(empresas));
    
    // Atualiza a tabela
    renderEmpresasTable();
    
    // Esconde o modal
    hideDeleteModal();
    
    // Exibe mensagem de sucesso
    alert('Empresa excluída com sucesso!');
}