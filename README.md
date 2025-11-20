# Sabor & Arte - Gastronomia Contemporânea 🍽️
Este projeto é uma Landing Page completa e responsiva para um restaurante sofisticado, desenvolvida como parte do meu portfólio de desenvolvedor Front-end. O sistema simula uma experiência real de pedido online e gestão administrativa.

## 📱 Funcionalidades
Para o Cliente:
- **Cardápio Interativo:** Visualização de pratos por categorias (Entradas, Principais, Sobremesas, Bebidas).
- **Carrinho de Compras:** Adicionar/remover itens e controle de quantidade.
- **Checkout: Formulário** de finalização de pedido integrado ao banco de dados.
- **Design Responsivo:** Layout adaptável para Celulares, Tablets e Desktops.

Para o Administrador (Dashboard):
- **Gestão de Pratos:** Criar, editar e excluir itens do cardápio em tempo real.
- **Gestão de Pedidos:** Visualizar pedidos recebidos e alterar status (Pendente, Pronto, Entregue).
- **Login Seguro:** Autenticação via Firebase Auth.
- **Botão de Pânico:** Funcionalidade para restaurar o cardápio padrão caso necessário.

## 🛠️ Tecnologias Utilizadas
- **React.js (Vite):** Estrutura do componente e reatividade.
- **Tailwind CSS (v4):** Estilização moderna e responsiva.
- **Firebase Firestore:** Banco de dados NoSQL para persistência de pedidos e cardápio.
- **Firebase Authentication:** Sistema de login para área administrativa.
- **Lucide React:** Ícones vetoriais leves e elegantes.

## 🚀 Como rodar localmente

1. Clone o projeto:
```
git clone [https://github.com/SEU-USUARIO/sabor-arte.git](https://github.com/SEU-USUARIO/sabor-arte.git)
```
2. Instale as dependências:
```
npm install
```
3. Inicie o servidor de desenvolvimento:
```
npm run dev
```
4. Acesse http://localhost:5173 no seu navegador.

## 🔐 Acesso Administrativo (Demo)
Para testar o painel administrativo:
- **Rota:** Clicar em "Admin" no menu ou ir para /admin-login
- **Email:** `admin@sabor.com`
- **Senha:** `123456`
Desenvolvido com ❤️ por fc4code.