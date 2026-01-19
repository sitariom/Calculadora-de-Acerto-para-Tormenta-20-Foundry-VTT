/**
 * 🤖 Calculadora de Acerto e Dano T20 - Versão Ultimate (v3.7 - Universal Detection)
 * Compatibilidade: Tormenta 20 (JdA) - Foundry V13
 * * UPDATE v3.7: Detecção universal de ataques (d20) para corrigir armas sem flag explícita.
 */

class T20CalculadoraUltimate {
    static ID = 't20-calc-ultimate';
    static FLAG_IGNORE = 'ignore-calc';
    
    static LABELS = {
        TITLE: "🛡️ T20 Calc",
        ATK: "Ataque",
        DMG: "Dano",
        CRIT: "CRÍTICO!",
        FUMBLE: "FALHA!",
        HIT: "ACERTOU",
        MISS: "ERROU",
        MANEUVER: "MANOBRA",
        SAVE: "CD",
        BTN_FULL: "Dano Total",
        BTN_HALF: "Metade",
        BTN_HEAL: "Curar Total",
        BTN_HEAL_HALF: "Curar Metade",
        BTN_UNDO: "Desfazer",
        BTN_CFG: "Configurações",
        BTN_MIN: "Minimizar",
        MSG_NO_TARGET: "⚠️ Sem alvo selecionado.",
        LOG_IMMUNE: "Imune",
        LOG_VULN: "Vuln",
        LOG_RD: "RD"
    };

