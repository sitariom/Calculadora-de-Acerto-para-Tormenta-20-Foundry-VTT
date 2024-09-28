// 🤖 Calculadora de Acerto e Dano Avançada - Versão Atualizada

// Variável global para controlar o estado da calculadora
window.calculadoraAcertoAtiva = window.calculadoraAcertoAtiva || false;

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

        indicador.onmousedown = function (event) {
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

            indicador.onmouseup = function () {
                document.removeEventListener('mousemove', aoMoverMouse);
                indicador.onmouseup = null;
                localStorage.setItem('indicadorTop', indicador.style.top);
                localStorage.setItem('indicadorLeft', indicador.style.left);
            };
        };

        indicador.ondragstart = function () {
            return false;
        };
    }

    indicador.innerHTML = window.calculadoraAcertoAtiva ?
        '🤖 Calculadora ativada' :
        '🤖 Calculadora desativada';
}

// Função para extrair o tipo de dano de uma rolagem
function extrairTipoDano(rollContent) {
    if (typeof rollContent === 'string') {
        const match = rollContent.match(/\[(.*?)\]/);
        return match ? match[1].toLowerCase() : "não especificado";
    } else if (rollContent && rollContent.terms) {
        for (let term of rollContent.terms) {
            if (term.options && term.options.flavor) {
                return term.options.flavor.toLowerCase();
            }
        }
    }
    return "não especificado";
}

// Função para verificar resistências, vulnerabilidades, imunidades e exceções
function verificarResistencias(targetActor, tipoDano) {
    const resistencias = foundry.utils.getProperty(targetActor, 'system.tracos.resistencias') || {};

    function verificarTipo(danoTipo) {
        return {
            resistenciaTipo: foundry.utils.getProperty(resistencias, `${danoTipo}.value`) || 0,
            base: foundry.utils.getProperty(resistencias, `${danoTipo}.base`) || 0,
            excecao: foundry.utils.getProperty(resistencias, `${danoTipo}.excecao`) || 0,
            imunidade: foundry.utils.getProperty(resistencias, `${danoTipo}.imunidade`) || false,
            vulnerabilidade: foundry.utils.getProperty(resistencias, `${danoTipo}.vulnerabilidade`) || false
        };
    }

    const tiposDano = ["dano", "perda", "acido", "corte", "eletricidade", "essencia", "fogo", "frio", "impacto", "luz", "psiquico", "perfuracao", "trevas"];

    let resultado = {
        resistenciaGeral: verificarTipo("dano"),
        resistenciaPerda: verificarTipo("perda"),
        resistenciasEspecificas: {},
        vulnerabilidades: [],
        imunidades: [],
        excecoes: {}
    };

    tiposDano.forEach(tipo => {
        const info = verificarTipo(tipo);
        if (info.imunidade) resultado.imunidades.push(tipo);
        if (info.vulnerabilidade) resultado.vulnerabilidades.push(tipo);
        if (info.resistenciaTipo > 0 || info.base > 0 || info.excecao > 0) {
            resultado.resistenciasEspecificas[tipo] = info;
        }
        if (info.excecao > 0) {
            resultado.excecoes[tipo] = info.excecao;
        }
    });

    return resultado;
}

