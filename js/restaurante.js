/**
 * Script para a página de gerenciamento de restaurantes
 */

// Array para armazenar os dados dos restaurantes (simulação de banco de dados)
let restaurantes = [];

// Elementos do DOM
let restauranteForm;
let restauranteTable;
let restauranteFormSection;
let restauranteTableSection;
let noRestaurantesMessage;
let deleteModal;
let restauranteIdToDelete;

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa elementos do DOM
    initElements();
    
    // Configura eventos
    setupEventListeners();
    
    // Carrega dados dos restaurantes
    loadRestaurantes();
});

/**
 * Inicializa referências aos elementos do DOM
 */
function initElements() {
    restauranteForm = document.getElementById('restaurante-form');
    restauranteTable = document.getElementById('restaurante-table');
    restauranteFormSection = document.getElementById('restaurante-form-section');
    restauranteTableSection = document.getElementById('restaurante-table-section');
    noRestaurantesMessage = document.getElementById('no-restaurantes-message');
    deleteModal = document.getElementById('delete-modal');
}

/**
 * Configura os listeners de eventos
 */
function setupEventListeners() {
    // Botão para mostrar formulário de novo restaurante
    document.getElementById('btn-new-restaurante').addEventListener('click', showRestauranteForm);
    
    // Botão para cancelar cadastro
    document.getElementById('btn-cancel-restaurante').addEventListener('click', hideRestauranteForm);
    
    // Formulário de cadastro
    restauranteForm.addEventListener('submit', saveRestaurante);
    
    // Botões do modal de confirmação de exclusão
    document.getElementById('btn-cancel-delete').addEventListener('click', hideDeleteModal);
    document.getElementById('btn-confirm-delete').addEventListener('click', confirmDeleteRestaurante);
    
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
    
    // Máscara para o campo de CPF/CNPJ do titular
    document.getElementById('cpf_cnpj').addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        // Limita o tamanho (CPF = 11, CNPJ = 14)
        if (value.length > 14) value = value.slice(0, 14);
        
        // Aplica a máscara de acordo com o tamanho (CPF ou CNPJ)
        if (value.length > 11) { // CNPJ
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
        } else { // CPF
            if (value.length > 9) {
                this.value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
            } else if (value.length > 6) {
                this.value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
            } else if (value.length > 3) {
                this.value = value.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
            } else {
                this.value = value;
            }
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
    
    // Máscara para o campo de celular
    document.getElementById('celular').addEventListener('input', function() {
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
 * Carrega os dados dos restaurantes da API
 */
async function loadRestaurantes() {
    try {
        // Tenta buscar os restaurantes da API
        const response = await fetch('http://localhost:3002/restaurantes', {
            method: 'GET',
            mode: 'cors' // Importante para lidar com problemas de CORS
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Mapeia os dados da API para o formato usado na aplicação
            restaurantes = data.map(item => ({
                id: item.a003_id.toString(),
                nome: item.a003_nome,
                cnpj: item.a003_cnpj,
                descricao: item.a003_descricao,
                email: item.a003_email,
                senha: item.a003_senha,
                telefone: item.a003_telefone,
                celular: item.a003_celular,
                cel_whatsapp: item.a003_cel_whatsapp,
                cep: item.a003_cep,
                logradouro: item.a003_logradouro,
                numero: item.a003_numero,
                complemento: item.a003_complemento,
                bairro: item.a003_bairro,
                cidade: item.a003_cidade,
                estado: item.a003_estado,
                id_tipo_cozinha: item.a003_id_tipo_cozinha,
                tem_delivery: item.a003_tem_delivery,
                horario_abertura: item.a003_horario_abertura,
                horario_fechamento: item.a003_horario_fechamento,
                banco: item.a003_banco,
                agencia: item.a003_agencia,
                conta: item.a003_conta,
                tipo_conta: item.a003_tipo_conta,
                nome_titular: item.a003_nome_titular,
                cpf_cnpj: item.a003_cpf_cnpj,
                imagem_estabelecimento: item.a003_imagem_estabelecimento
            }));
        } else {
            console.error('Erro ao buscar restaurantes da API:', await response.text());
            // Fallback para localStorage se a API falhar
            const savedRestaurantes = localStorage.getItem('alipass_restaurantes');
            if (savedRestaurantes) {
                restaurantes = JSON.parse(savedRestaurantes);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar restaurantes:', error);
        // Fallback para localStorage em caso de erro
        const savedRestaurantes = localStorage.getItem('alipass_restaurantes');
        if (savedRestaurantes) {
            restaurantes = JSON.parse(savedRestaurantes);
        }
    }
    
    // Atualiza a tabela
    renderRestaurantesTable();
}

/**
 * Renderiza a tabela de restaurantes
 */
function renderRestaurantesTable() {
    const tbody = restauranteTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (restaurantes.length === 0) {
        restauranteTableSection.classList.add('hidden');
        noRestaurantesMessage.classList.remove('hidden');
        return;
    }
    
    restauranteTableSection.classList.remove('hidden');
    noRestaurantesMessage.classList.add('hidden');
    
    restaurantes.forEach(restaurante => {
        const tr = document.createElement('tr');
        
        // Verifica se os campos existem antes de exibi-los
        const nome = restaurante.nome || 'N/A';
        const cnpj = restaurante.cnpj || 'N/A';
        const email = restaurante.email || 'N/A';
        const telefone = restaurante.telefone || 'N/A';
        const cidade = restaurante.cidade || 'N/A';
        const estado = restaurante.estado || 'N/A';
        
        tr.innerHTML = `
            <td>${nome}</td>
            <td>${cnpj}</td>
            <td>${email}</td>
            <td>${telefone}</td>
            <td>${cidade}/${estado}</td>
            <td class="actions">
                <button class="action-btn edit-btn" data-id="${restaurante.id}" title="Editar">
                    ✏️
                </button>
                <button class="action-btn toggle-status-btn" data-id="${restaurante.id}" data-status="${restaurante.ativo}" title="${restaurante.ativo == 1 ? 'Desativar' : 'Ativar'}">
                    ${restaurante.ativo == 1 ? '🔴':'🟢'}
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
            editRestaurante(id);
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
            toggleRestauranteStatus(id, status);
        });
    });
}

/**
 * Mostra o formulário de cadastro de restaurante
 */
function showRestauranteForm() {
    // Limpa o formulário
    restauranteForm.reset();
    // Remove o ID do formulário (caso esteja em modo de edição)
    restauranteForm.removeAttribute('data-id');
    // Mostra o formulário
    restauranteFormSection.classList.remove('hidden');
    // Foca no primeiro campo
    document.getElementById('nome').focus();
}

/**
 * Esconde o formulário de cadastro de restaurante
 */
function hideRestauranteForm() {
    restauranteFormSection.classList.add('hidden');
}

/**
 * Salva os dados do restaurante (novo cadastro ou edição)
 */
async function saveRestaurante(event) {
    event.preventDefault();
    
    // Obtém os dados do formulário
    const formData = new FormData(restauranteForm);
    
    // Verifica se é uma edição ou novo cadastro
    const restauranteId = restauranteForm.getAttribute('data-id');
    
    // Prepara os dados do restaurante
    const restauranteData = {
        nome: formData.get('nome'),
        cnpj: formData.get('cnpj'),
        descricao: formData.get('descricao'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        telefone: formData.get('telefone'),
        celular: formData.get('celular'),
        cel_whatsapp: formData.get('cel_whatsapp'),
        cep: formData.get('cep'),
        logradouro: formData.get('logradouro'),
        numero: formData.get('numero'),
        complemento: formData.get('complemento'),
        bairro: formData.get('bairro'),
        cidade: formData.get('cidade'),
        estado: formData.get('estado'),
        id_tipo_cozinha: formData.get('id_tipo_cozinha'),
        tem_delivery: formData.get('tem_delivery'),
        horario_abertura: formData.get('horario_abertura'),
        horario_fechamento: formData.get('horario_fechamento'),
        banco: formData.get('banco'),
        agencia: formData.get('agencia'),
        conta: formData.get('conta'),
        tipo_conta: formData.get('tipo_conta'),
        nome_titular: formData.get('nome_titular'),
        cpf_cnpj: formData.get('cpf_cnpj'),
        data_inclusao: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
        ativo: 1 // Por padrão, o restaurante é ativo
    };
    
    // Verifica campos obrigatórios
    if (!restauranteData.cnpj || !restauranteData.nome || !restauranteData.email || !restauranteData.senha) {
        alert('Por favor, preencha todos os campos obrigatórios: Nome, CNPJ, Email e Senha');
        return;
    }
    
    // Processa a imagem se foi selecionada
    const fileInput = document.getElementById('imagem_estabelecimento');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        // Converte a imagem para base64
        reader.onload = async function(e) {
            const base64Image = e.target.result.split(',')[1]; // Remove o prefixo data:image/...
            restauranteData.imagem_estabelecimento = base64Image;
            
            // Continua o processo de salvamento
            await processarSalvamento(restauranteId, restauranteData);
        };
        
        reader.readAsDataURL(file);
    } else {
        // Continua sem imagem
        await processarSalvamento(restauranteId, restauranteData);
    }
}

/**
 * Processa o salvamento do restaurante (novo ou edição)
 */
async function processarSalvamento(restauranteId, restauranteData) {
    try {
        if (restauranteId) {
            // Edição de restaurante existente
            // Por enquanto, mantém a lógica de edição usando localStorage
            const index = restaurantes.findIndex(r => r.id == restauranteId);
            if (index !== -1) {
                restauranteData.id = restauranteId;
                restaurantes[index] = restauranteData;
                
                // Salva no localStorage
                localStorage.setItem('alipass_restaurantes', JSON.stringify(restaurantes));
                
                // Atualiza a tabela
                renderRestaurantesTable();
                
                // Esconde o formulário
                hideRestauranteForm();
                
                // Exibe mensagem de sucesso
                alert('Restaurante atualizado com sucesso!');
            }
        } else {
            // Novo restaurante - Envia para a API
            const response = await fetch('https://api.alipass.com.br/novo/restaurante', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(restauranteData),
                mode: 'cors' // Importante para lidar com problemas de CORS
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Adiciona o novo restaurante ao array local com o ID retornado pela API
                restauranteData.id = data.restauranteId;
                restaurantes.push(restauranteData);
                
                // Salva no localStorage para manter a consistência
                localStorage.setItem('alipass_restaurantes', JSON.stringify(restaurantes));
                
                // Atualiza a tabela
                renderRestaurantesTable();
                
                // Esconde o formulário
                hideRestauranteForm();
                
                // Exibe mensagem de sucesso
                alert('Restaurante cadastrado com sucesso!');
            } else {
                // Exibe mensagem de erro
                alert(`Erro ao cadastrar restaurante: ${data.error || 'Erro desconhecido'}`);
            }
        }
    } catch (error) {
        console.error('Erro ao salvar restaurante:', error);
        alert(`Erro ao salvar restaurante: ${error.message || 'Erro desconhecido'}`);
    }
}

/**
 * Carrega os dados de um restaurante para edição
 */
function editRestaurante(id) {

    const restaurante = restaurantes.find(r => r.id == id);
    if (!restaurante) return;

    
    
    // Preenche o formulário com os dados do restaurante
    document.getElementById('nome').value = restaurante.nome;
    document.getElementById('cnpj').value = restaurante.cnpj;
    document.getElementById('descricao').value = restaurante.descricao || '';
    document.getElementById('email').value = restaurante.email;
    document.getElementById('senha').value = restaurante.senha || '';
    document.getElementById('telefone').value = restaurante.telefone;
    document.getElementById('celular').value = restaurante.celular || '';
    
    // Seleciona os valores dos selects
    if (restaurante.cel_whatsapp) {
        document.getElementById('cel_whatsapp').value = restaurante.cel_whatsapp;
    }
    
    if (restaurante.id_tipo_cozinha) {
        document.getElementById('id_tipo_cozinha').value = restaurante.id_tipo_cozinha;
    }
    
    if (restaurante.tem_delivery) {
        document.getElementById('tem_delivery').value = restaurante.tem_delivery;
    }
    
    // Horários
    document.getElementById('horario_abertura').value = restaurante.horario_abertura || '';
    document.getElementById('horario_fechamento').value = restaurante.horario_fechamento || '';
    
    // Endereço
    document.getElementById('cep').value = restaurante.cep;
    document.getElementById('logradouro').value = restaurante.logradouro;
    document.getElementById('numero').value = restaurante.numero;
    document.getElementById('complemento').value = restaurante.complemento || '';
    document.getElementById('bairro').value = restaurante.bairro;
    document.getElementById('cidade').value = restaurante.cidade;
    document.getElementById('estado').value = restaurante.estado;
    
    // Dados bancários
    document.getElementById('banco').value = restaurante.banco || '';
    document.getElementById('agencia').value = restaurante.agencia || '';
    document.getElementById('conta').value = restaurante.conta || '';
    
    if (restaurante.tipo_conta) {
        document.getElementById('tipo_conta').value = restaurante.tipo_conta;
    }
    
    document.getElementById('nome_titular').value = restaurante.nome_titular || '';
    document.getElementById('cpf_cnpj').value = restaurante.cpf_cnpj || '';
    
    // Define o ID no formulário para identificar que é uma edição
    restauranteForm.setAttribute('data-id', id);
    
    // Mostra o formulário
    restauranteFormSection.classList.remove('hidden');
    
    // Foca no primeiro campo
    document.getElementById('nome').focus();
}

/**
 * Mostra o modal de confirmação de exclusão
 */
function showDeleteModal(id) {
    restauranteIdToDelete = id;
    deleteModal.classList.remove('hidden');
}

/**
 * Esconde o modal de confirmação de exclusão
 */
function hideDeleteModal() {
    deleteModal.classList.add('hidden');
    restauranteIdToDelete = null;
}

/**
 * Confirma a exclusão do restaurante
 */
function confirmDeleteRestaurante() {
    if (!restauranteIdToDelete) return;
    
    // Remove o restaurante do array
    restaurantes = restaurantes.filter(r => r.id != restauranteIdToDelete);
    
    // Salva no localStorage
    localStorage.setItem('alipass_restaurantes', JSON.stringify(restaurantes));
    
    // Atualiza a tabela
    renderRestaurantesTable();
    
    // Esconde o modal
    hideDeleteModal();
    
    // Exibe mensagem de sucesso
    alert('Restaurante excluído com sucesso!');
}

/**
 * Desativa ou ativa um restaurante
 */
function toggleRestauranteStatus(id, currentStatus) {
    const restaurante = restaurantes.find(r => r.id == id);
    if (!restaurante) return;
    
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 0 ? 'desativar' : 'ativar';
    
    if (!confirm(`Tem certeza que deseja ${action} este restaurante?`)) {
        return;
    }
    
    // Mostra loading
    showLoading();
    
    // Faz requisição para a API de desativação
    fetch(`http://localhost:3002/admin/restaurante/desativar/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao ${action} restaurante: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Atualiza o status do restaurante no array local
        restaurante.ativo = newStatus;
        
        // Salva no localStorage
        localStorage.setItem('alipass_restaurantes', JSON.stringify(restaurantes));
        
        // Atualiza a tabela
        renderRestaurantesTable();
        
        // Esconde loading
        hideLoading();
        
        // Exibe mensagem de sucesso
        alert(`Restaurante ${action}do com sucesso!`);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert(`Erro ao ${action} restaurante: ${error.message}`);
        hideLoading();
    });
}