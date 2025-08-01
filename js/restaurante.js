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
 * Carrega os dados dos restaurantes
 * Em um ambiente real, isso seria uma chamada para uma API
 */
function loadRestaurantes() {
    // Verifica se há dados salvos no localStorage
    const savedRestaurantes = localStorage.getItem('alipass_restaurantes');
    if (savedRestaurantes) {
        restaurantes = JSON.parse(savedRestaurantes);
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
        tr.innerHTML = `
            <td>${restaurante.nome}</td>
            <td>${restaurante.cnpj}</td>
            <td>${restaurante.email}</td>
            <td>${restaurante.telefone}</td>
            <td>${restaurante.cidade}/${restaurante.estado}</td>
            <td class="actions">
                <button class="action-btn edit-btn" data-id="${restaurante.id}" title="Editar">
                    ✏️
                </button>
                <button class="action-btn delete-btn" data-id="${restaurante.id}" title="Excluir">
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
function saveRestaurante(event) {
    event.preventDefault();
    
    // Obtém os dados do formulário
    const formData = new FormData(restauranteForm);
    const restauranteData = {
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
    const restauranteId = restauranteForm.getAttribute('data-id');
    
    if (restauranteId) {
        // Edição de restaurante existente
        const index = restaurantes.findIndex(r => r.id == restauranteId);
        if (index !== -1) {
            restauranteData.id = restauranteId;
            restaurantes[index] = restauranteData;
        }
    } else {
        // Novo restaurante
        restauranteData.id = Date.now().toString(); // ID único baseado no timestamp
        restaurantes.push(restauranteData);
    }
    
    // Salva no localStorage
    localStorage.setItem('alipass_restaurantes', JSON.stringify(restaurantes));
    
    // Atualiza a tabela
    renderRestaurantesTable();
    
    // Esconde o formulário
    hideRestauranteForm();
    
    // Exibe mensagem de sucesso
    alert(restauranteId ? 'Restaurante atualizado com sucesso!' : 'Restaurante cadastrado com sucesso!');
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
    document.getElementById('email').value = restaurante.email;
    document.getElementById('telefone').value = restaurante.telefone;
    document.getElementById('cep').value = restaurante.cep;
    document.getElementById('logradouro').value = restaurante.logradouro;
    document.getElementById('numero').value = restaurante.numero;
    document.getElementById('complemento').value = restaurante.complemento || '';
    document.getElementById('bairro').value = restaurante.bairro;
    document.getElementById('cidade').value = restaurante.cidade;
    document.getElementById('estado').value = restaurante.estado;
    
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