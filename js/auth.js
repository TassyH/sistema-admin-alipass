/**
 * Arquivo de autenticação para o sistema AliPass Admin
 * Versão simplificada sem verificação de autenticação
 */

// Função vazia para compatibilidade
function checkAuth() {
    // Não faz nada - autenticação removida
}

// Função para realizar logout (redirecionamento direto para home)
function logout() {
    window.location.href = 'home.html';
}

// Atualiza o nome do usuário no cabeçalho
function updateUserInfo() {
    const userElement = document.getElementById('user-name');
    if (userElement) {
        userElement.textContent = 'Administrador';
    }
}

// Executa a verificação de autenticação quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    updateUserInfo();
});