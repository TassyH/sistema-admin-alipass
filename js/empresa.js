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
 * Tenta carregar da API e, se não conseguir, usa o localStorage como fallback
 */
function loadEmpresas() {
     // Mostra loading
        showLoading();
        
        // Faz requisição para a API
        fetch('http://localhost:3002/empresas', {
            mode: 'cors' // Adicionado para lidar com possíveis problemas de certificado
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar empresas: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                empresas = data;
                renderEmpresasTable();
                hideLoading();
            })
            .catch(error => {
                console.error('Erro ao carregar empresas:', error);
                // Fallback para localStorage caso a API falhe
                const savedEmpresas = localStorage.getItem('alipass_empresas');
                if (savedEmpresas) {
                    empresas = JSON.parse(savedEmpresas);
                    renderEmpresasTable();
                    alert('Usando dados locais. API indisponível.');
                }
                hideLoading();
            });
    }

    /**
     * Mostra indicador de carregamento
     */
    function showLoading() {
        // Cria ou mostra elemento de loading
        let loadingElement = document.getElementById('loading-empresas');
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'loading-empresas';
            loadingElement.innerHTML = 'Carregando empresas...';
            loadingElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 20px;
                border-radius: 5px;
                z-index: 1000;
            `;
            document.body.appendChild(loadingElement);
        }
        loadingElement.style.display = 'block';
    }

    /**
     * Esconde indicador de carregamento
     */
    function hideLoading() {
        const loadingElement = document.getElementById('loading-empresas');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
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
            <td>${empresa.nome_fantasia || empresa.razao_social || ''}</td>
            <td>${empresa.cnpj || ''}</td>
            <td>${empresa.email || ''}</td>
            <td>${empresa.telefone || ''}</td>
            <td>${(empresa.cidade || '')}/${(empresa.estado || '')}</td>
            <td class="actions">
                <button class="action-btn edit-btn" data-id="${empresa.id}" title="Editar">
                    ✏️
                </button>
                <button class="action-btn toggle-status-btn" data-id="${empresa.id}" data-status="${empresa.status}" title="${empresa.status == 1 ? 'Desativar' : 'Ativar'}">
                    ${empresa.status == 1 ? '🟢':'🔴'}
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
    
    // Botões de desativar/ativar
    const toggleStatusButtons = document.querySelectorAll('.toggle-status-btn');
    toggleStatusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const status = this.getAttribute('data-status');
            toggleEmpresaStatus(id, status);
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
        razao_social: formData.get('razao_social'),
        nome_fantasia: formData.get('nome_fantasia'),
        cnpj: formData.get('cnpj'),
        inscricao_estadual: formData.get('inscricao_estadual'),
        data_abertura: formData.get('data_abertura'),
        segmento: formData.get('segmento'),
        porte: formData.get('porte'),
        logradouro: formData.get('logradouro'),
        numero: formData.get('numero'),
        complemento: formData.get('complemento'),
        bairro: formData.get('bairro'),
        cidade: formData.get('cidade'),
        estado: formData.get('estado'),
        cep: formData.get('cep'),
        telefone: formData.get('telefone'),
        celular: formData.get('celular'),
        email: formData.get('email'),
        site: formData.get('site'),
        num_funcionarios: formData.get('num_funcionarios'),
        data_adesao: formData.get('data_adesao'),
        senha: formData.get('senha'),
        banco: formData.get('banco'),
        agencia: formData.get('agencia'),
        conta: formData.get('conta'),
        tipo_conta: formData.get('tipo_conta'),
        favorecido: formData.get('favorecido'),
        cpf_cnpj_favorecido: formData.get('cpf_cnpj_favorecido'),
        status: 1 // Status ativo por padrão
    };
    
    // Verifica se é uma edição ou novo cadastro
    const empresaId = empresaForm.getAttribute('data-id');
    
    if (empresaId) {
        // Edição de empresa existente
        // Validação dos campos obrigatórios
        if (!empresaData.razao_social || !empresaData.nome_fantasia || !empresaData.cnpj || 
            !empresaData.email || !empresaData.senha || !empresaData.telefone || !empresaData.cep) {
            alert("Preencha os campos obrigatórios: razão social, nome fantasia, CNPJ, email, senha, telefone e CEP.");
            return;
        }
        
        // Mostra loading
        showLoading();
        
        // Faz requisição para a API de atualização
        // Nota: A API usa idEmpresa como parâmetro na URL
        fetch(`http://localhost:3002/admin/empresa/editar-cadastro/${empresaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(empresaData),
            mode: 'cors' // Adicionado para lidar com possíveis problemas de certificado
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar empresa: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Atualiza o objeto no array local
            const index = empresas.findIndex(e => e.id == empresaId);
            if (index !== -1) {
                empresaData.id = empresaId;
                empresas[index] = empresaData;
                
                // Salva no localStorage (para manter a compatibilidade com o código existente)
                localStorage.setItem('alipass_empresas', JSON.stringify(empresas));
            }
            
            // Atualiza a tabela
            renderEmpresasTable();
            
            // Esconde o formulário
            hideEmpresaForm();
            
            // Esconde loading
            hideLoading();
            
            // Exibe mensagem de sucesso
            alert('Empresa atualizada com sucesso!');
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao atualizar empresa: ' + error.message);
            hideLoading();
        })
    } else {
        // Validação dos campos obrigatórios
        if (!empresaData.razao_social || !empresaData.nome_fantasia || !empresaData.cnpj || 
            !empresaData.email || !empresaData.senha || !empresaData.telefone || !empresaData.cep) {
            alert("Preencha os campos obrigatórios: razão social, nome fantasia, CNPJ, email, senha, telefone e CEP.");
            return;
        }
        
        const targetUrl = 'http://localhost:3002/novo/empresa';
        
        // Mostra loading
        showLoading();
        
        fetch(targetUrl, {
           method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
             body: JSON.stringify(empresaData),
             mode: 'cors' // Adicionado para lidar com possíveis problemas de certificado
          })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao cadastrar empresa');
            }
            return response.json();
        })
        .then(data => {
            // Adiciona o ID retornado pela API
            empresaData.id = data.empresaId;
            
            // Adiciona ao array local
            empresas.push(empresaData);
            
            // Salva no localStorage (para manter a compatibilidade com o código existente)
            localStorage.setItem('alipass_empresas', JSON.stringify(empresas));
            
            // Atualiza a tabela
            renderEmpresasTable();
            
            // Esconde o formulário
            hideEmpresaForm();
            
            // Esconde loading
            hideLoading();
            
            // Exibe mensagem de sucesso
            alert('Empresa cadastrada com sucesso!');
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao cadastrar empresa: ' + error.message);
            hideLoading();
        });
    }
}

