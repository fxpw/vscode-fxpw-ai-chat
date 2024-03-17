const vscode = require('vscode');

class ExtensionSettings {
	static get config() {
		return vscode.workspace.getConfiguration('vscode-fxpw-ai-chat');
	}

	static get PROXY_IP() {
		return ExtensionSettings.config.get('proxyIP');
	};

	static get PROXY_PORT_HTTPS() {
		return ExtensionSettings.config.get('proxyPortHttps');
	};

	static get PROXY_LOGIN() {
		return ExtensionSettings.config.get('proxyLogin');
	};

	static get PROXY_PASSWORD() {
		return ExtensionSettings.config.get('proxyPassword');
	};

	static get OPENAI_KEY() {
		return ExtensionSettings.config.get('openAIKey');
	};

	static get OPENAI_MODEL() {
		return ExtensionSettings.config.get('openAIModel');
	};

	static get PROXY_URL() {
		if (ExtensionSettings.PROXY_LOGIN && ExtensionSettings.PROXY_PASSWORD && ExtensionSettings.PROXY_IP && ExtensionSettings.PROXY_PORT_HTTPS ){
			return `http://${ExtensionSettings.PROXY_LOGIN}:${ExtensionSettings.PROXY_PASSWORD}@${ExtensionSettings.PROXY_IP}:${ExtensionSettings.PROXY_PORT_HTTPS}`;
		}
	};

	static UpdateSettingsHandler() {
		try {
			
		} catch (error) {
			console.error(error);
		}
	}
	// eslint-disable-next-line no-unused-vars
	static Init(context){
		vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration('vscode-fxpw-ai-chat')) {
				ExtensionSettings.UpdateSettingsHandler();
			}
		});
	}
} 

module.exports = { ExtensionSettings };