// Função para ajustar o dano ou cura com base nas resistências, vulnerabilidades, exceções e cura
function ajustarDanoOuCura(danoOriginal, tipoDano, resistenciasInfo) {
    let danoAjustado = danoOriginal;
    let motivo = `<h3>Análise detalhada do efeito ${obterEmojiTipoDano(tipoDano)} ${tipoDano}</h3>`;
    motivo += `<p><strong>Valor original:</strong> ${danoOriginal}</p>`;

    const tiposCura = ["curapv", "curatpv", "curapm", "curatpm"];
    if (tiposCura.includes(tipoDano)) {
        motivo += `<p>Este é um efeito de cura, não há redução.</p>`;
        return { danoFinal: danoAjustado, motivo: motivo };
    }

    // Verificar imunidade geral ou específica
    if (resistenciasInfo.resistenciaGeral.imunidade || resistenciasInfo.imunidades.includes(tipoDano)) {
        motivo += `<p><strong>Imunidade detectada!</strong> O alvo é imune a este tipo de efeito.</p>`;
        return { danoFinal: 0, motivo: motivo };
    }

    // Aplicar vulnerabilidade antes das resistências
    const temVulnerabilidade = resistenciasInfo.resistenciaGeral.vulnerabilidade || resistenciasInfo.vulnerabilidades.includes(tipoDano);
    if (temVulnerabilidade) {
        let danoAdicional = Math.floor(danoAjustado * 0.5);
        danoAjustado += danoAdicional;
        motivo += `<p><strong>Aplicar vulnerabilidade:</strong> ${danoOriginal} + (${danoOriginal} * 0.5) = ${danoAjustado}</p>`;
    }

    // Aplicar resistência geral
    let resistenciaGeral = resistenciasInfo.resistenciaGeral.resistenciaTipo;
    danoAjustado -= resistenciaGeral;
    motivo += `<p><strong>Resistência geral:</strong> -${resistenciaGeral}</p>`;

    // Aplicar exceções (somente para tipos de dano diferentes do tipo de exceção)
    let resistenciaExcecao = 0;
    Object.entries(resistenciasInfo.excecoes).forEach(([tipoExcecao, valorExcecao]) => {
        if (tipoExcecao !== tipoDano) {
            resistenciaExcecao += valorExcecao;
            motivo += `<p><strong>Exceção (${tipoExcecao}):</strong> -${valorExcecao}</p>`;
        }
    });

    if (resistenciaExcecao > 0) {
        danoAjustado -= resistenciaExcecao;
        motivo += `<p><strong>Valor após resistências geral e exceções:</strong> ${danoAjustado}</p>`;
    }

    // Aplicar resistência específica
    let resistenciaEspecifica = 0;
    if (resistenciasInfo.resistenciasEspecificas[tipoDano]) {
        resistenciaEspecifica = resistenciasInfo.resistenciasEspecificas[tipoDano].resistenciaTipo;
        danoAjustado -= resistenciaEspecifica;
        motivo += `<p><strong>Resistência ao tipo ${tipoDano}:</strong> -${resistenciaEspecifica}</p>`;
        motivo += `<p><strong>Valor após resistência específica:</strong> ${danoAjustado}</p>`;
    }

    danoAjustado = Math.max(Math.floor(danoAjustado), 0);
    motivo += `<p><strong>Valor final:</strong> ${danoAjustado} (arredondado para cima, mínimo 0)</p>`;

    return { danoFinal: danoAjustado, motivo: motivo };
}

// Função para obter emoji baseado no tipo de dano
function obterEmojiTipoDano(tipo) {
    const emojis = {
        dano: "💢", perda: "☠️", acido: "🧪", corte: "🔪", eletricidade: "⚡",
        essencia: "💫", fogo: "🔥", frio: "❄️", impacto: "💥", luz: "💡",
        psiquico: "🧠", perfuracao: "🔩", trevas: "🌑", "não especificado": "❓",
        curapv: "🩸", curatpv: "💖", curapm: "💧", curatpm: "💙"
    };
    return emojis[tipo] || "❓";
}

// Função para calcular a distribuição de dano
function calcularDistribuicaoDeDano(damageRolls) {
    return damageRolls.map(roll => roll.total);
}