    static init() {
        if (typeof window.t20CalcState === 'undefined') {
            window.t20CalcState = {
                ativo: false,
                autoAplicar: false,
                minimizado: false,
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
            ui.notifications.info("Calculadora T20 v3.7: Detecção Universal Ativa.");
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

    static toggleMinimizado() {
        window.t20CalcState.minimizado = !window.t20CalcState.minimizado;
        this.renderizarIndicador();
    }

    // --- Interface Gráfica (UI & CSS) ---

    static injetarEstilos() {
        const styleId = 't20-calc-css-v3';
        if (document.getElementById(styleId)) return;

        const css = `
            /* Widget Flutuante */
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
            #${this.ID}.minimized {
                padding: 4px; width: 32px; height: 32px;
                justify-content: center; border-radius: 50%; overflow: hidden;
            }
            #${this.ID}.minimized .t20-controls { display: none; }
            
            /* Chat Message Styling */
            .t20-calc-msg { font-size: 13px; background: #f8f9fa; border-left: 5px solid #1b263b; padding: 6px; color: #333; }
            
            .t20-calc-header { 
                font-weight: bold; color: #0d1b2a; border-bottom: 2px solid #1b263b; 
                margin-bottom: 8px; padding-bottom: 4px; 
                display:flex; justify-content:space-between; align-items: center; 
            }

            /* Seção de Ataque (LISTA EXPLÍCITA) */
            .t20-attack-section {
                background: #fff; border: 1px solid #ccc; border-radius: 4px;
                padding: 0; margin-bottom: 8px; overflow: hidden;
            }
            .t20-attack-header {
                background: #e3f2fd; padding: 4px; font-weight: bold; border-bottom: 1px solid #ccc;
                color: #0d47a1; font-size: 13px;
            }
            .t20-attack-row {
                padding: 3px 5px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; font-size: 12px;
            }
            .t20-attack-row:last-child { border-bottom: none; }
            
            .t20-res-hit { color: #1b5e20; background: #e8f5e9; font-weight: bold; }
            .t20-res-miss { color: #b71c1c; background: #ffebee; opacity: 0.8; }

            .t20-calc-tag { font-size: 10px; padding: 1px 4px; border-radius: 4px; color: white; margin-left: 5px; text-transform: uppercase; font-weight: bold; }
            .tag-crit { background: #d4af37; box-shadow: 0 0 5px #d4af37; }
            .tag-fumble { background: #333; }
            .tag-save { background: #e65100; }

            /* Banner CD */
            .t20-save-banner {
                background: #fff3e0; border: 1px solid #ff9800; border-radius: 4px;
                color: #e65100; font-weight: bold; text-align: center;
                padding: 4px; margin-bottom: 8px; font-size: 12px;
            }

            /* TABELA DE DANO */
            .t20-dano-header { background: #e9ecef; padding: 4px; border-radius: 4px; margin-top: 8px; margin-bottom: 2px; font-weight: bold; border-left: 3px solid #6c757d; }
            .t20-table-wrap { overflow-x: auto; width: 100%; border: 1px solid #dee2e6; border-radius: 4px; background: #fff; }
            .t20-calc-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
            .t20-calc-table th { background: #415a77; color: #fff; padding: 4px; text-align: center; white-space: nowrap; }
            .t20-calc-table td { border-bottom: 1px solid #eee; padding: 4px 2px; text-align: center; vertical-align: middle; }
            
            .t20-col-name { width: 40%; text-align: left; }
            .t20-col-val { width: 15%; }
            .t20-col-act { width: 45%; min-width: 110px; }
            .t20-truncate { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

            /* Botões */
            .t20-btn-icon {
                border: none; border-radius: 4px; color: white; cursor: pointer;
                padding: 0; margin: 0 1px; width: 24px; height: 24px;
                transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;
            }
            .t20-btn-icon:hover { filter: brightness(1.2); transform: translateY(-1px); }
            
            .t20-ui-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 14px; color: #fff; }
            .t20-ui-btn:hover { background: rgba(255,255,255,0.2); }
            .t20-ui-btn.active { background: #2e7d32; border-color: #4caf50; }
            .t20-undo-btn { background: #c62828; }
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
        const minimizado = window.t20CalcState.minimizado;

        if (minimizado) {
            el.className = 'minimized';
            el.innerHTML = `<span style="cursor:pointer; font-size:16px;" title="Maximizar">🛡️</span>`;
            el.onclick = (e) => { if (e.target.tagName === 'SPAN') this.toggleMinimizado(); };
        } else {
            el.className = '';
            el.onclick = null;
            el.innerHTML = `
                <div class="t20-drag-handle" style="cursor:move; font-weight:bold; display:flex; align-items:center; gap:5px;">
                    <span title="${this.LABELS.TITLE}">🛡️ T20</span>
                </div>
                <div class="t20-controls" style="display:flex; align-items:center; gap:5px;">
                    <div style="height:20px; width:1px; background:#415a77; margin:0 5px;"></div>
                    <button id="t20-btn-config" class="t20-ui-btn ${autoAtivo ? 'active' : ''}" title="${this.LABELS.BTN_CFG}">⚙️</button>
                    <button id="t20-btn-undo" class="t20-ui-btn t20-undo-btn" title="${this.LABELS.BTN_UNDO} (${undoCount})" ${undoCount === 0 ? 'disabled' : ''}>↩️</button>
                    <button id="t20-btn-min" class="t20-ui-btn" title="${this.LABELS.BTN_MIN}" style="padding: 4px 6px;">_</button>
                </div>
            `;

            document.getElementById('t20-btn-config').onclick = () => this.abrirConfiguracoes();
            document.getElementById('t20-btn-undo').onclick = () => this.desfazerUltimaAcao();
            document.getElementById('t20-btn-min').onclick = () => this.toggleMinimizado();
        }
    }

    static abrirConfiguracoes() {
        new Dialog({
            title: this.LABELS.BTN_CFG,
            content: `
                <div style="padding: 10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <label style="font-weight:bold;">Auto-Aplicar Dano</label>
                        <input type="checkbox" id="t20-cfg-auto" ${window.t20CalcState.autoAplicar ? 'checked' : ''}>
                    </div>
                    <p style="font-size: 11px; color: #666;">Aplica dano automaticamente em acertos (Exceto CD).</p>
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

    static DataHelper = class {
        static getResistencias(actor) {
            return actor.system.tracos?.resistencias || actor.system.attributes?.resistencias || {};
        }

        static getDefesa(actor) {
            return foundry.utils.getProperty(actor, "system.attributes.defesa.value") || 10;
        }

        static getAtributosVida(actor) {
            return {
                atual: foundry.utils.getProperty(actor, "system.attributes.pv.value"),
                max: foundry.utils.getProperty(actor, "system.attributes.pv.max"),
                temp: foundry.utils.getProperty(actor, "system.attributes.pv.temp") || 0
            };
        }

        static getEfeitosRelevantes(actor) {
            const effects = actor.effects.filter(e => !e.disabled);
            const getName = (e) => (e.label || e.name || "").toLowerCase();
            return {
                vulneravel: effects.some(e => getName(e).includes('vulnerável')),
                imune: effects.some(e => getName(e).includes('imune')),
                resistencia: effects.some(e => getName(e).includes('resistência'))
            };
        }
    };

    static async processarMensagem(message) {
        const actor = game.actors.get(message.speaker.actor);
        if (!actor) return;

        let userAuthor;
        if (message.author instanceof User) userAuthor = message.author;
        else userAuthor = game.users.get(message.author);

        const targets = userAuthor ? Array.from(userAuthor.targets) : [];
        const content = message.content.toLowerCase();
        const flavor = (message.flavor || '').toLowerCase();
        const itemOrigem = message.item;
        
        const regexCD = /(fortitude|reflexos|vontade).*?cd\s*(\d+)/i;
        const matchCD = content.match(regexCD) || flavor.match(regexCD);
        const isTesteCD = !!matchCD;
        const tipoTeste = matchCD ? matchCD[1] : '';
        const valorCD = matchCD ? matchCD[2] : '';

        let rollsAtaque = [];
        let rollsDano = [];

        // 1. CLASSIFICAÇÃO UNIVERSAL (CORREÇÃO DE BUG)
        if (message.rolls && message.rolls.length > 0) {
            message.rolls.forEach(roll => {
                const f = (roll.options?.flavor || '').toLowerCase();
                const isD20 = roll.terms.some(t => t.faces === 20);
                
                // Evita classificar Percepção/Iniciativa como ataque
                const isSkill = f.includes('iniciativa') || f.includes('percepção') || f.includes('vontade') || f.includes('reflexos') || f.includes('fortitude');
                const isDamageLabel = f.includes('dano');

                // Lógica Universal: Se é d20 e NÃO é dano/skill, assume Ataque.
                // Se NÃO é d20, ou se diz "dano", assume Dano.
                if (isD20 && !isDamageLabel && !isSkill) {
                    rollsAtaque.push(roll);
                } else {
                    rollsDano.push(roll);
                }
            });
        }

        if (rollsAtaque.length === 0 && rollsDano.length === 0 && !isTesteCD) return;

        // --- HTML Header ---
        let html = `<div class="t20-calc-msg">`;
        html += `<div class="t20-calc-header"><span>⚔️ ${actor.name}</span></div>`;

        if (targets.length === 0 && (rollsAtaque.length > 0 || rollsDano.length > 0)) {
            html += `<div style="color: #c62828; font-size: 11px; margin-bottom: 5px;">${this.LABELS.MSG_NO_TARGET}</div>`;
        }

        if (isTesteCD) {
            html += `<div class="t20-save-banner">⚠️ TESTE DE ${tipoTeste.toUpperCase()} (CD ${valorCD})</div>`;
        }

        const alvosAcertados = new Set(); 

        // --- Seção de Análise de Ataque (LISTA EXPLÍCITA) ---
        if (rollsAtaque.length > 0) {
            html += `<div class="t20-attack-section">`;
            
            rollsAtaque.forEach((roll, index) => {
                const totalAtaque = roll.total;
                let isCrit = false, isFumble = false;
                
                const diceTerm = roll.terms.find(t => t.faces === 20);
                if (diceTerm) {
                    const result = diceTerm.results.find(r => r.active)?.result;
                    if (result === 20) isCrit = true;
                    if (result === 1) isFumble = true;
                }

                // Título do Bloco de Ataque
                const labelAtaque = rollsAtaque.length > 1 ? `Ataque #${index+1}` : "Rolagem de Ataque";
                let badgeExtra = "";
                if (isCrit) badgeExtra = `<span class="t20-calc-tag tag-crit">CRÍTICO</span>`;
                if (isFumble) badgeExtra = `<span class="t20-calc-tag tag-fumble">FALHA</span>`;

                html += `<div class="t20-attack-header">${labelAtaque} (${totalAtaque}) ${badgeExtra}</div>`;

                // Lista de Comparação por Alvo
                if (targets.length > 0) {
                    targets.forEach(target => {
                        const defesa = this.DataHelper.getDefesa(target.actor);
                        let acertou = totalAtaque >= defesa;
                        if (isCrit) acertou = true;
                        if (isFumble) acertou = false;

                        if (acertou) alvosAcertados.add(target.id);

                        const cssClass = acertou ? 't20-res-hit' : 't20-res-miss';
                        const textResult = acertou ? "ACERTOU" : "ERROU";
                        const nomeCurto = target.name.length > 15 ? target.name.substring(0,14)+'...' : target.name;

                        // FORMATO PEDIDO: Alvo (Def X) vs Ataque Y -> Resultado
                        html += `<div class="t20-attack-row ${cssClass}">
                            <span>${nomeCurto} (Def ${defesa}) vs ${totalAtaque}</span>
                            <strong>➔ ${textResult}</strong>
                        </div>`;
                    });
                } else {
                    html += `<div style="padding:4px; font-size:11px; font-style:italic; color:#666;">Sem alvos.</div>`;
                }
            });
            html += `</div>`; // fim section
        }

        // --- Seção de Dano ---
        if (rollsDano.length > 0) {
            for (const roll of rollsDano) {
                const danoTotal = roll.total;
                const tipoDano = this.identificarTipo(roll, itemOrigem);
                const emoji = this.getEmoji(tipoDano);

                html += `<div class="t20-dano-header">
                    ${emoji} ${this.LABELS.DMG} (${tipoDano}): ${danoTotal}
                </div>`;

                if (targets.length > 0) {
                    html += `<div class="t20-table-wrap">
                        <table class="t20-calc-table">
                        <thead><tr>
                            <th class="t20-col-name">Alvo</th>
                            <th class="t20-col-val">Final</th>
                            <th class="t20-col-act">Ação</th>
                        </tr></thead>
                        <tbody>`;
                    
                    for (const target of targets) {
                        const calc = this.calcular(danoTotal, tipoDano, target.actor);
                        
                        const houveAtaqueNaMsg = rollsAtaque.length > 0;
                        const alvoFoiAtingido = alvosAcertados.has(target.id);
                        let deveAplicarAuto = window.t20CalcState.autoAplicar;

                        if (isTesteCD || (houveAtaqueNaMsg && !alvoFoiAtingido)) {
                            deveAplicarAuto = false;
                        }

                        if (deveAplicarAuto && calc.final > 0) {
                            this.modificarAtributos(canvas.tokens.get(target.id), target.actor, calc.final, tipoDano, 'dano');
                        }

                        const autoStatus = deveAplicarAuto ? (calc.final > 0 ? '⚡' : '🚫') : '';
                        const pvInfo = this.DataHelper.getAtributosVida(target.actor);
                        const tooltipFull = `${this.LABELS.BTN_FULL} (PV: ${pvInfo.atual} -> ${Math.max(0, pvInfo.atual - calc.final)})`;
                        
                        html += `<tr>
                            <td class="t20-col-name" style="text-align:left;">
                                <span class="t20-truncate" title="${target.name}">${target.name}</span>
                                <div style="font-size:9px; color:#666; white-space:normal; line-height:1;">${calc.log}</div>
                                <div style="font-size:9px; color:#2e7d32; font-weight:bold;">${autoStatus}</div>
                            </td>
                            <td class="t20-col-val" style="font-weight:bold; font-size:14px;">${calc.final}</td>
                            <td class="t20-col-act">
                                <div style="display:flex; justify-content:center; gap:2px;">
                                    <button class="t20-btn-icon" style="background:#d32f2f;" data-act="dano" data-tgt="${target.id}" data-val="${calc.final}" data-typ="${tipoDano}" title="${tooltipFull}">💀</button>
                                    <button class="t20-btn-icon" style="background:#ef5350;" data-act="dano" data-tgt="${target.id}" data-val="${Math.floor(calc.final/2)}" data-typ="${tipoDano}" title="${this.LABELS.BTN_HALF}">🛡️</button>
                                    <div style="width:1px; background:#ccc; margin:0 2px;"></div>
                                    <button class="t20-btn-icon" style="background:#388e3c;" data-act="cura" data-tgt="${target.id}" data-val="${calc.final}" data-typ="${tipoDano}" title="${this.LABELS.BTN_HEAL}">💚</button>
                                    <button class="t20-btn-icon" style="background:#81c784;" data-act="cura" data-tgt="${target.id}" data-val="${Math.floor(calc.final/2)}" data-typ="${tipoDano}" title="${this.LABELS.BTN_HEAL_HALF}">🩹</button>
                                </div>
                            </td>
                        </tr>`;
                    }
                    html += `</tbody></table></div>`;
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

    static identificarTipo(roll, item = null) {
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        if (item?.system?.tipoDano) {
            return normalize(item.system.tipoDano);
        }

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
        
        const res = this.DataHelper.getResistencias(actor);
        const efeitos = this.DataHelper.getEfeitosRelevantes(actor);
        const getVal = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

        let valor = Number(dano);
        let logs = [];

        if (res[tipo]?.imunidade || res['dano']?.imunidade || efeitos.imune) 
            return { final: 0, log: this.LABELS.LOG_IMMUNE };

        if (res[tipo]?.vulnerabilidade || efeitos.vulneravel) {
            const extra = Math.floor(valor * 0.5);
            valor += extra;
            logs.push(`${this.LABELS.LOG_VULN}(+${extra})`);
        }

        let rd = 0;

        if (tipo !== 'perda') rd += getVal(res['dano']?.value);
        if (tipo !== 'dano') rd += getVal(res[tipo]?.value);

        for (const [key, data] of Object.entries(res)) {
            const valExcecao = getVal(data.excecao);
            if (valExcecao > 0 && key !== tipo) rd += valExcecao;
        }

        if (rd > 0) {
            valor = Math.max(0, valor - rd);
            logs.push(`${this.LABELS.LOG_RD}(-${rd})`);
        }

        return { final: valor, log: logs.join(' ') };
    }

    static async onBotaoClique(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        const btn = ev.currentTarget;
        if (btn.disabled || btn.dataset.processing === "true") return;

        const { tgt, val, typ, act } = btn.dataset;
        const token = canvas.tokens.get(tgt);
        
        if (!token) return ui.notifications.warn(this.LABELS.MSG_NO_TARGET);
        
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
            this.tocarEfeitoVisual(token, 'cura');
        } else {
            let resto = valor;
            if (temp > 0) {
                if (resto >= temp) { resto -= temp; novoTemp = 0; }
                else { novoTemp -= resto; resto = 0; }
            }
            novoAtual = Math.max(0, atual - resto);
            floatTxt = `-${valor}`;
            floatColor = "#ff0000";
            this.tocarEfeitoVisual(token, 'dano', tipo);
        }

        await actor.update({ [pathVal]: novoAtual, [pathTemp]: novoTemp });

        if (canvas.interface?.createScrollingText) {
            canvas.interface.createScrollingText(token.center, floatTxt, {
                fill: floatColor, stroke: 0x000000, strokeThickness: 4, jitter: 0.25,
                anchor: (tipo === 'cura' || acao === 'cura') ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM
            });
        }
    }

    static tocarEfeitoVisual(token, modo, tipoDano = 'fisico') {
        const sequencerActive = game.modules.get('sequencer')?.active;
        if (!sequencerActive) return;
        
        let arquivo = "";
        
        if (modo === 'cura') {
            arquivo = "jb2a.healing.generic.loop.bluewhite";
        } else {
            switch (tipoDano) {
                case 'fogo': arquivo = "jb2a.flames.01.orange"; break;
                case 'frio': arquivo = "jb2a.ice_spikes.radial.burst.white"; break;
                case 'eletricidade': arquivo = "jb2a.static_electricity.01.blue"; break;
                case 'acido': arquivo = "jb2a.liquid.splash.green"; break;
                default: arquivo = "jb2a.liquid.splash.red"; break; 
            }
        }

        if (!Sequencer.Database.entryExists(arquivo)) {
            if (modo === 'cura') arquivo = "jb2a.healing.generic.loop.bluewhite";
            else arquivo = "jb2a.misty_step.01.grey"; 
            if (!Sequencer.Database.entryExists(arquivo)) return;
        }

        new Sequence()
            .effect().file(arquivo).atLocation(token).scale(0.5).play()
            .catch(e => { console.warn("T20Calc: Erro ao tocar animação (Ignorado)", e); });
    }

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
            ui.notifications.info(`Revertida alteração em ${action.name}`);
        }
        this.renderizarIndicador();
    }
}

T20CalculadoraUltimate.init();
