// const vscode = require('vscode');


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

class ExtensionData {
	static #currentChatID = 0;
	static #lastChatID = 0;
	static #chatsData = [];
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
		return this.#lastChatID;
	};

	static set lastChatID(new_param) {
		this.#lastChatID = new_param
	};

	static get chatsData() {
		return this.#chatsData;
	};

	static getChatsCount() {
        return this.#chatsData.length;
    }

	static async createNewChat(){
		let maxChats = ExtensionData.getChatsCount()
		// console.log(maxChats,39);
		let currentDate = new Date();
		let timestamp = currentDate.getTime();
		//create
		let new_chat = {};
		new_chat.conversation = [];
		new_chat.name = generateRandomString(150);
		new_chat.createAt = timestamp;
		new_chat.id = maxChats+1;
		new_chat.lastUpdate = timestamp;
		new_chat.needRenameOnRequest = true; // when be first request that change to false and upgrade name

		this.#chatsData.push(new_chat);

		await ExtensionData.saveChatsData();
	}

	static async saveChatsData() {
		await this.#context.globalState.update('chatsData', this.#chatsData);
	};

	static async addDataToCurrentChat(data){
		let currentChatData = await ExtensionData.GetCurrentChatData();
		currentChatData.conversation.push(data);
		let currentDate = new Date();
		let timestamp = currentDate.getTime();
		currentChatData.lastUpdate = timestamp;
		await ExtensionData.saveChatsData();
	}

	static async getCurrentChatData(){
		return this.#chatsData[this.#currentChatID]
	}

	
	/**
	 * @static
	 * @async
	 * @param {vscode.ExtensionContext} context
	 */
	static async Init(context) {
		this.#context = context;
		this.#chatsData = []
		// this.#chatsData = this.#context.globalState.get('chatsData', []);
		this.#currentChatID = this.#context.globalState.get('lastChatID', 0);
		this.#lastChatID = this.#context.globalState.get('lastChatID', 0);
	};

}

module.exports = { ExtensionData }