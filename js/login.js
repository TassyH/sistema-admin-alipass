/**
 * Script para a página de login do sistema AliPass Admin
 */

// Função para validar o login
function validateLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Limpa mensagens de erro anteriores
    errorElement.textContent = '';
    
    // Validação simples dos campos
    if (!username || !password) {
        errorElement.textContent = 'Por favor, preencha todos os campos.';
        return false;
    }
    
    // Simulação de autenticação
    // Em um ambiente real, isso seria uma chamada para uma API de autenticação
    if (username === 'admin' && password === 'admin123') {
        // Armazena informações de autenticação
        const userData = {
            id: 1,
            name: 'Administrador',
            username: username,
            role: 'admin'
        };
        
        localStorage.setItem('alipass_auth', 'true');
        localStorage.setItem('alipass_user', JSON.stringify(userData));
        
        // Redireciona para a página principal
        window.location.href = 'home.html';
    } else {
        // Exibe mensagem de erro
        errorElement.textContent = 'Usuário ou senha inválidos.';
        // Limpa o campo de senha
        document.getElementById('password').value = '';
    }
    
    return false;
}

// Adiciona animação aos campos do formulário
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});