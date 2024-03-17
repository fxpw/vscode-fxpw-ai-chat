const { assert } = require("console");

class ExtensionData {
	static #chatsData = [];
	static #context = null;

	static get currentChatID() {
		return this.#context.globalState.get('currentChatID', -1);
	}

	static async setCurrentChatID(newParam) {
		try {
			await this.#context.globalState.update('currentChatID', newParam);
		} catch (error) {
			console.error(error);
		}
	}

	static get iteratorForChatID() {
		return this.#context.globalState.get('iteratorForChatID', 0);
	}

	static async addIteratorForChatID() {
		try {
			let lastIterator = this.iteratorForChatID;
			lastIterator++;
			await this.#context.globalState.update('iteratorForChatID', lastIterator);
			
		} catch (error) {
			console.error(error);
		}
	}

	static get chatsData() {
		return this.#chatsData;
	};

	static async saveChatsData() {
		try {
			await this.#context.globalState.update('chatsData', this.#chatsData);
		} catch (error) {
			console.error(error);
		}
	};

	static async createNewChat(model){
		try {
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			let new_chat = {};
			new_chat.conversation = [
			];
			new_chat.name = "click ME !";
			new_chat.createAt = timestamp;
			new_chat.id = this.iteratorForChatID;
			new_chat.lastUpdate = timestamp;
			new_chat.needRenameOnRequest = true;
			new_chat.model = model;
			new_chat.isBlocked=false;

			this.#chatsData.push(new_chat);
			await this.addIteratorForChatID();
			await this.saveChatsData();
			return new_chat.id;
		} catch (error) {
			console.error(error);
		}
	}

	static async addDataToCurrentChat(data){
		try {
			let currentChatData = await this.getCurrentChatData();
			if(currentChatData && currentChatData.needRenameOnRequest && data.role == "user" && data.content){
				currentChatData.needRenameOnRequest = false;
				currentChatData.name = data.content;
			}
			currentChatData.conversation.push(data);
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			currentChatData.lastUpdate = timestamp;
			await this.saveChatsData();
			
		} catch (error) {
			console.error(error);
		}
	}
	static async addDataToChatById(data,chatID){
		try {
			assert(chatID>=0,"chatID<0");
			let currentChatData = this.getChatDataByID(chatID);
			if(currentChatData && currentChatData.needRenameOnRequest && data.role == "user" && data.content){
				currentChatData.needRenameOnRequest = false;
				currentChatData.name = data.content;
			}
			currentChatData.conversation.push(data);
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			currentChatData.lastUpdate = timestamp;
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}

	static async deleteChatDataByID(chatID){
		try {
			assert(chatID>=0,"chatID<0");
			this.#chatsData.forEach((element, index) => {
				if (element.id === chatID ) {
					if(!element.isBlocked){
						this.#chatsData = this.#chatsData.filter((_, i) => i !== index);
					}
				};
			});
			await this.setCurrentChatID(-1);
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}

	static getCurrentChatData(){
		try {
			let dataToReturn = [];
			this.#chatsData.forEach((element, index) => {
				if (element.id === this.currentChatID) {
					dataToReturn = this.#chatsData.filter((_, i) => i === index);
				}
			});
			return dataToReturn[0];
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	static getChatDataByID(chatID){
		try {
			let dataToReturn = [];
			this.#chatsData.forEach((element, index) => {
				if (element.id === chatID) {
					dataToReturn = this.#chatsData.filter((_, i) => i === index);
				}
			});
			return dataToReturn[0];
		} catch (error) {
			console.error(error);
			return [];
		}
	}
	static async blockChatByID(chatID){
		this.#chatsData.forEach((element, index) => {
			if (element.id === chatID) {
				element.isBlocked = true;
			}
		});
		await this.saveChatsData();
	}
	static async unblockChatByID(chatID){
		this.#chatsData.forEach((element, index) => {
			if (element.id === chatID) {
				element.isBlocked = false;
			}
		});
		await this.saveChatsData();
	}

	static async deleteAllChatsData(){
		this.#chatsData = [];
		await this.saveChatsData();
	}

	/**
	 * @static
	 * @async
	 * @param {vscode.ExtensionContext} context
	 */
	static Init(context) {
		this.#context = context;
		this.#chatsData = this.#context.globalState.get('chatsData', []);
		// this.#chatsData = []
	};

}

module.exports = { ExtensionData }