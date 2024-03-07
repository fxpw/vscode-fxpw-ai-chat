const vscode = require('vscode');


class ExtensionSettings {
	static get config() {
		return vscode.workspace.getConfiguration('vscode-fxpw-ai-chat');
	}

	static get PROXY_IP() {
		return this.config.get('proxyIP');
	};

	static get PROXY_PORT_HTTPS() {
		return this.config.get('proxyPortHttps');
	};

	static get PROXY_LOGIN() {
		return this.config.get('proxyLogin');
	};

	static get PROXY_PASSWORD() {
		return this.config.get('proxyPassword');
	};

	static get OPENAI_KEY() {
		return this.config.get('openAIKey');
	};

	static get PROXY_URL() {
		if (ExtensionSettings.PROXY_LOGIN && ExtensionSettings.PROXY_PASSWORD && ExtensionSettings.PROXY_IP && ExtensionSettings.PROXY_PORT_HTTPS ){
			return `http://${ExtensionSettings.PROXY_LOGIN}:${ExtensionSettings.PROXY_PASSWORD}@${ExtensionSettings.PROXY_IP}:${ExtensionSettings.PROXY_PORT_HTTPS}`;
		}
	};

	static Init(){
		
	}

	static UpdateSettingsHandler() {
		// if (
		// 	PROXY_IP != config.get('proxyIP') ||
		// 	PROXY_PORT_HTTPS != config.get('proxyPortHttps') ||
		// 	PROXY_LOGIN != config.get('proxyLogin') ||
		// 	PROXY_PASSWORD != config.get('proxyPassword')
		// ){
		// 	PROXY_IP = config.get('proxyIP');
		// 	PROXY_PORT_HTTPS = config.get('proxyPortHttps');
		// 	PROXY_LOGIN = config.get('proxyLogin');
		// 	PROXY_PASSWORD = config.get('proxyPassword');
		// 	proxyUrl = `http://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_IP}:${PROXY_PORT_HTTPS}`;
		// 	agent.proxy=proxyUrl
		// }
		// if (OPENAI_KEY != config.get('openAIKey')){
		// 	OPENAI_KEY = config.get('openAIKey');
		// 	openai.apiKey = OPENAI_KEY
		// }
	}
} 

module.exports = { ExtensionSettings };