// Função para criar a tabela de efeitos (continuação)
function criarTabelaDeEfeitos(token, targets, attackRolls, damageDistribution, tiposDano, isAttackRoll, aplicarDanoAutomaticamente) {
    let content = '';
    damageDistribution.forEach((damageValue, index) => {
        content += `<h4 style="color: #4B0082;">Efeito ${index + 1}</h4>`;
        content +=
            `<div style="overflow-x: auto; max-width: 100%;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 0.8em; white-space: nowrap;">
                    <thead>
                        <tr>
                            <th style="position: sticky; left: 0; background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🎯 Alvo</th>
                            ${isAttackRoll ?
                `<th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🎲 Ataque</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🛡️ Defesa</th>` : ''}
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🛡️ RD Geral</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🔧 Resistências Específicas</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">⚠️ Vulnerabilidades</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🛡️ Imunidades</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🚫 Exceções</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">📊 Resultado</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">💥 Valor Original</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">💥 Valor Ajustado</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">⚖️ 1/2 Valor</th>
                            <th style="background-color: #2F4F4F; color: white; border-bottom: 1px solid #ddd; padding: 5px;">🔧 Ações</th>
                        </tr>
                    </thead>
                    <tbody>`;

        const attackValue = isAttackRoll ? attackRolls[index]?.total : null;
        const tipoDano = tiposDano[index] || "não especificado";

        targets.forEach(target => {
            const targetActor = target.actor;
            const defenseValue = foundry.utils.getProperty(targetActor, 'system.attributes.defesa.value');

            const resistenciasInfo = verificarResistencias(targetActor, tipoDano);

            const { danoFinal, motivo } = ajustarDanoOuCura(damageValue, tipoDano, resistenciasInfo);

            let resultado;
            if (isAttackRoll) {
                resultado = attackValue > defenseValue ? "✔️ Ataque bem-sucedido" : "❌ Erro";
            } else {
                resultado = "Dano Direto";
            }

            const resistenciasList = Object.entries(resistenciasInfo.resistenciasEspecificas)
                .map(([tipo, info]) => `${obterEmojiTipoDano(tipo)} ${tipo}: ${info.resistenciaTipo}`)
                .join(', ');

            const vulnerabilidadesList = resistenciasInfo.vulnerabilidades
                .map(tipo => `${obterEmojiTipoDano(tipo)} ${tipo}`)
                .join(', ');

            const imunidadesList = resistenciasInfo.imunidades
                .map(tipo => `${obterEmojiTipoDano(tipo)} ${tipo}`)
                .join(', ');

            const excecoesList = Object.entries(resistenciasInfo.excecoes)
                .map(([tipo, valor]) => `${obterEmojiTipoDano(tipo)} ${tipo}: +${valor} (exceto ${tipo})`)
                .join(', ');

            content +=
                `<tr>
                    <td style="padding: 5px; text-align: center; white-space: nowrap; position: sticky; left: 0; background-color: #f1f1f1;">${target.name}</td>
                    ${isAttackRoll ?
                    `<td style="padding: 5px; text-align: center;">${attackValue}</td>
                    <td style="padding: 5px; text-align: center;">${defenseValue}</td>` : ''}
                    <td style="padding: 5px; text-align: center;">${resistenciasInfo.resistenciaGeral.resistenciaTipo}</td>
                    <td style="padding: 5px; text-align: center;">${resistenciasList || "Nenhuma"}</td>
                    <td style="padding: 5px; text-align: center;">${vulnerabilidadesList || "Nenhuma"}</td>
                    <td style="padding: 5px; text-align: center;">${imunidadesList || "Nenhuma"}</td>
                    <td style="padding: 5px; text-align: center;">${excecoesList || "Nenhuma"}</td>
                    <td style="padding: 5px; text-align: center;">${resultado}</td>
                    <td style="padding: 5px; text-align: center;">${damageValue}</td>
                    <td style="padding: 5px; text-align: center;">${danoFinal}</td>
                    <td style="padding: 5px; text-align: center;">${Math.round(danoFinal / 2)}</td>
                    <td style="padding: 5px; text-align: center;">
                        <button data-target-id="${target.id}" data-damage="${danoFinal}" data-tipo-dano="${tipoDano}" class="remove-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #1a3a3a, #2F4F4F); color: white; border: none; border-radius: 3px; font-size: 1em; width: 24px; height: 24px;" title="Recuperar valor total">🌿</button>
                        <button data-target-id="${target.id}" data-damage="${Math.round(danoFinal / 2)}" data-tipo-dano="${tipoDano}" class="remove-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #2F4F4F, #3D5C5C); color: white; border: none; border-radius: 3px; font-size: 1em; width: 32px; height: 24px;" title="Recuperar 1/2 do valor">½🌿</button>
                        <button data-target-id="${target.id}" data-damage="${Math.round(danoFinal / 2)}" data-tipo-dano="${tipoDano}" class="apply-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #4A766E, #5C8374); color: white; border: none; border-radius: 3px; font-size: 1em; width: 32px; height: 24px;" title="Aplicar 1/2 do valor">½🗡️</button>
                        <button data-target-id="${target.id}" data-damage="${danoFinal}" data-tipo-dano="${tipoDano}" class="apply-damage" style="padding: 2px; margin: 1px; background: linear-gradient(to right, #5C8374, #6E9987); color: white; border: none; border-radius: 3px; font-size: 1em; width: 24px; height: 24px;" title="Aplicar valor total">🗡️</button>
                    </td>
                </tr>`;

            if (aplicarDanoAutomaticamente && resultado !== "❌ Erro") {
                if (["curapv", "curatpv", "curapm", "curatpm"].includes(tipoDano)) {
                    aplicarCura(target.id, danoFinal, tipoDano);
                } else {
                    aplicarDano(target.id, danoFinal);
                }
            }

            criarMensagemDetalhada(token, target, attackValue, defenseValue, damageValue, danoFinal, tipoDano, resultado, motivo);
        });

        content += `</tbody></table></div>`;
    });

    return content;
}

