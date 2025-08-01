/**
 * Script para a página principal (home) do sistema AliPass Admin
 */

document.addEventListener('DOMContentLoaded', function() {
    // Atualiza informações do usuário no cabeçalho
    updateUserInfo();
    
    // Adiciona animação aos cards do dashboard
    animateDashboardCards();
});

/**
 * Função para animar os cards do dashboard
 */
function animateDashboardCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Adiciona um pequeno atraso para cada card
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
        
        // Adiciona efeito de hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}

/**
 * Função para obter estatísticas do sistema
 * Em um ambiente real, isso seria uma chamada para uma API
 */
function getSystemStats() {
    // Simulação de dados de estatísticas
    const stats = {
        empresas: 12,
        restaurantes: 45,
        funcionarios: 320
    };
    
    // Atualiza os contadores nos cards
    updateStatsCounters(stats);
}

/**
 * Função para atualizar os contadores de estatísticas
 */
function updateStatsCounters(stats) {
    // Esta função seria implementada para atualizar contadores visuais
    // nos cards do dashboard, caso sejam adicionados no futuro
}