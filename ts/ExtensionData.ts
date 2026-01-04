import { ExtensionContext } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ModelConfig {
	id: string;
	name: string;
	apiKey: string;
	baseUrl: string;
	modelName: string;
	useProxy: boolean;
	useSOCKS5: boolean;
	proxyIP: string;
	proxyPortHttps: number;
	proxyLogin: string;
	proxyPassword: string;
	timeout: number;
	streaming: boolean;
	createAt: number;
	lastUpdate: number;
}

interface ChatData {
	conversation: Array<{ role: string, content: string }>; // Примерная структура, уточните согласно вашим нуждам.
	name: string;
	createAt: number;
	id: number;
	lastUpdate: number;
	needRenameOnRequest: boolean;
	modelId: string; // Changed from model: string to modelId: string
	isBlocked: boolean;
	inputText:string;
}

class ExtensionData {
	public static chatsData: ChatData[] = [];
	public static modelsData: ModelConfig[] = [];
	private static context: ExtensionContext | null = null;
	private static chatsDataFilePath: string = '';
	private static modelsDataFilePath: string = '';

	private static getChatsDataFilePath(): string {
		if (!this.context) return '';
		if (this.chatsDataFilePath) return this.chatsDataFilePath;
		this.chatsDataFilePath = path.join(this.context.globalStorageUri.fsPath, 'chatsData.json');
		return this.chatsDataFilePath;
	}

	private static getModelsDataFilePath(): string {
		if (!this.context) return '';
		if (this.modelsDataFilePath) return this.modelsDataFilePath;
		this.modelsDataFilePath = path.join(this.context.globalStorageUri.fsPath, 'modelsData.json');
		return this.modelsDataFilePath;
	}

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
			const filePath = this.getChatsDataFilePath();
			if (filePath) {
				await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
				await fs.promises.writeFile(filePath, JSON.stringify(this.chatsData, null, 2), 'utf8');
			}
		} catch (error) {
			console.error('Error saving chats data:', error);
		}
	}

	static async saveModelsData(): Promise<void> {
		try {
			const filePath = this.getModelsDataFilePath();
			if (filePath) {
				await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
				await fs.promises.writeFile(filePath, JSON.stringify(this.modelsData, null, 2), 'utf8');
			}
		} catch (error) {
			console.error('Error saving models data:', error);
		}
	}

	static async createNewChat(modelId: string): Promise<number> {
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
				modelId: modelId,
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
		try {
			const filePath = this.getChatsDataFilePath();
			if (filePath && fs.existsSync(filePath)) {
				const data = await fs.promises.readFile(filePath, 'utf8');
				this.chatsData = JSON.parse(data) || [];
			} else {
				this.chatsData = [];
			}
		} catch (error) {
			console.error('Error loading chats data:', error);
			this.chatsData = [];
		}

		// Load models data
		try {
			const modelsFilePath = this.getModelsDataFilePath();
			if (modelsFilePath && fs.existsSync(modelsFilePath)) {
				const data = await fs.promises.readFile(modelsFilePath, 'utf8');
				this.modelsData = JSON.parse(data) || [];
			} else {
				this.modelsData = [];
			}
		} catch (error) {
			console.error('Error loading models data:', error);
			this.modelsData = [];
		}
	}

	// Model management methods
	static async createModel(modelConfig: Omit<ModelConfig, 'id' | 'createAt' | 'lastUpdate'>): Promise<ModelConfig> {
		try {
			const currentDate = new Date();
			const timestamp = currentDate.getTime();
			const modelId = `model_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

			const newModel: ModelConfig = {
				...modelConfig,
				id: modelId,
				createAt: timestamp,
				lastUpdate: timestamp,
			};

			this.modelsData.push(newModel);
			await this.saveModelsData();
			return newModel;
		} catch (error) {
			console.error('Error creating model:', error);
			throw error;
		}
	}

	static getModelById(modelId: string): ModelConfig | undefined {
		return this.modelsData.find(model => model.id === modelId);
	}

	static getAllModels(): ModelConfig[] {
		return this.modelsData;
	}

	static async updateModel(modelId: string, updates: Partial<ModelConfig>): Promise<ModelConfig | null> {
		try {
			const modelIndex = this.modelsData.findIndex(model => model.id === modelId);
			if (modelIndex === -1) {
				return null;
			}

			this.modelsData[modelIndex] = {
				...this.modelsData[modelIndex],
				...updates,
				lastUpdate: new Date().getTime(),
			};

			await this.saveModelsData();
			return this.modelsData[modelIndex];
		} catch (error) {
			console.error('Error updating model:', error);
			return null;
		}
	}

	static async deleteModel(modelId: string): Promise<boolean> {
		try {
			const initialLength = this.modelsData.length;
			this.modelsData = this.modelsData.filter(model => model.id !== modelId);
			const wasDeleted = this.modelsData.length < initialLength;

			if (wasDeleted) {
				await this.saveModelsData();
			}

			return wasDeleted;
		} catch (error) {
			console.error('Error deleting model:', error);
			return false;
		}
	}
}

export { ExtensionData, ModelConfig, ChatData };
