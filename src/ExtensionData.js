
class ExtensionData {
	static #chatsData = [];
	static #context = null;

	static get currentChatID() {
		return this.#context.globalState.get('currentChatID', -1);
	}

	static async setCurrentChatID(newParam) {
		await this.#context.globalState.update('currentChatID', newParam);
	}

	static get iteratorForChatID() {
		return this.#context.globalState.get('iteratorForChatID', 0);
	}

	static async addIteratorForChatID() {
		let lastIterator = this.iteratorForChatID;
		lastIterator++;
		await this.#context.globalState.update('iteratorForChatID', lastIterator);
	}

	static get chatsData() {
		return this.#chatsData;
	};

	static async saveChatsData() {
		await this.#context.globalState.update('chatsData', this.#chatsData);
	};

	static async createNewChat(model){
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

		this.#chatsData.push(new_chat);
		await this.addIteratorForChatID();
		await this.saveChatsData();
	}

	static async addDataToCurrentChat(data){
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
	}

	static async deleteChatDataByID(chatID){
		this.#chatsData.forEach((element, index) => {
			if (element.id === chatID) {
				this.#chatsData = this.#chatsData.filter((_, i) => i !== index);
			}
		});
		await this.setCurrentChatID(-1);
		await this.saveChatsData();
	}

	static async getCurrentChatData(){
		let dataToReturn = [];
		this.#chatsData.forEach((element, index) => {
			if (element.id === this.currentChatID) {
				dataToReturn = this.#chatsData.filter((_, i) => i === index);
			}
		});
		return dataToReturn[0];
	}

	static async getChatDataByID(chatID){
		let dataToReturn = [];
		this.#chatsData.forEach((element, index) => {
			if (element.id === chatID) {
				dataToReturn = this.#chatsData.filter((_, i) => i === index);
			}
		});
		return dataToReturn[0];
	}

	/**
	 * @static
	 * @async
	 * @param {vscode.ExtensionContext} context
	 */
	static async Init(context) {
		this.#context = context;
		this.#chatsData = this.#context.globalState.get('chatsData', []);
		// this.#chatsData = []
	};

}

module.exports = { ExtensionData }