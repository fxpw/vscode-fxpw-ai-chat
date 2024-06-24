"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionSettings = void 0;
const vscode = require("vscode");
class ExtensionSettings {
    // Получить конфигурационные настройки расширения
    static get config() {
        return vscode.workspace.getConfiguration('vscode-fxpw-ai-chat');
    }
    // Получить значения отдельных настроек
    static get PROXY_IP() {
        return this.config.get('proxyIP') ?? "";
    }
    static get PROXY_PORT_HTTPS() {
        return this.config.get('proxyPortHttps') ?? 0;
    }
    static get PROXY_LOGIN() {
        return this.config.get('proxyLogin') ?? "";
    }
    static get PROXY_PASSWORD() {
        return this.config.get('proxyPassword') ?? "";
    }
    static get OPENAI_KEY() {
        return this.config.get('openAIKey') ?? "";
    }
    static get OPENAI_MODEL() {
        return this.config.get('openAIModel') ?? "";
    }
    // Формирование URL-адреса прокси
    static get PROXY_URL() {
        if (this.PROXY_LOGIN != "" && this.PROXY_PASSWORD != "" && this.PROXY_IP != "" && this.PROXY_PORT_HTTPS != 0) {
            return `http://${this.PROXY_LOGIN}:${this.PROXY_PASSWORD}@${this.PROXY_IP}:${this.PROXY_PORT_HTTPS}`;
        }
        else if (this.PROXY_IP && this.PROXY_PORT_HTTPS) {
            return `http://${this.PROXY_IP}:${this.PROXY_PORT_HTTPS}`;
        }
        return undefined;
    }
    static UpdateSettingsHandler() {
        try {
            // console.log("fxpw-ai-chat UpdateSettingsHandler");
        }
        catch (error) {
            console.error(error);
        }
    }
    // Инициализация класса с подпиской на изменения конфигурации
    static Init(context) {
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('vscode-fxpw-ai-chat')) {
                this.UpdateSettingsHandler();
            }
        });
    }
}
exports.ExtensionSettings = ExtensionSettings;
//# sourceMappingURL=ExtensionSettings.js.map