// Função para criar mensagem detalhada
function criarMensagemDetalhada(token, target, attackValue, defenseValue, damageValue, danoFinal, tipoDano, resultado, motivo) {
    let mensagem = '';
    let cor = '';

    if (["curapv", "curatpv", "curapm", "curatpm"].includes(tipoDano)) {
        cor = "#00FF00";
        const atributo = tipoDano.includes("pv") ? "pv" : "pm";
        const valorAtual = target.actor.system.attributes[atributo].value;
        const valorMax = target.actor.system.attributes[atributo].max;
        const novoValor = Math.min(valorAtual + danoFinal, valorMax);

        mensagem = `<h3 style="color: ${cor};">❤️ <strong>${obterEmojiTipoDano(tipoDano)} ${tipoDano.toUpperCase()} aplicada!</strong></h3>`;
        mensagem += `<p><strong style="color: ${cor};">${token.name}</strong> curou/recuperou <strong style="color: ${cor};">${target.name}</strong>!</p>`;
        mensagem += `<p>Valor de cura: <strong>${danoFinal}</strong> (${tipoDano})</p>`;
        mensagem += `<p>${atributo.toUpperCase()} de ${target.name}: ${valorAtual} → ${novoValor} (Máximo: ${valorMax})</p>`;
        mensagem += `<p>${danoFinal} de ${tipoDano} aplicado automaticamente. ${obterEmojiTipoDano(tipoDano)}</p>`;
    } else if (resultado === "✔️ Ataque bem-sucedido" || resultado === "Dano Direto") {
        cor = "#8B0000";
        const pvAtuais = target.actor.system.attributes.pv.value;
        const pvMax = target.actor.system.attributes.pv.max;
        const novosPV = Math.max(pvAtuais - danoFinal, 0);

        mensagem = `<h3 style="color: ${cor};">⚔️ <strong>${resultado}</strong></h3>`;
        mensagem += `<p><strong style="color: ${cor};">${token.name}</strong> realizou um ataque bem-sucedido contra <strong style="color: ${cor};">${target.name}</strong>!</p>`;
        if (attackValue !== null && defenseValue !== null) {
            mensagem += `<p>Valor do ataque: <strong>${attackValue}</strong> | Defesa do alvo: <strong>${defenseValue}</strong></p>`;
        }
        mensagem += `<p>Dano original: <strong>${damageValue}</strong> (${tipoDano})</p>`;
        mensagem += `<p>Dano ajustado: <strong>${danoFinal}</strong></p>`;
        mensagem += `<p>PV de ${target.name}: ${pvAtuais} → ${novosPV} (Máximo: ${pvMax})</p>`;
        mensagem += `<p>${danoFinal} de dano aplicado automaticamente. ${obterEmojiTipoDano(tipoDano)}</p>`;
    } else {
        cor = "#00008B";
        mensagem = `<h3 style="color: ${cor};">🛡️ <strong>Ataque mal sucedido!</strong></h3>`;
        mensagem += `<p><strong style="color: ${cor};">${token.name}</strong> errou o ataque contra <strong style="color: ${cor};">${target.name}</strong>!</p>`;
        mensagem += `<p>Valor do ataque: <strong>${attackValue}</strong> | Defesa do alvo: <strong>${defenseValue}</strong></p>`;
        mensagem += `<p>Nenhum dano foi aplicado.</p>`;
    }

    mensagem += `<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-top: 10px;">`;
    mensagem += `<h4>Detalhes do cálculo:</h4>`;
    mensagem += motivo;
    mensagem += `</div>`;

    ChatMessage.create({
        content: mensagem,
        speaker: ChatMessage.getSpeaker({ token: token }),
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
        whisper: ChatMessage.getWhisperRecipients("GM")
    });
}

