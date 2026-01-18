/**
 * 🤖 Calculadora de Acerto e Dano T20 - Versão Ultimate (v2.4)
 * Autor: Refatoração por IA
 * Compatibilidade: Tormenta 20 (Jogo do Ano) - Foundry V11+
 * * ATUALIZAÇÕES:
 * 1. RD Genérica aplica-se a tudo exceto "Perda".
 * 2. Mecânica de "Exceção" reimplementada (RD exceto X).
 * 3. Botão de Curar Metade restaurado.
 * 4. Alerta de CD simplificado (apenas texto).
 */

class T20CalculadoraUltimate {
    static ID = 't20-calc-ultimate';
    static FLAG_IGNORE = 'ignore-calc';

    static init() {
        if (typeof window.t20CalcState === 'undefined') {
            window.t20CalcState = {
                ativo: false,
                autoAplicar: false,
                posicao: { top: '60px', left: '20px' },
                undoStack: []
            };
        }

        this.carregarConfiguracoes();
        this.injetarEstilos();
        this.registrarHooks();
        this.renderizarIndicador();

        if (!window.t20CalcState.ativo) {
            this.toggleAtivo();
        } else {
            ui.notifications.info("Calculadora T20: Lógica de RD/Exceção Atualizada.");
            this.renderizarIndicador();
        }
    }

    static carregarConfiguracoes() {
        const savedTop = localStorage.getItem(`${this.ID}-top`);
        const savedLeft = localStorage.getItem(`${this.ID}-left`);
        const savedAuto = localStorage.getItem(`${this.ID}-auto`);
        
        if (savedTop) window.t20CalcState.posicao = { top: savedTop, left: savedLeft };
        if (savedAuto) window.t20CalcState.autoAplicar = (savedAuto === 'true');
    }

    static toggleAtivo() {
        window.t20CalcState.ativo = !window.t20CalcState.ativo;
        this.renderizarIndicador();
    }

    // --- Interface Gráfica (UI) ---

