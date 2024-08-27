# Calculadora de Acerto para Tormenta 20 no Foundry VTT

Este projeto consiste em duas macros projetadas para o sistema Tormenta 20 no Foundry VTT, que automatizam o cálculo de acertos e a aplicação de danos durante o jogo. As macros são criadas para facilitar o trabalho tanto dos mestres (GMs) quanto dos jogadores, fornecendo feedback visual e mensagens no chat para gerenciar combates de maneira eficiente.

## Funcionalidades

### Macro 1: Calculadora de Acerto

#### Para o Mestre (GM)

- **Ativação e Desativação**: O mestre pode ativar a Calculadora de Acerto para processar automaticamente as mensagens de ataque no chat.

  ![Imagem de Ativação](/imgs/image-1.png)

- **Indicador Visual**: Um indicador visual é exibido na tela do GM para mostrar se a calculadora está ativada ou desativada.

  ![Indicador Visual](/imgs/image-2.png)

- **Processamento de Mensagens**: A macro intercepta mensagens de ataque no chat, exibindo informações detalhadas sobre o ataque.

- **Tabela de Análise de Ataque**: Exibe uma tabela no chat para conferir os resultados da aplicação automática de dano.

  ![Tabela de Análise](/imgs/image-5.png)

- **Distribuição de Dano**: Calcula e aplica automaticamente o dano aos alvos.
- **Notificação de Acerto ou Erro**: Informa via chat a todos se um ataque acertou ou errou.

  ![Notificação de Acerto](/imgs/image-3.png)
  ![Notificação de Erro](/imgs/image-4.png)

#### Para os Jogadores

- **Retorno no Chat**: Os jogadores recebem notificações via chat sobre o resultado dos ataques.

  ![Notificação de Acerto](/imgs/image-3.png)
  ![Notificação de Erro](/imgs/image-4.png)

### Macro 2: Controle da Calculadora de Acerto

#### Para o Mestre (GM)

- **Desativação**: O mestre pode usar esta macro para desativar a Calculadora de Acerto.

  ![Desativação](/imgs/image-6.png)
  ![Indicador Visual](/imgs/image-7.png)

## Como Usar

1. **Ativação**: Execute a Macro 1 para ativar a Calculadora de Acerto.
2. **Utilização**: Durante o jogo, antes de realizar um ataque, marque como alvo um ou mais tokens e acompanhe as mensagens no chat.
3. **Interação**: Durante o jogo, a Calculadora processará automaticamente as rolagens de ataque.
4. **Desativação**: Execute a Macro 2 para desativar quando não for mais necessária.

  ![Exemplo de Uso - 1](/imgs/image-8.png)
  ![Exemplo de Uso - 2](/imgs/image-9.png)

## Melhorias Futuras

1. **Consideração Automática de Resistências e Vulnerabilidades**: 
   - Implementar funcionalidade para considerar automaticamente RD (Resistência a Dano), resistências, vulnerabilidades e invulnerabilidades nas aplicações automáticas de dano.
   - Tornar o cálculo de dano mais preciso e reduzir a necessidade de ajustes manuais.

2. **Customização de Regras**:
   - Permitir a definição de modificadores situacionais que podem ser ativados rapidamente durante o jogo.
   - Implementar uma interface para analisar e configurar variáveis personalizáveis.

3. **Suporte a Magias e Habilidades Especiais**:
   - Expandir a funcionalidade para incluir cálculos automáticos para magias e habilidades especiais, não apenas ataques físicos.
   - Implementar um sistema para lidar com diferentes tipos de testes de resistência e seus efeitos.
   - Considerar a aplicação de templates de área para marcação dos alvos.


---

# Accuracy Calculator for Tormenta 20 on Foundry VTT

This project consists of two macros designed for the Tormenta 20 system on Foundry VTT, which automate hit calculations and damage application during gameplay. The macros are created to facilitate the work of both Game Masters (GMs) and players, providing visual feedback and chat messages to efficiently manage combats.

## Features

### Macro 1: Accuracy Calculator

#### For the Game Master (GM)

- **Activation and Deactivation**: The GM can activate the Accuracy Calculator to automatically process attack messages in the chat.

  ![Activation Image](/imgs/image-1.png)

- **Visual Indicator**: A visual indicator is displayed on the GM's screen to show whether the calculator is active or inactive.

  ![Visual Indicator](/imgs/image-2.png)

- **Message Processing**: The macro intercepts attack messages in the chat, displaying detailed information about the attack.

- **Attack Analysis Table**: Displays a table in the chat to review the results of automatic damage application.

  ![Analysis Table](/imgs/image-5.png)

- **Damage Distribution**: Automatically calculates and applies damage to targets.
- **Hit or Miss Notification**: Informs everyone via chat whether an attack hit or missed.

  ![Hit Notification](/imgs/image-3.png)
  ![Miss Notification](/imgs/image-4.png)

#### For Players

- **Chat Feedback**: Players receive notifications via chat about attack results.

  ![Hit Notification](/imgs/image-3.png)
  ![Miss Notification](/imgs/image-4.png)

### Macro 2: Accuracy Calculator Control

#### For the Game Master (GM)

- **Deactivation**: The GM can use this macro to deactivate the Accuracy Calculator.

  ![Deactivation](/imgs/image-6.png)
  ![Visual Indicator Off](/imgs/image-7.png)

## How to Use

1. **Activation**: Execute Macro 1 to activate the Accuracy Calculator.
2. **Usage**: During the game, before making an attack, target one or more tokens and follow the messages in the chat.
3. **Interaction**: During the game, the Calculator will automatically process attack rolls.
4. **Deactivation**: Execute Macro 2 to deactivate when no longer needed.

  ![Usage Example - 1](/imgs/image-8.png)
  ![Usage Example - 2](/imgs/image-9.png)

## Future Improvements

1. **Automatic Consideration of Resistances and Vulnerabilities**: 
   - Implement functionality to automatically consider DR (Damage Resistance), resistances, vulnerabilities, and invulnerabilities in automatic damage applications.
   - Make damage calculation more accurate and reduce the need for manual adjustments.

2. **Rule Customization**:
   - Allow the definition of situational modifiers that can be quickly activated during the game.
   - Implement an interface to analyze and configure customizable variables.

3. **Support for Spells and Special Abilities**:
   - Expand functionality to include automatic calculations for spells and special abilities, not just physical attacks.
   - Implement a system to handle different types of saving throws and their effects.
   - Consider the application of area templates for target marking.
