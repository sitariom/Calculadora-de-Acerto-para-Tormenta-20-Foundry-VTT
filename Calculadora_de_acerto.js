//🤖 Calculadora de acerto

// Variável para controlar o estado da calculadora
window.calculadoraAcertoAtiva = false;

// Função para criar e atualizar o indicador visual
function atualizarIndicadorVisual() {
  let indicador = document.getElementById('calculadoraAcertoIndicador');
  if (!indicador) {
    indicador = document.createElement('div');
    indicador.id = 'calculadoraAcertoIndicador';
    indicador.style.position = 'fixed';
    indicador.style.top = localStorage.getItem('indicadorTop') || '10px';
    indicador.style.left = localStorage.getItem('indicadorLeft') || '10px';
    indicador.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    indicador.style.color = 'white';
    indicador.style.padding = '5px';
    indicador.style.borderRadius = '5px';
    indicador.style.zIndex = 1000;
    indicador.style.cursor = 'move';
    document.body.appendChild(indicador);

    indicador.onmousedown = function(event) {
      let shiftX = event.clientX - indicador.getBoundingClientRect().left;
      let shiftY = event.clientY - indicador.getBoundingClientRect().top;

      function moverPara(pageX, pageY) {
        indicador.style.left = pageX - shiftX + 'px';
        indicador.style.top = pageY - shiftY + 'px';
      }

      function aoMoverMouse(event) {
        moverPara(event.pageX, event.pageY);
      }

      document.addEventListener('mousemove', aoMoverMouse);

      indicador.onmouseup = function() {
        document.removeEventListener('mousemove', aoMoverMouse);
        indicador.onmouseup = null;
        localStorage.setItem('indicadorTop', indicador.style.top);
        localStorage.setItem('indicadorLeft', indicador.style.left);
      };
    };

    indicador.ondragstart = function() {
      return false;
    };
  }
  
  indicador.innerHTML = window.calculadoraAcertoAtiva ? 
    '🤖 Calculadora de acerto ativada' : 
    '🤖 Calculadora de acerto desativada';
}

// Função para processar mensagens do chat
function processarMensagemChat(message) {
  if (!window.calculadoraAcertoAtiva) return;

  const actor = game.actors.get(message.speaker.actor);
  if (!actor) return;

  const isAttackRoll = (message.content.includes("Ataque") || message.content.includes("Attack")) &&
                       (message.content.includes("Dano") || message.content.includes("Damage"));
  if (!isAttackRoll) return;

  const token = actor.getActiveTokens()[0];
  if (!token) return;

  const targets = Array.from(game.users.find(u => u.id === message.user.id).targets);
  if (targets.length === 0) return;

  const attackName = actor.items.find(item => item.type === "arma" && message.content.includes(item.name))?.name || "Ataque Desconhecido";
  if (attackName === "Ataque Desconhecido") return;

  setTimeout(() => {
    let content = `
		<h3 style="color: #4B0082;">🧙‍♂️ <span style="font-size: 1.2em;"><strong>Análise do ataque:</strong></span></h3>
      <p><strong>Atacante:</strong> ${token.name}</p>
      <p><strong>Ataque/Item Usado:</strong> ${attackName}</p>
    `;

    const attackRolls = message.rolls.filter(roll => roll.formula.includes('1d20') || roll.formula.includes('2d20kh') || roll.formula.includes('2d20kl'));
    const damageRolls = message.rolls.filter(roll => !roll.formula.includes('1d20') && !roll.formula.includes('2d20kh') && !roll.formula.includes('2d20kl'));

    const damageDistribution = calcularDistribuicaoDeDano(attackRolls, damageRolls);

    content += criarTabelaDeAtaques(token, targets, attackRolls, damageDistribution);

    if (game.user.isGM) {
      ChatMessage.create({
        content: content,
        speaker: ChatMessage.getSpeaker({token: token}),
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });
    }
  }, 250);
}

function calcularDistribuicaoDeDano(attackRolls, damageRolls) {
  if (attackRolls.length === damageRolls.length) {
    return damageRolls.map(roll => roll.total);
  } else if (attackRolls.length === 1 && damageRolls.length > 1) {
    return [damageRolls.reduce((sum, roll) => sum + roll.total, 0)];
  } else {
    const totalDamage = damageRolls.reduce((sum, roll) => sum + roll.total, 0);
    const damagePerAttack = Math.floor(totalDamage / attackRolls.length);
    const remainingDamage = totalDamage % attackRolls.length;
    return Array(attackRolls.length).fill(damagePerAttack).map((damage, index) => damage + (index < remainingDamage ? 1 : 0));
  }
}

