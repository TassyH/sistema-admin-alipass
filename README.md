# AliPass Admin - Sistema de Administração

## Descrição

O AliPass Admin é um sistema de administração web desenvolvido com HTML, CSS e JavaScript puro para gerenciar empresas, restaurantes e funcionários. O sistema possui um design moderno com degradê laranja-dourado e uma interface intuitiva.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
├── index.html           # Página de login
├── home.html            # Painel principal
├── empresa.html         # Gerenciamento de empresas
├── restaurante.html     # Gerenciamento de restaurantes
├── funcionarios.html    # Gerenciamento de funcionários
├── css/
│   ├── style.css        # Estilos globais
│   ├── login.css        # Estilos da página de login
│   ├── home.css         # Estilos da página principal
│   ├── empresa.css      # Estilos da página de empresas
│   ├── restaurante.css  # Estilos da página de restaurantes
│   └── funcionarios.css # Estilos da página de funcionários
├── js/
│   ├── auth.js          # Lógica de autenticação
│   ├── login.js         # Lógica da página de login
│   ├── home.js          # Lógica da página principal
│   ├── empresa.js       # Lógica da página de empresas
│   ├── restaurante.js   # Lógica da página de restaurantes
│   ├── funcionarios.js  # Lógica da página de funcionários
│   └── xlsx.full.min.js # Biblioteca para processamento de planilhas (necessário adicionar)
└── README.md            # Documentação do projeto
```

## Funcionalidades

### Autenticação
- Tela de login com validação de usuário e senha
- Controle de sessão usando localStorage

### Painel Principal
- Navegação para as diferentes seções do sistema
- Cards interativos para acesso rápido às funcionalidades

### Gerenciamento de Empresas
- Formulário para cadastro de empresas com os campos:
  - Nome, CNPJ, Email, Telefone
  - Endereço completo (CEP, Logradouro, Número, Complemento, Bairro, Cidade, Estado)
- Tabela para listar todas as empresas cadastradas
- Funcionalidades para editar e excluir empresas
- Busca automática de endereço pelo CEP usando a API ViaCEP

### Gerenciamento de Restaurantes
- Formulário para cadastro de restaurantes com os campos:
  - Nome, CNPJ, Email, Telefone
  - Endereço completo (CEP, Logradouro, Número, Complemento, Bairro, Cidade, Estado)
- Tabela para listar todos os restaurantes cadastrados
- Funcionalidades para editar e excluir restaurantes
- Busca automática de endereço pelo CEP usando a API ViaCEP

### Gerenciamento de Funcionários
- Upload de planilha (.csv, .xlsx ou .xls) com dados de funcionários
- Seleção de empresa para associar aos funcionários importados
- Pré-visualização dos dados da planilha antes da importação
- Importação dos dados para o sistema
- Tabela para listar todos os funcionários cadastrados

## Requisitos

### Bibliotecas Externas
- SheetJS (xlsx.full.min.js) para processamento de planilhas Excel

### Navegadores Suportados
- Google Chrome (recomendado)
- Mozilla Firefox
- Microsoft Edge
- Safari

## Instruções de Uso

### Instalação
1. Baixe todos os arquivos do projeto
2. Adicione a biblioteca SheetJS (xlsx.full.min.js) na pasta js/
3. Abra o arquivo index.html em um navegador web

### Credenciais de Acesso (Demonstração)
- Usuário: admin
- Senha: admin123

### Fluxo de Uso
1. Faça login no sistema
2. No painel principal, navegue para a seção desejada
3. Para importar funcionários, primeiro cadastre pelo menos uma empresa
4. Ao importar funcionários, certifique-se de que a planilha contém as colunas necessárias

## Armazenamento de Dados

Este sistema de demonstração utiliza o localStorage do navegador para armazenar os dados. Em um ambiente de produção, seria necessário implementar um backend com banco de dados para persistência adequada dos dados.

## Personalização

O sistema pode ser personalizado alterando as variáveis CSS no arquivo style.css, especialmente as cores definidas nas variáveis --primary-color e --secondary-color para modificar o degradê laranja-dourado.

## Observações

- Este é um sistema de demonstração e não deve ser usado em produção sem as devidas adaptações de segurança e backend
- A funcionalidade de importação de funcionários simula o envio para uma API externa
- Para um ambiente real, seria necessário implementar um backend para processar e armazenar os dados