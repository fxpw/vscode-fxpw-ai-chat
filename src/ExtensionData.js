// const vscode = require('vscode');

class ExtensionData {
	static #currentChatID = 0;
	static #lastChatID = 0;
	static #chatsData = {};
	static #context = null;

	static get currentChatID() {
		return this.#currentChatID;
	}

	static set currentChatID(newParam) {
		if (typeof newParam === 'number') {
			this.#currentChatID = newParam;
		} else {
			console.error('newParam must be a number');
		}
	}

	static get lastChatID() {
		return ExtensionData.#lastChatID;
	};

	static set lastChatID(new_param) {
		ExtensionData.#lastChatID = new_param
	};

	static get chatsData() {
		return ExtensionData.#chatsData;
	};

	static async SaveChatsData(new_param) {
		ExtensionData.#chatsData = new_param
		await this.#context.globalState.update('chatsData', ExtensionData.#chatsData);
	};

	
	/**
	 * @static
	 * @async
	 * @param {vscode.ExtensionContext} context
	 */
	static async Init(context) {
		this.#context = context;
		this.#chatsData = this.#context.globalState.get('chatsData', {});
		this.#currentChatID = this.#context.globalState.get('lastChatID', 0);
		this.#lastChatID = this.#context.globalState.get('lastChatID', 0);
	};

}

module.exports = { ExtensionData }