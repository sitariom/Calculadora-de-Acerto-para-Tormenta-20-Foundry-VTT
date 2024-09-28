# Calculadora de Acerto para Tormenta 20 no Foundry VTT

## Descrição

Este projeto consiste em três macros desenvolvidas para o sistema Tormenta 20 no Foundry VTT, automatizando o cálculo de acertos e a aplicação de danos durante o jogo. Estas macros são projetadas para facilitar o trabalho de mestres (GMs) e jogadores, fornecendo feedback visual e mensagens detalhadas no chat para uma gestão eficiente de combates.

## Componentes

- `Calculadoradeacerto.js`: Macro principal que implementa a lógica da calculadora.
- `Controlecalculadoradeacertoativar.js`: Macro para ativar a calculadora.
- `Controlecalculadoradeacertodesativar.js`: Macro para desativar a calculadora.

## Funcionalidades

### Calculadora de Acerto (Macro Principal)

- **Processamento Automático**: Analisa mensagens de ataque no chat.
- **Indicador Visual**: Mostra o estado atual da calculadora na tela do GM.
- **Análise Detalhada**: Gera uma tabela no chat com informações sobre cada ataque:
  - Alvo(s)
  - Valores de ataque e defesa
  - Resistências, vulnerabilidades e imunidades
  - Dano original e ajustado
  - Opções para aplicação manual de dano
- **Aplicação Automática de Dano**: Calcula e aplica dano considerando variáveis relevantes.
- **Notificações**: Informa resultados de ataques via chat.

### Macros de Controle

- **Ativar**: Inicia o processamento automático de ataques.
- **Desativar**: Interrompe o processamento automático.

## Instalação

1. Copie o código das três macros.
2. No Foundry VTT, crie três novas macros e cole o código correspondente em cada uma.

## Como Usar

### Inicialização (Importante)

1. Execute a macro "Calculadoradeacerto.js" uma vez por sessão ou após recarregar a página.
2. Esta etapa é crucial para inicializar todas as funções necessárias.

### Ativação

1. Após a inicialização, execute "Controlecalculadoradeacertoativar.js".
2. Um indicador visual confirmará que a calculadora está ativa.

### Utilização Durante o Jogo

1. Selecione o token do atacante.
2. Marque o(s) alvo(s) do ataque.
3. Faça a rolagem de ataque normalmente.
4. A calculadora processará automaticamente e exibirá os resultados no chat.

### Interpretação dos Resultados

- Uma tabela detalhada será exibida no chat para cada ataque.
- Mostrará o resultado (acerto/erro) e o dano calculado para cada alvo.
- O dano será aplicado automaticamente, considerando resistências e vulnerabilidades.

### Ajustes Manuais

- Use os botões na tabela do chat para aplicar ou remover dano manualmente, se necessário.

### Desativação

1. Execute "Controlecalculadoradeacertodesativar.js" para desativar a calculadora.
2. O indicador visual mostrará que a calculadora está desativada.

## Notas Importantes

- Mantenha as fichas de personagem e ameaças atualizadas com informações corretas.
- A macro funciona melhor com as rolagens padrão do sistema Tormenta 20 no Foundry VTT.
- O GM pode fazer ajustes manuais para situações especiais não previstas pela macro.
- Teste as macros em um ambiente controlado antes de usá-las em uma sessão real.
- Sempre execute a macro principal antes de usar as macros de ativação/desativação pela primeira vez em uma sessão ou após recarregar a página.

## Dicas Adicionais

- A calculadora funciona melhor quando todas as informações de resistência e vulnerabilidade dos personagens estão corretamente preenchidas nas fichas.
- Para ataques que requerem testes de resistência, a macro identificará isso e informará no chat, mas o GM precisará gerenciar esses testes manualmente.
- O indicador visual da calculadora pode ser movido para qualquer posição na tela do GM para melhor conveniência.

## Suporte e Contribuições

Fique a vontade para contribuir com melhorias.


# Hit Calculator for Tormenta 20 on Foundry VTT

## Description

This project consists of three macros developed for the Tormenta 20 system on Foundry VTT, automating hit calculations and damage application during gameplay. These macros are designed to facilitate the work of Game Masters (GMs) and players, providing visual feedback and detailed chat messages for efficient combat management.

## Components

- `Hitcalculator.js`: Main macro that implements the calculator logic.
- `Hitcalculatoractivate.js`: Macro to activate the calculator.
- `Hitcalculatordeactivate.js`: Macro to deactivate the calculator.

## Features

### Hit Calculator (Main Macro)

- **Automatic Processing**: Analyzes attack messages in the chat.
- **Visual Indicator**: Shows the current state of the calculator on the GM's screen.
- **Detailed Analysis**: Generates a table in the chat with information about each attack:
  - Target(s)
  - Attack and defense values
  - Resistances, vulnerabilities, and immunities
  - Original and adjusted damage
  - Options for manual damage application
- **Automatic Damage Application**: Calculates and applies damage considering relevant variables.
- **Notifications**: Reports attack results via chat.

### Control Macros

- **Activate**: Initiates automatic attack processing.
- **Deactivate**: Stops automatic processing.

## Installation

1. Copy the code of the three macros.
2. In Foundry VTT, create three new macros and paste the corresponding code into each one.

## How to Use

### Initialization (Important)

1. Run the "Hitcalculator.js" macro once per session or after reloading the page.
2. This step is crucial to initialize all necessary functions.

### Activation

1. After initialization, run "Hitcalculatoractivate.js".
2. A visual indicator will confirm that the calculator is active.

### In-Game Usage

1. Select the attacker's token.
2. Mark the target(s) of the attack.
3. Make the attack roll normally.
4. The calculator will automatically process and display the results in the chat.

### Interpreting Results

- A detailed table will be displayed in the chat for each attack.
- It will show the result (hit/miss) and the calculated damage for each target.
- Damage will be applied automatically, considering resistances and vulnerabilities.

### Manual Adjustments

- Use the buttons in the chat table to manually apply or remove damage if necessary.

### Deactivation

1. Run "Hitcalculatordeactivate.js" to deactivate the calculator.
2. The visual indicator will show that the calculator is deactivated.

## Important Notes

- Keep character and threat sheets updated with correct information.
- The macro works best with the standard rolls of the Tormenta 20 system on Foundry VTT.
- The GM can make manual adjustments for special situations not covered by the macro.
- Test the macros in a controlled environment before using them in a real session.
- Always run the main macro before using the activation/deactivation macros for the first time in a session or after reloading the page.

## Additional Tips

- The calculator works best when all resistance and vulnerability information for characters is correctly filled in the sheets.
- For attacks that require saving throws, the macro will identify this and inform in the chat, but the GM will need to manage these tests manually.
- The calculator's visual indicator can be moved to any position on the GM's screen for better convenience.

## Support and Contributions

Feel free to contribute with improvements.
