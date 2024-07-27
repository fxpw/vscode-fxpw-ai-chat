import { ExtensionContext } from 'vscode';

interface ChatData {
	conversation: Array<{ role: string, content: string }>; // Примерная структура, уточните согласно вашим нуждам.
	name: string;
	createAt: number;
	id: number;
	lastUpdate: number;
	needRenameOnRequest: boolean;
	model: string;
	isBlocked: boolean;
	inputText:string;
}

class ExtensionData {
	public static chatsData: ChatData[] = [];
	private static context: ExtensionContext | null = null;

	static get currentChatID(): number {
		return this.context?.globalState.get('currentChatID', -1) ?? -1;
	}

	static async setCurrentChatID(newParam: number): Promise<void> {
		try {
			if (this.context) {
				await this.context.globalState.update('currentChatID', newParam);
			}
		} catch (error) {
			console.error(error);
		}
	}

	static get iteratorForChatID(): number {
		return this.context?.globalState.get('iteratorForChatID', 0) ?? 0;
	}

	static async addIteratorForChatID(): Promise<void> {
		try {
			let lastIterator = this.iteratorForChatID;
			lastIterator++;
			if (this.context) {
				await this.context.globalState.update('iteratorForChatID', lastIterator);
			}
		} catch (error) {
			console.error(error);
		}
	}

	static async saveChatsData(): Promise<void> {
		try {
			if (this.context) {
				await this.context.globalState.update('chatsData', this.chatsData);
			}
		} catch (error) {
			console.error(error);
		}
	}

	static async createNewChat(model: string): Promise<number> {
		try {
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			let new_chat: ChatData = {
				conversation: [],
				name: "click ME !",
				createAt: timestamp,
				id: this.iteratorForChatID,
				lastUpdate: timestamp,
				needRenameOnRequest: true,
				model: model,
				isBlocked: false,
				inputText:"",
			};

			this.chatsData.push(new_chat);
			await this.addIteratorForChatID();
			await this.saveChatsData();
			return new_chat.id;
		} catch (error) {
			console.error(error);
			return -1; // При возвращении ошибки, может быть необходимо обработать это по-другому
		}
	}
	static async addDataToCurrentChat(data: { role: string; content: string }): Promise<void> {
		try {
			let currentChatData = this.getCurrentChatData();
			if (currentChatData && currentChatData.needRenameOnRequest && data.role === 'user' && data.content) {
				currentChatData.needRenameOnRequest = false;
				currentChatData.name = data.content;
			}
			currentChatData?.conversation.push(data);
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			if (currentChatData) {
				currentChatData.lastUpdate = timestamp;
			}
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}

	static async addDataToChatById(data: { role: string; content: string }, chatID: number): Promise<void> {
		try {
			//   assert(chatID >= 0, 'chatID<0');
			let currentChatData = this.getChatDataByID(chatID);
			if (currentChatData && currentChatData.needRenameOnRequest && data.role === 'user' && data.content) {
				currentChatData.needRenameOnRequest = false;
				currentChatData.name = data.content;
			}
			currentChatData?.conversation.push(data);
			let currentDate = new Date();
			let timestamp = currentDate.getTime();
			if (currentChatData) {
				currentChatData.lastUpdate = timestamp;
			}
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}
	static async changeInputText(text:string, chatID: number): Promise<void> {
		try {
			//   assert(chatID >= 0, 'chatID<0');
			let currentChatData = this.getChatDataByID(chatID);
			if (currentChatData){
				currentChatData.inputText=text;
			}
			
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}

	static async deleteChatDataByID(chatID: number): Promise<void> {
		try {
			this.chatsData = this.chatsData.filter(chat => chat.id !== chatID || chat.isBlocked);
			await this.setCurrentChatID(-1);
			await this.saveChatsData();
		} catch (error) {
			console.error(error);
		}
	}

	static getCurrentChatData(): ChatData | undefined {
		return this.chatsData.find(chat => chat.id === this.currentChatID);
	}

	static getChatDataByID(chatID: number): ChatData | undefined{
		let data = this.chatsData.find(chat => chat.id === chatID);
		if (data)
		return this.chatsData.find(chat => chat.id === chatID);
	}

	static async blockChatByID(chatID: number): Promise<void> {
		this.chatsData.forEach((element) => {
			if (element.id === chatID) {
				element.isBlocked = true;
			}
		});
		await this.saveChatsData();
	}

	static async unblockChatByID(chatID: number): Promise<void> {
		this.chatsData.forEach((element) => {
			if (element.id === chatID) {
				element.isBlocked = false;
			}
		});
		await this.saveChatsData();
	}

	static async deleteAllChatsData(): Promise<void> {
		this.chatsData = [];
		await this.saveChatsData();
	}

	static async Init(context: ExtensionContext): Promise<void> {
		this.context = context;
		const loadedChatsData = this.context.globalState.get<ChatData[]>('chatsData', []);
		this.chatsData = loadedChatsData ?? [];
	}
}

export { ExtensionData };