function criarTabelaDeAtaques(token, targets, attackRolls, damageDistribution) {
  let content = '';
  attackRolls.forEach((attackRoll, index) => {
    content += `<h4 style="color: #4B0082;">Ataque ${index + 1}</h4>`;
    content += `
      <div style="overflow-x: auto; max-width: 100%;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 0.8em; white-space: nowrap;">
          <thead>
            <tr>
              <th style="position: sticky; left: 0; background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🎯 Alvo</th>
              <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🎲 Ataque</th>
              <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🛡️ Defesa</th>
              <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">📊 Resultado</th>
              <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">💥 Dano</th>
              <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">⚖️ 1/2 Dano</th>
              <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🔧 Ações</th>
            </tr>
          </thead>
          <tbody>
    `;

    const attackValue = attackRoll.total;
    const damageValue = damageDistribution[index];
    const halfDamageValue = Math.round(damageValue / 2);

    targets.forEach(target => {
      const targetActor = target.actor;
      const defenseValue = targetActor.system.attributes.defesa.value;
      const result = attackValue > defenseValue ? "✔️ Acerto" : "❌ Erro";

      if (result === "✔️ Acerto") {
        aplicarDano(target.id, damageValue);
        ChatMessage.create({
          content: `
							<h3 style="color: #8B0000;">⚔️ <span style="font-size: 1.2em;"><strong>Ataque bem sucedido!</strong></span></h3>

                    <p><strong style="color: #8B0000;">${target.name}</strong> atingido! <strong style="color: #8B0000;">${damageValue}</strong> de dano aplicado automaticamente. 🎯</p>`,
          speaker: ChatMessage.getSpeaker({ token: token }),
          type: CONST.CHAT_MESSAGE_TYPES.OTHER
        });
      } else {
        ChatMessage.create({
          content: `
							<h3 style="color: #00008B;">🛡️ <span style="font-size: 1.2em;"><strong>Ataque mal sucedido!</strong></span></h3>

                    <p><strong style="color: #00008B;">${target.name}</strong> se defende! O ataque falhou. ❌</p>`,
          speaker: ChatMessage.getSpeaker({ token: token }),
          type: CONST.CHAT_MESSAGE_TYPES.OTHER
        });
      }

      content += `
        <tr>
          <td style="padding: 5px; text-align: center; white-space: nowrap; position: sticky; left: 0; background-color: #f1f1f1;">${target.name}</td>
          <td style="padding: 5px; text-align: center;">${attackValue}</td>
          <td style="padding: 5px; text-align: center;">${defenseValue}</td>
          <td style="padding: 5px; text-align: center;">${result}</td>
          <td style="padding: 5px; text-align: center;">${damageValue}</td>
          <td style="padding: 5px; text-align: center;">${halfDamageValue}</td>
          <td style="padding: 5px; text-align: center;">
            <button data-target-id="${target.id}" data-damage="${damageValue}" class="remove-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #1a3a3a, #2F4F4F); color: white; border: none; border-radius: 3px; font-size: 1em; width: 24px; height: 24px;" title="Recuperar dano total">🌿</button>
            <button data-target-id="${target.id}" data-damage="${halfDamageValue}" class="remove-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #2F4F4F, #3D5C5C); color: white; border: none; border-radius: 3px; font-size: 1em; width: 32px; height: 24px;" title="Recuperar 1/2 do dano">½🌿</button>
            <button data-target-id="${target.id}" data-damage="${halfDamageValue}" class="apply-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #4A766E, #5C8374); color: white; border: none; border-radius: 3px; font-size: 1em; width: 32px; height: 24px;" title="Aplicar 1/2 do dano">½🗡️</button>
            <button data-target-id="${target.id}" data-damage="${damageValue}" class="apply-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #5C8374, #6E9987); color: white; border: none; border-radius: 3px; font-size: 1em; width: 24px; height: 24px;" title="Aplicar dano total">🗡️</button>
          </td>
        </tr>
      `;
    });

    content += `</tbody></table></div>`;
  });

  return content;
}

function aplicarDano(targetId, dano) {
  const target = canvas.tokens.get(targetId);
  if (target) {
    const pvAtuais = target.actor.system.attributes.pv.value;
    const novosPV = Math.max(pvAtuais - dano, 0);
    target.actor.update({"system.attributes.pv.value": novosPV});
  }
}

function reverterDano(targetId, dano) {
  const target = canvas.tokens.get(targetId);
  if (target) {
    const pvAtuais = target.actor.system.attributes.pv.value;
    const novosPV = pvAtuais + dano;
    target.actor.update({"system.attributes.pv.value": novosPV});
  }
}

// Hook para processar todas as mensagens do chat
function configurarHookMensagem() {
  if (!window.hookMensagemConfigurado) {
    Hooks.on('createChatMessage', (message) => {
      if (game.user.isGM) {
        processarMensagemChat(message);
      }
    });
    window.hookMensagemConfigurado = true;
  }
}

// Event listener para os botões de dano
function configurarListenersBotoes() {
  if (!window.listenersBotoesConfigurados) {
    $(document).on('click', '.apply-damage, .remove-damage', function(event) {
      const targetId = $(this).data('target-id');
      const damage = parseInt($(this).data('damage'));
      if ($(this).hasClass('apply-damage')) {
        aplicarDano(targetId, damage);
      } else {
        reverterDano(targetId, damage);
      }
    });
    window.listenersBotoesConfigurados = true;
  }
}

// Função para ativar a calculadora de acerto
function ativarCalculadoraAcerto() {
  window.calculadoraAcertoAtiva = true;
  atualizarIndicadorVisual();
  configurarHookMensagem();
  configurarListenersBotoes();
  ui.notifications.info("Calculadora de acerto ativada.");
}

// Ativar a calculadora ao executar a macro
ativarCalculadoraAcerto();