/**
 * Carrega os dados de uma empresa para edição
 */
function editEmpresa(id) {
    const empresa = empresas.find(e => e.id == id);
    if (!empresa) return;
    
    // Preenche o formulário com os dados da empresa
    document.getElementById('razao_social').value = empresa.razao_social || '';
    document.getElementById('nome_fantasia').value = empresa.nome_fantasia || '';
    document.getElementById('cnpj').value = empresa.cnpj || '';
    document.getElementById('inscricao_estadual').value = empresa.inscricao_estadual || '';
    document.getElementById('data_abertura').value = empresa.data_abertura || '';
    document.getElementById('segmento').value = empresa.segmento || '';
    document.getElementById('porte').value = empresa.porte || '';
    document.getElementById('num_funcionarios').value = empresa.num_funcionarios || '';
    document.getElementById('email').value = empresa.email || '';
    document.getElementById('senha').value = empresa.senha || '';
    document.getElementById('telefone').value = empresa.telefone || '';
    document.getElementById('celular').value = empresa.celular || '';
    document.getElementById('site').value = empresa.site || '';
    document.getElementById('data_adesao').value = empresa.data_adesao || '';
    document.getElementById('cep').value = empresa.cep || '';
    document.getElementById('logradouro').value = empresa.logradouro || '';
    document.getElementById('numero').value = empresa.numero || '';
    document.getElementById('complemento').value = empresa.complemento || '';
    document.getElementById('bairro').value = empresa.bairro || '';
    document.getElementById('cidade').value = empresa.cidade || '';
    document.getElementById('estado').value = empresa.estado || '';
    document.getElementById('banco').value = empresa.banco || '';
    document.getElementById('agencia').value = empresa.agencia || '';
    document.getElementById('conta').value = empresa.conta || '';
    document.getElementById('tipo_conta').value = empresa.tipo_conta || '';
    document.getElementById('favorecido').value = empresa.favorecido || '';
    document.getElementById('cpf_cnpj_favorecido').value = empresa.cpf_cnpj_favorecido || '';
    
    // Define o ID no formulário para identificar que é uma edição
    empresaForm.setAttribute('data-id', id);
    
    // Mostra o formulário
    empresaFormSection.classList.remove('hidden');
    
    // Foca no primeiro campo
    document.getElementById('razao_social').focus();
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

/**
 * Desativa ou ativa uma empresa
 */
function toggleEmpresaStatus(id, currentStatus) {
    const empresa = empresas.find(e => e.id == id);
    if (!empresa) return;
    
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 0 ? 'desativar' : 'ativar';
    
    if (!confirm(`Tem certeza que deseja ${action} esta empresa?`)) {
        return;
    }
    
    // Mostra loading
    showLoading();
    
    // Faz requisição para a API de desativação
    fetch(`http://localhost:3002/admin/empresa/desativar/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao ${action} empresa: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Atualiza o status da empresa no array local
        empresa.status = newStatus;
        
        // Salva no localStorage
        localStorage.setItem('alipass_empresas', JSON.stringify(empresas));
        
        // Atualiza a tabela
        renderEmpresasTable();
        
        // Esconde loading
        hideLoading();
        
        // Exibe mensagem de sucesso
        alert(`Empresa ${action}da com sucesso!`);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert(`Erro ao ${action} empresa: ${error.message}`);
        hideLoading();
    });
}