// Função para verificar a necessidade de teste de resistência
function verificarTesteResistencia(rollContent) {
    const regexResistencia = /resistência.*?(fortitude|reflexo|vontade).*?cd\s*(\d+)/i;
    const match = rollContent.match(regexResistencia);

    if (match) {
        const tipoResistencia = match[1] ? match[1].toLowerCase() : "não especificado";
        const valorCD = parseInt(match[2]);
        return {
            tipoResistencia: tipoResistencia,
            valorCD: valorCD
        };
    }
    return null;
}

// Função para processar mensagens do chat
function processarMensagemChat(message) {
    if (!window.calculadoraAcertoAtiva) return;

    const actor = game.actors.get(message.speaker.actor);
    if (!actor) return;

    const token = actor.getActiveTokens()[0];
    if (!token) return;

    const targets = Array.from(game.users.find(u => u.id === message.author.id).targets);
    if (targets.length === 0) return;

    const conteudoMensagem = message.content.toLowerCase();
    const temAtaque = conteudoMensagem.includes("ataque");
    const temDano = conteudoMensagem.includes("dano");

    if (!temAtaque && !temDano) return;

    const rollsAtaque = extrairRolagens(message, "ataque");
    const rollsDano = extrairRolagens(message, "dano");

    const isAttackRoll = rollsAtaque.length > 0;
    const isDamageRoll = rollsDano.length > 0;

    if (!isAttackRoll && !isDamageRoll) return;

    const testeResistencia = verificarTesteResistencia(message.content);
    const aplicarDanoAutomaticamente = !testeResistencia;

    setTimeout(() => {
        let content =
            `<h3 style="color: #4B0082;">🧙‍♂️ <strong>Análise do efeito:</strong></h3>
            <p><strong>Origem:</strong> ${token.name}</p>`;

        if (isAttackRoll) {
            content += `<p><strong>Rolagens de Ataque:</strong> ${rollsAtaque.map(roll => roll.total).join(', ')}</p>`;

            targets.forEach(target => {
                const targetActor = target.actor;
                const defenseValue = foundry.utils.getProperty(targetActor, 'system.attributes.defesa.value');
                const attackValue = rollsAtaque[0]?.total;

                let resultado = attackValue > defenseValue ? "✔️ Ataque bem-sucedido" : "❌ Erro";

                content += `<p>Resultado do ataque contra ${target.name}: ${resultado}</p>`;

                if (!isDamageRoll) {
                    criarMensagemDetalhada(token, target, attackValue, defenseValue, 0, 0, "ataque", resultado, "");
                }
            });
        }

        if (isDamageRoll) {
            const damageDistribution = calcularDistribuicaoDeDano(rollsDano);
            const tiposDano = rollsDano.map(roll => extrairTipoDano(roll));

            content += `<p><strong>Tipos de Efeito:</strong> ${tiposDano.map(tipo => obterEmojiTipoDano(tipo) + " " + tipo.charAt(0).toUpperCase() + tipo.slice(1)).join(', ')}</p>`;
            content += criarTabelaDeEfeitos(token, targets, rollsAtaque, damageDistribution, tiposDano, isAttackRoll, aplicarDanoAutomaticamente);
        }

        if (testeResistencia) {
            const { tipoResistencia, valorCD } = testeResistencia;
            const mensagemResistencia = `<p>O alvo deve realizar um teste de ${tipoResistencia.toUpperCase()} com CD ${valorCD}.</p>`;
            content += mensagemResistencia;
        }

        if (game.user.isGM) {
            ChatMessage.create({
                content: content,
                speaker: ChatMessage.getSpeaker({ token: token }),
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
                whisper: ChatMessage.getWhisperRecipients("GM")
            });
        }
    }, 250);
}

// Função auxiliar para extrair rolagens específicas
function extrairRolagens(message, tipo) {
    const conteudoMensagem = message.content.toLowerCase();
    const linhas = conteudoMensagem.split('\n');
    let capturando = false;
    let rolagens = [];

    for (let linha of linhas) {
        if (linha.includes(tipo)) {
            capturando = true;
            continue;
        }
        if (capturando && (linha.includes("ataque") || linha.includes("dano"))) {
            break;
        }
        if (capturando && linha.trim() !== "") {
            const roll = message.rolls.find(r => r._formula === linha.trim());
            if (roll) {
                rolagens.push(roll);
            }
        }
    }

    return rolagens;
}