    static injetarEstilos() {
        const styleId = 't20-calc-css-ultimate';
        if (document.getElementById(styleId)) return;

        const css = `
            #${this.ID} {
                position: fixed;
                background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);
                color: #e0e1dd;
                border: 1px solid #415a77;
                padding: 6px 10px;
                border-radius: 8px;
                z-index: 9999;
                font-family: "Signika", sans-serif;
                font-size: 13px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.8);
                display: flex; gap: 8px; align-items: center;
                user-select: none;
                backdrop-filter: blur(5px);
            }
            .t20-calc-msg { font-size: 13px; background: #f8f9fa; border-left: 5px solid #1b263b; padding: 6px; color: #333; }
            .t20-calc-header { font-weight: bold; color: #0d1b2a; border-bottom: 1px solid #ccc; margin-bottom: 6px; padding-bottom: 2px; display:flex; justify-content:space-between; align-items: center; }
            .t20-calc-tag { font-size: 10px; padding: 1px 4px; border-radius: 4px; color: white; margin-left: 5px; text-transform: uppercase; font-weight: bold; }
            .tag-crit { background: #d4af37; box-shadow: 0 0 5px #d4af37; }
            .tag-fumble { background: #333; }
            .tag-maneuver { background: #5a189a; }
            .tag-save { background: #e65100; }
            .t20-calc-table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px; }
            .t20-calc-table th { background: #415a77; color: #fff; padding: 3px; }
            .t20-calc-table td { border-bottom: 1px solid #ddd; padding: 3px; text-align: center; vertical-align: middle; }
            .t20-btn-icon {
                border: none; border-radius: 4px; color: white; cursor: pointer;
                padding: 3px; margin: 0 1px; width: 26px; height: 26px;
                transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;
            }
            .t20-btn-icon:hover { filter: brightness(1.2); transform: translateY(-1px); }
            .t20-btn-icon:active { transform: scale(0.95); }
            
            /* UI Principal Buttons */
            .t20-ui-btn {
                background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 14px; color: #fff;
            }
            .t20-ui-btn:hover { background: rgba(255,255,255,0.2); }
            .t20-ui-btn.active { background: #2e7d32; border-color: #4caf50; }
            .t20-undo-btn { background: #c62828; }
            .t20-undo-btn:disabled { opacity: 0.3; cursor: default; background: #555; }
        `;
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    static renderizarIndicador() {
        let el = document.getElementById(this.ID);
        if (!el) {
            el = document.createElement('div');
            el.id = this.ID;
            
            let isDown = false, offset = [0,0];
            el.addEventListener('mousedown', (e) => {
                if(e.target.tagName === 'BUTTON' || e.target.tagName === 'I') return;
                isDown = true;
                offset = [el.offsetLeft - e.clientX, el.offsetTop - e.clientY];
            });
            document.addEventListener('mouseup', () => isDown = false);
            document.addEventListener('mousemove', (e) => {
                if (isDown) {
                    el.style.left = (e.clientX + offset[0]) + 'px';
                    el.style.top  = (e.clientY + offset[1]) + 'px';
                    localStorage.setItem(`${this.ID}-left`, el.style.left);
                    localStorage.setItem(`${this.ID}-top`, el.style.top);
                }
            });
            document.body.appendChild(el);
        }

        const undoCount = window.t20CalcState.undoStack.length;
        const autoAtivo = window.t20CalcState.autoAplicar;

        el.innerHTML = `
            <div style="cursor:move; font-weight:bold; display:flex; align-items:center; gap:5px;">
                <span title="T20 Calculator Ultimate">🛡️ T20</span>
            </div>
            <div style="height:20px; width:1px; background:#415a77; margin:0 5px;"></div>
            <button id="t20-btn-config" class="t20-ui-btn ${autoAtivo ? 'active' : ''}" title="Configurações (Auto)">⚙️</button>
            <button id="t20-btn-undo" class="t20-ui-btn t20-undo-btn" title="Desfazer (${undoCount})" ${undoCount === 0 ? 'disabled' : ''}>↩️</button>
        `;

        document.getElementById('t20-btn-config').onclick = () => this.abrirConfiguracoes();
        document.getElementById('t20-btn-undo').onclick = () => this.desfazerUltimaAcao();
    }

    static abrirConfiguracoes() {
        new Dialog({
            title: "Configurações T20 Calc",
            content: `
                <div style="padding: 10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <label style="font-weight:bold;">Auto-Aplicar Dano (Acerto)</label>
                        <input type="checkbox" id="t20-cfg-auto" ${window.t20CalcState.autoAplicar ? 'checked' : ''}>
                    </div>
                    <p style="font-size: 11px; color: #666;">
                        Aplica dano automaticamente se o ataque superar a defesa. 
                        <br><b>Nota:</b> Magias com CD (Resistência) nunca aplicam dano automático.
                    </p>
                    <hr>
                    <div style="text-align: center; margin-top: 10px;">
                        <button id="t20-cfg-reset-pos">📍 Resetar Painel</button>
                    </div>
                </div>
            `,
            buttons: {
                save: {
                    label: "💾 Salvar",
                    callback: (html) => {
                        const auto = html.find('#t20-cfg-auto').is(':checked');
                        window.t20CalcState.autoAplicar = auto;
                        localStorage.setItem(`${this.ID}-auto`, auto);
                        html.find('#t20-cfg-reset-pos').click(() => {
                            window.t20CalcState.posicao = { top: '60px', left: '20px' };
                            this.renderizarIndicador();
                        });
                        this.renderizarIndicador();
                        ui.notifications.info("Configurações salvas.");
                    }
                }
            },
            default: "save"
        }).render(true);
    }

    // --- Hooks ---

    static registrarHooks() {
        $(document).off('click.t20calc');
        $(document).on('click.t20calc', '.t20-btn-icon', (ev) => this.onBotaoClique(ev));

        if (window.t20CalcHooksRegistered) return;

        Hooks.on('createChatMessage', (message) => {
            if (!game.user.isGM || !window.t20CalcState.ativo) return;
            if (message.flags?.[this.ID]?.[this.FLAG_IGNORE]) return;
            setTimeout(() => this.processarMensagem(message), 50);
        });

        window.t20CalcHooksRegistered = true;
    }

    // --- Processamento Inteligente ---

    static async processarMensagem(message) {
        const actor = game.actors.get(message.speaker.actor);
        if (!actor) return;

        const userAuthor = game.users.get(message.author.id);
        const targets = userAuthor ? Array.from(userAuthor.targets) : [];
        
        const content = message.content.toLowerCase();
        const flavor = (message.flavor || '').toLowerCase();
        const temRolls = message.rolls && message.rolls.length > 0;
        
        // Detecção de CD aprimorada
        const regexCD = /(fortitude|reflexos|vontade).*?cd\s*(\d+)/i;
        const matchCD = content.match(regexCD) || flavor.match(regexCD);
        const isTesteCD = !!matchCD;
        const tipoTeste = matchCD ? matchCD[1] : '';
        const valorCD = matchCD ? matchCD[2] : '';

        if (!temRolls && !isTesteCD) return;

        let rollsAtaque = [];
        let rollsDano = [];

        // 1. Classificação de Rolls (WHITELIST ESTRITA)
        const keywordsAtaque = ['ataque', 'luta', 'pontaria', 'agarrar', 'derrubar', 'desarmar', 'empurrar', 'quebrar', 'manobra'];

        if (temRolls) {
            message.rolls.forEach(roll => {
                const f = (roll.options?.flavor || '').toLowerCase();
                const isD20 = roll.terms.some(t => t.faces === 20);
                
                const isExplicitAttack = keywordsAtaque.some(k => f.includes(k));
                const isExplicitDamage = f.includes('dano');

                if (isExplicitAttack) {
                    rollsAtaque.push(roll);
                } else if (isExplicitDamage) {
                    rollsDano.push(roll);
                } else {
                    if (isD20) {
                        if (content.includes('ataque') && 
                            !f.includes('iniciativa') && 
                            !f.includes('percepção') &&
                            !f.includes('teste') && 
                            !f.includes('resistencia')) {
                            rollsAtaque.push(roll);
                        }
                    } else {
                        rollsDano.push(roll);
                    }
                }
            });
        }

        if (rollsAtaque.length === 0 && rollsDano.length === 0 && temRolls) {
            if (keywordsAtaque.some(k => flavor.includes(k) || content.includes(k))) {
                rollsAtaque.push(message.rolls[0]);
            } else if (flavor.includes('dano') || content.includes('dano')) {
                rollsDano = message.rolls;
            }
        }

        if (rollsAtaque.length === 0 && rollsDano.length === 0 && !isTesteCD) return;

        // 2. Detecções Extras
        const keywordsManobra = ['agarrar', 'derrubar', 'desarmar', 'empurrar', 'quebrar', 'manobra'];
        const isManobra = keywordsManobra.some(k => flavor.includes(k) || content.includes(k));

        // HTML Header
        let html = `<div class="t20-calc-msg">`;
        html += `<div class="t20-calc-header">
            <span>⚔️ ${actor.name}</span>
            <div>
                ${isManobra ? '<span class="t20-calc-tag tag-maneuver">MANOBRA</span>' : ''}
                ${isTesteCD ? `<span class="t20-calc-tag tag-save">${tipoTeste.substring(0,3).toUpperCase()} ${valorCD}</span>` : ''}
            </div>
        </div>`;

        if (targets.length === 0 && (rollsAtaque.length > 0 || rollsDano.length > 0)) {
            html += `<div style="color: #c62828; font-size: 11px; margin-bottom: 5px;">⚠️ Sem alvo selecionado.</div>`;
        }

        const alvosAcertados = new Set(); 

        // 3. Processamento de ATAQUE
        if (rollsAtaque.length > 0) {
            const roll = rollsAtaque[0];
            const totalAtaque = roll.total;
            let isCrit = false, isFumble = false;
            
            const diceTerm = roll.terms.find(t => t.faces === 20);
            if (diceTerm) {
                const result = diceTerm.results.find(r => r.active)?.result;
                if (result === 20) isCrit = true;
                if (result === 1) isFumble = true;
            }

            let textoRoll = `🎲 Ataque: ${totalAtaque}`;
            if (isCrit) textoRoll += ` <span class="t20-calc-tag tag-crit">CRÍTICO!</span>`;
            if (isFumble) textoRoll += ` <span class="t20-calc-tag tag-fumble">FALHA!</span>`;

            html += `<div style="margin-bottom: 8px;">${textoRoll}</div>`;
            
            if (targets.length > 0) {
                html += `<div style="font-size: 12px;">`;
                targets.forEach(target => {
                    const defesa = foundry.utils.getProperty(target.actor, "system.attributes.defesa.value") || 10;
                    let acertou = totalAtaque >= defesa;
                    if (isCrit) acertou = true;
                    if (isFumble) acertou = false;

                    if (acertou) alvosAcertados.add(target.id);

                    const icon = acertou ? '🎯' : '🛡️';
                    const cor = acertou ? '#1b5e20' : '#b71c1c';
                    const texto = acertou ? 'ACERTOU' : 'ERROU';
                    const suffix = isManobra ? ' (Manobra)' : '';

                    html += `<div style="color:${cor}; display:flex; justify-content:space-between; border-bottom:1px dotted #ccc;">
                        <span>${icon} ${target.name}</span>
                        <span>(Def ${defesa}) <b>${texto}${suffix}</b></span>
                    </div>`;
                });
                html += `</div>`;
            }
        } else if (isTesteCD && targets.length > 0) {
            // Apenas texto informativo, sem botão
            html += `<div style="margin-bottom: 8px; background: #fff3e0; padding: 4px; border-radius: 4px; border: 1px solid #ffb74d;">
                <div style="display:flex; justify-content:center; align-items:center;">
                    <span>⚠️ <b>${tipoTeste.toUpperCase()} CD ${valorCD}</b></span>
                </div>
            </div>`;
        }

        // 4. Processamento de DANO
        if (rollsDano.length > 0) {
            for (const roll of rollsDano) {
                const danoTotal = roll.total;
                const tipoDano = this.identificarTipo(roll);
                const emoji = this.getEmoji(tipoDano);

                html += `<div style="margin-top: 8px; background: #e9ecef; padding: 4px; border-radius: 4px;">
                    <strong>${emoji} Dano (${tipoDano}): ${danoTotal}</strong>
                </div>`;

                if (targets.length > 0) {
                    html += `<table class="t20-calc-table">
                        <thead><tr><th>Alvo</th><th>Final</th><th>Ação</th></tr></thead>
                        <tbody>`;
                    
                    for (const target of targets) {
                        const calc = this.calcular(danoTotal, tipoDano, target.actor);
                        
                        const houveAtaqueNaMsg = rollsAtaque.length > 0;
                        const alvoFoiAtingido = alvosAcertados.has(target.id);
                        let deveAplicarAuto = window.t20CalcState.autoAplicar;

                        if (isTesteCD) {
                            deveAplicarAuto = false;
                        } else if (houveAtaqueNaMsg && !alvoFoiAtingido) {
                            deveAplicarAuto = false;
                        }

                        if (deveAplicarAuto && calc.final > 0) {
                            this.modificarAtributos(canvas.tokens.get(target.id), target.actor, calc.final, tipoDano, 'dano');
                        }

                        const autoStatus = deveAplicarAuto ? (calc.final > 0 ? '⚡' : '🚫') : '';
                        
                        const labelFull = isTesteCD ? "Falha (Dano Total)" : "Dano Total";
                        const labelHalf = isTesteCD ? "Sucesso (Metade)" : "Metade";

                        html += `<tr>
                            <td style="text-align:left;">
                                ${target.name}
                                <div style="font-size:9px; color:#666;">${calc.log}</div>
                                <div style="font-size:9px; color:#2e7d32; font-weight:bold;">${autoStatus}</div>
                            </td>
                            <td style="font-weight:bold; font-size:14px;">${calc.final}</td>
                            <td style="white-space:nowrap;">
                                <div style="display:flex; justify-content:center; gap:2px;">
                                    <button class="t20-btn-icon" style="background:#d32f2f;" data-act="dano" data-tgt="${target.id}" data-val="${calc.final}" data-typ="${tipoDano}" title="${labelFull}">💀</button>
                                    <button class="t20-btn-icon" style="background:#ef5350;" data-act="dano" data-tgt="${target.id}" data-val="${Math.floor(calc.final/2)}" data-typ="${tipoDano}" title="${labelHalf}">🛡️</button>
                                    <div style="width:1px; background:#ccc; margin:0 2px;"></div>
                                    <button class="t20-btn-icon" style="background:#388e3c;" data-act="cura" data-tgt="${target.id}" data-val="${calc.final}" data-typ="${tipoDano}" title="Reverter/Curar Total">💚</button>
                                    <button class="t20-btn-icon" style="background:#81c784;" data-act="cura" data-tgt="${target.id}" data-val="${Math.floor(calc.final/2)}" data-typ="${tipoDano}" title="Curar Metade">🩹</button>
                                </div>
                            </td>
                        </tr>`;
                    }
                    html += `</tbody></table>`;
                }
            }
        }

        html += `</div>`;

        ChatMessage.create({
            content: html,
            whisper: ChatMessage.getWhisperRecipients("GM"),
            speaker: { alias: "🤖 T20 Auto" },
            flags: { [this.ID]: { [this.FLAG_IGNORE]: true } }
        });
    }

    // --- Sistema de Undo (Desfazer) ---

    static registrarSnapshot(actor, pathVal, pathTemp, oldVal, oldTemp) {
        if (!actor) return;
        window.t20CalcState.undoStack.push({
            uuid: actor.uuid,
            name: actor.name,
            pathVal, pathTemp, val: oldVal, temp: oldTemp,
            time: Date.now()
        });
        if (window.t20CalcState.undoStack.length > 20) window.t20CalcState.undoStack.shift();
        this.renderizarIndicador();
    }

    static async desfazerUltimaAcao() {
        const action = window.t20CalcState.undoStack.pop();
        if (!action) return ui.notifications.warn("Nada para desfazer.");

        const actor = await fromUuid(action.uuid);
        if (actor) {
            await actor.update({ [action.pathVal]: action.val, [action.pathTemp]: action.temp });
            if (canvas.interface?.createScrollingText && actor.token?.object) {
                canvas.interface.createScrollingText(actor.token.object.center, "↩️ Undo", {
                    fill: "#FFFFFF", stroke: 0x000000, strokeThickness: 4, anchor: CONST.TEXT_ANCHOR_POINTS.TOP
                });
            }
            ui.notifications.info(`Revertida alteração em ${action.name}`);
        }
        this.renderizarIndicador();
    }

    // --- Helpers de Cálculo (ATUALIZADO) ---

    static identificarTipo(roll) {
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const txt = normalize((roll.options?.flavor || '') + ' ' + (roll.formula || ''));
        const tipos = ['corte', 'perfuracao', 'impacto', 'fogo', 'frio', 'eletricidade', 'acido', 'trevas', 'luz', 'essencia', 'mental', 'veneno', 'cura', 'sangramento', 'perda', 'vida'];
        for (const t of tipos) if (txt.includes(t)) return t.replace('vida', 'perda');
        if (roll.terms) {
            for (const term of roll.terms) {
                const f = normalize(term.options?.flavor || '');
                for (const t of tipos) if (f.includes(t)) return t.replace('vida', 'perda');
            }
        }
        return 'fisico';
    }

    static getEmoji(tipo) {
        const map = { fogo: '🔥', frio: '❄️', eletricidade: '⚡', acido: '🧪', trevas: '🌑', luz: '☀️', cura: '💖', mental: '🧠', veneno: '🤢', corte: '⚔️', perfuracao: '🏹', impacto: '🔨', perda: '🩸' };
        return map[tipo] || '💥';
    }

    static calcular(dano, tipo, actor) {
        if (tipo === 'cura') return { final: dano, log: '' };
        
        const res = actor.system.tracos?.resistencias || actor.system.attributes?.resistencias || {};
        const getVal = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

        let valor = Number(dano);
        let logs = [];

        // Imunidade
        if (res[tipo]?.imunidade || res['dano']?.imunidade) return { final: 0, log: 'Imune' };

        // Vulnerabilidade (+50%)
        if (res[tipo]?.vulnerabilidade) {
            const extra = Math.floor(valor * 0.5);
            valor += extra;
            logs.push(`Vuln(+${extra})`);
        }

        let rd = 0;

        // 1. RD Genérica (Aplica a TUDO, exceto Perda)
        if (tipo !== 'perda') {
            rd += getVal(res['dano']?.value);
        }

        // 2. RD Específica (Aplica ao tipo específico)
        if (tipo !== 'dano') {
            rd += getVal(res[tipo]?.value);
        }

        // 3. Mecânica de Exceção (RD Total exceto X)
        // Percorre todas as resistências procurando pelo campo .excecao
        // Se encontrar, soma esse valor à RD se o dano ATUAL não for o da exceção
        for (const [key, data] of Object.entries(res)) {
            const valExcecao = getVal(data.excecao);
            if (valExcecao > 0) {
                // Se o tipo do dano NÃO for igual à chave da exceção, a RD se aplica
                if (key !== tipo) {
                    rd += valExcecao;
                }
            }
        }

        if (rd > 0) {
            valor = Math.max(0, valor - rd);
            logs.push(`RD(-${rd})`);
        }

        return { final: valor, log: logs.join(' ') };
    }

    // --- Aplicação ---

    static async onBotaoClique(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        const btn = ev.currentTarget;
        if (btn.disabled || btn.dataset.processing === "true") return;

        const { tgt, val, typ, act } = btn.dataset;
        const token = canvas.tokens.get(tgt);
        
        if (!token) return ui.notifications.warn("Token não encontrado.");
        
        btn.disabled = true;
        btn.dataset.processing = "true";
        const iconOriginal = btn.innerHTML;
        btn.innerHTML = '⏳';

        try {
            await this.modificarAtributos(token, token.actor, parseInt(val), typ, act);
            btn.innerHTML = '🆗';
        } catch (e) {
            btn.innerHTML = '❌';
            console.error(e);
        }
        
        setTimeout(() => {
            btn.innerHTML = iconOriginal;
            btn.disabled = false;
            btn.dataset.processing = "false";
        }, 1000);
    }

    static async modificarAtributos(token, actor, valor, tipo, acao) {
        if (!actor || valor === 0) return;
        
        const isMana = tipo.includes('pm') || tipo.includes('mana');
        const attr = isMana ? 'pm' : 'pv';
        const pathVal = `system.attributes.${attr}.value`;
        const pathTemp = `system.attributes.${attr}.temp`;

        const atual = foundry.utils.getProperty(actor, pathVal);
        const max = foundry.utils.getProperty(actor, `system.attributes.${attr}.max`);
        const temp = foundry.utils.getProperty(actor, pathTemp) || 0;

        this.registrarSnapshot(actor, pathVal, pathTemp, atual, temp);

        let novoAtual = atual, novoTemp = temp;
        let floatTxt = "", floatColor = "";

        if (tipo === 'cura' || acao === 'cura') {
            novoAtual = Math.min(max, atual + valor);
            floatTxt = `+${valor}`;
            floatColor = "#00ff00";
        } else {
            let resto = valor;
            if (temp > 0) {
                if (resto >= temp) { resto -= temp; novoTemp = 0; }
                else { novoTemp -= resto; resto = 0; }
            }
            novoAtual = Math.max(0, atual - resto);
            floatTxt = `-${valor}`;
            floatColor = "#ff0000";
        }

        await actor.update({ [pathVal]: novoAtual, [pathTemp]: novoTemp });

        if (canvas.interface?.createScrollingText) {
            canvas.interface.createScrollingText(token.center, floatTxt, {
                fill: floatColor, stroke: 0x000000, strokeThickness: 4, jitter: 0.25,
                anchor: (tipo === 'cura' || acao === 'cura') ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM
            });
        }
    }
}

T20CalculadoraUltimate.init();
