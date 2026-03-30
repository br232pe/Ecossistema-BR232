
# 🗺️ Ecossistema BR-232 (Beta 1.0)

Plataforma colaborativa para moradores, motoristas e empresários do eixo Luiz Gonzaga em Pernambuco. Este projeto utiliza Inteligência Artificial (Gemini API) para monitoramento e screening regional.

## 🚦 Status do Projeto
> **Versão Atual:** Foundation (Beta 1.1)
> **Status:** Estabilidade de Produção (Fix HashRouter), UI Completa, Persistência Local.
> **Último Relatório de Desenvolvimento:** 30/03/2026 às 18:09:45 (Local) / 21:09:45 (UTC)

## 📊 Relatório de Engenharia Modal (1)
| Módulo | Status | Progresso | Observações |
| :--- | :--- | :--- | :--- |
| **Núcleo Estável (Elemento X)** | Concluído | 100% | Modelagem de dados, Taxonomia BR-232 e Patronos consolidada. |
| **Autenticação e Contexto** | Finalizado | 98% | Firebase Auth integrado, proteções de carregamento em produção aplicadas. |
| **Dashboard e Malha Visual** | Finalizado | 95% | Navegação corrigida para HashRouter (ecobr232.com/#/dashboard). |
| **Porta-Luvas (Fidelidade)** | Em Desenvolvimento | 65% | Lógica de selos e QR Code implementada, ajustes de geofencing em teste. |
| **Mnēmē (Gestão)** | Inicial | 45% | Estrutura de listas iniciada, integração com Gemini em modo Mock/Real. |
| **Marketplace (A Feira)** | Inicial | 25% | Listagem básica, falta fluxo de checkout e integração de pagamentos. |

## 🚀 Como Sair do Modo Mock (Ativar Multiplayer)
O aplicativo roda por padrão em modo "Mock" (Simulação) se não encontrar as chaves de API. Para ativar o banco de dados real:

1. Renomeie o arquivo `.env.example` para `.env` na raiz do projeto.
2. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
3. Ative o **Authentication** (Google Provider) e o **Firestore Database**.
4. Copie as credenciais do Firebase para o seu arquivo `.env`.
5. Reinicie o servidor: `npm run dev`.

## 🛠️ Tecnologias (Google Stack)
- **Frontend**: React 18, TypeScript.
- **Backend & Auth**: Firebase (Google).
- **Hosting**: Firebase Hosting (Google).
- **IA**: Google Gemini API (Modelos Flash & Pro).
- **Estilo**: Tailwind CSS.

## 📦 Comandos
| Comando | Ação |
|---------|------|
| `npm install` | Instala dependências |
| `npm run dev` | Roda servidor local (Porta 5173) |
| `npm run build` | Gera versão de produção na pasta `/dist` |

## ☁️ Deploy Oficial (Firebase Hosting)
Este projeto segue o padrão 100% Google. Para colocar no ar:

1. Instale a CLI do Firebase:
   `npm install -g firebase-tools`
2. Faça login na sua conta Google:
   `firebase login`
3. Inicialize o projeto (selecione Hosting):
   `firebase init`
4. Gere o build e faça o deploy:
   `npm run build && firebase deploy`

## 🔑 Variáveis de Ambiente
Verifique o arquivo `.env.example` para a lista completa de chaves necessárias.

---
Desenvolvido para o corredor socioeconômico de Pernambuco.