// Função para aplicar dano
function aplicarDano(targetId, dano) {
    const target = canvas.tokens.get(targetId);
    if (target) {
        const actor = target.actor;
        let pvAtuais = actor.system.attributes.pv.value;
        let pvTemp = actor.system.attributes.pv.temp || 0;
        const pvMin = actor.system.attributes.pv.min;

        if (pvTemp > 0) {
            if (dano > pvTemp) {
                dano -= pvTemp;
                pvTemp = 0;
            } else {
                pvTemp -= dano;
                dano = 0;
            }
        }

        pvAtuais = Math.max(pvAtuais - dano, pvMin);

        actor.update({
            "system.attributes.pv.value": pvAtuais,
            "system.attributes.pv.temp": pvTemp
        });
    }
}

// Função para aplicar cura
function aplicarCura(targetId, cura, tipoCura) {
    const target = canvas.tokens.get(targetId);
    if (target) {
        const actor = target.actor;
        let atributo, valorAtual, valorMax, valorTemp;

        switch (tipoCura) {
            case "curapv":
            case "curatpv":
                atributo = "pv";
                break;
            case "curapm":
            case "curatpm":
                atributo = "pm";
                break;
            default:
                return;
        }

        valorAtual = actor.system.attributes[atributo].value;
        valorMax = actor.system.attributes[atributo].max;
        valorTemp = actor.system.attributes[atributo].temp || 0;

        if (tipoCura.startsWith("curat")) {
            valorTemp = Math.min(valorTemp + cura, valorMax);
        } else {
            valorAtual = Math.min(valorAtual + cura, valorMax);
        }

        actor.update({
            [`system.attributes.${atributo}.value`]: valorAtual,
            [`system.attributes.${atributo}.temp`]: valorTemp
        });
    }
}

// Função para reverter dano ou cura
function reverterDanoOuCura(targetId, valor, tipoDano) {
    const target = canvas.tokens.get(targetId);
    if (target) {
        const actor = target.actor;
        let atributo, valorAtual, valorMax;

        if (["curapv", "curatpv", "curapm", "curatpm"].includes(tipoDano)) {
            atributo = tipoDano.includes("pv") ? "pv" : "pm";
            valorAtual = actor.system.attributes[atributo].value;
            valorMax = actor.system.attributes[atributo].max;
            valorAtual = Math.max(valorAtual - valor, 0);
        } else {
            atributo = "pv";
            valorAtual = actor.system.attributes.pv.value;
            valorMax = actor.system.attributes.pv.max;
            valorAtual = Math.min(valorAtual + valor, valorMax);
        }

        actor.update({
            [`system.attributes.${atributo}.value`]: valorAtual
        });
    }
}

// Event listener para os botões de dano
function configurarListenersBotoes() {
    if (!window.listenersBotoesConfigurados) {
        $(document).on('click', '.apply-damage, .remove-damage', function (event) {
            const targetId = $(this).data('target-id');
            const damage = parseInt($(this).data('damage'));
            const tipoDano = $(this).data('tipo-dano');
            if ($(this).hasClass('apply-damage')) {
                if (["curapv", "curatpv", "curapm", "curatpm"].includes(tipoDano)) {
                    aplicarCura(targetId, damage, tipoDano);
                } else {
                    aplicarDano(targetId, damage);
                }
            } else {
                reverterDanoOuCura(targetId, damage, tipoDano);
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
    ui.notifications.info("Calculadora de acerto e dano ativada.");
}

// Função para desativar a calculadora de acerto
function desativarCalculadoraAcerto() {
    window.calculadoraAcertoAtiva = false;
    atualizarIndicadorVisual();
    ui.notifications.info("Calculadora de acerto e dano desativada.");
}

// Configurar hook para mensagens do chat
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

// Macro principal para ativar
function macroAtivarCalculadora() {
    ativarCalculadoraAcerto();
}

// Macro secundária para desativar
function macroDesativarCalculadora() {
    desativarCalculadoraAcerto();
}

// Inicialização da macro
function inicializarMacro() {
    if (!window.calculadoraAcertoInicializada) {
        ativarCalculadoraAcerto();
        window.calculadoraAcertoInicializada = true;
    } else {
        ui.notifications.warn("A Calculadora de Acerto e Dano já está inicializada. Use a macro de ativação/desativação conforme necessário.");
    }
}

// Chamada inicial da macro
inicializarMacro();

// Exportar funções para uso global
window.macroAtivarCalculadora = macroAtivarCalculadora;
window.macroDesativarCalculadora = macroDesativarCalculadora;
