import * as vscode from 'vscode';

class ExtensionSettings {
	// Получить конфигурационные настройки расширения
	static get config(): vscode.WorkspaceConfiguration {
		return vscode.workspace.getConfiguration('vscode-fxpw-ai-chat');
	}

	// Получить значения отдельных настроек
	static get PROXY_IP(): string {
		return this.config.get<string>('proxyIP') ?? "";
	}

	static get PROXY_PORT_HTTPS(): number {
		return this.config.get<number>('proxyPortHttps') ?? 0;
	}

	static get PROXY_LOGIN(): string {
		return this.config.get<string>('proxyLogin') ?? "";
	}

	static get PROXY_PASSWORD(): string {
		return this.config.get<string>('proxyPassword') ?? "";
	}

	static get OPENAI_KEY(): string {
		return this.config.get<string>('openAIKey') ?? "";
	}

	static get OPENAI_MODEL(): string {
		return this.config.get<string>('openAIModel') ?? "";
	}

	// Формирование URL-адреса прокси
	static get PROXY_URL(): string | undefined {
		if (this.PROXY_LOGIN!="" && this.PROXY_PASSWORD!="" && this.PROXY_IP!="" && this.PROXY_PORT_HTTPS!=0) {
			return `http://${this.PROXY_LOGIN}:${this.PROXY_PASSWORD}@${this.PROXY_IP}:${this.PROXY_PORT_HTTPS}`;
		}else if (this.PROXY_IP && this.PROXY_PORT_HTTPS){
			return `http://${this.PROXY_IP}:${this.PROXY_PORT_HTTPS}`;
		}
		return undefined;
	}

	static UpdateSettingsHandler(): void {
		try {
			// console.log("fxpw-ai-chat UpdateSettingsHandler");
		} catch (error) {
			console.error(error);
		}
	}

	// Инициализация класса с подпиской на изменения конфигурации
	static Init(context: vscode.ExtensionContext): void {
		vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration('vscode-fxpw-ai-chat')) {
				this.UpdateSettingsHandler();
			}
		});
	}
}

export { ExtensionSettings };
