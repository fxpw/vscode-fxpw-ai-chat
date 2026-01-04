"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionData = void 0;
const fs = require("fs");
const path = require("path");
class ExtensionData {
    static getChatsDataFilePath() {
        if (!this.context)
            return '';
        if (this.chatsDataFilePath)
            return this.chatsDataFilePath;
        this.chatsDataFilePath = path.join(this.context.globalStorageUri.fsPath, 'chatsData.json');
        return this.chatsDataFilePath;
    }
    static getModelsDataFilePath() {
        if (!this.context)
            return '';
        if (this.modelsDataFilePath)
            return this.modelsDataFilePath;
        this.modelsDataFilePath = path.join(this.context.globalStorageUri.fsPath, 'modelsData.json');
        return this.modelsDataFilePath;
    }
    static get currentChatID() {
        return this.context?.globalState.get('currentChatID', -1) ?? -1;
    }
    static async setCurrentChatID(newParam) {
        try {
            if (this.context) {
                await this.context.globalState.update('currentChatID', newParam);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    static get iteratorForChatID() {
        return this.context?.globalState.get('iteratorForChatID', 0) ?? 0;
    }
    static async addIteratorForChatID() {
        try {
            let lastIterator = this.iteratorForChatID;
            lastIterator++;
            if (this.context) {
                await this.context.globalState.update('iteratorForChatID', lastIterator);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    static async saveChatsData() {
        try {
            const filePath = this.getChatsDataFilePath();
            if (filePath) {
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                await fs.promises.writeFile(filePath, JSON.stringify(this.chatsData, null, 2), 'utf8');
            }
        }
        catch (error) {
            console.error('Error saving chats data:', error);
        }
    }
    static async saveModelsData() {
        try {
            const filePath = this.getModelsDataFilePath();
            if (filePath) {
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                await fs.promises.writeFile(filePath, JSON.stringify(this.modelsData, null, 2), 'utf8');
            }
        }
        catch (error) {
            console.error('Error saving models data:', error);
        }
    }
    static async createNewChat(modelId) {
        try {
            let currentDate = new Date();
            let timestamp = currentDate.getTime();
            let new_chat = {
                conversation: [],
                name: "click ME !",
                createAt: timestamp,
                id: this.iteratorForChatID,
                lastUpdate: timestamp,
                needRenameOnRequest: true,
                modelId: modelId,
                isBlocked: false,
                inputText: "",
            };
            this.chatsData.push(new_chat);
            await this.addIteratorForChatID();
            await this.saveChatsData();
            return new_chat.id;
        }
        catch (error) {
            console.error(error);
            return -1; // При возвращении ошибки, может быть необходимо обработать это по-другому
        }
    }
    static async addDataToCurrentChat(data) {
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
        }
        catch (error) {
            console.error(error);
        }
    }
    static async addDataToChatById(data, chatID) {
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
        }
        catch (error) {
            console.error(error);
        }
    }
    static async changeInputText(text, chatID) {
        try {
            //   assert(chatID >= 0, 'chatID<0');
            let currentChatData = this.getChatDataByID(chatID);
            if (currentChatData) {
                currentChatData.inputText = text;
            }
            await this.saveChatsData();
        }
        catch (error) {
            console.error(error);
        }
    }
    static async deleteChatDataByID(chatID) {
        try {
            this.chatsData = this.chatsData.filter(chat => chat.id !== chatID || chat.isBlocked);
            await this.setCurrentChatID(-1);
            await this.saveChatsData();
        }
        catch (error) {
            console.error(error);
        }
    }
    static getCurrentChatData() {
        return this.chatsData.find(chat => chat.id === this.currentChatID);
    }
    static getChatDataByID(chatID) {
        return this.chatsData.find(chat => chat.id === chatID);
    }
    static async blockChatByID(chatID) {
        this.chatsData.forEach((element) => {
            if (element.id === chatID) {
                element.isBlocked = true;
            }
        });
        await this.saveChatsData();
    }
    static async unblockChatByID(chatID) {
        this.chatsData.forEach((element) => {
            if (element.id === chatID) {
                element.isBlocked = false;
            }
        });
        await this.saveChatsData();
    }
    static async deleteAllChatsData() {
        this.chatsData = [];
        await this.saveChatsData();
    }
    // Migrate old chat data from 'model' field to 'modelId' field
    static async migrateChatData() {
        try {
            let hasChanges = false;
            for (const chat of this.chatsData) {
                // Check if chat has old 'model' field and no 'modelId' field
                if (chat.model && !chat.modelId) {
                    const oldModelName = chat.model;
                    // Try to find a model with matching name
                    let matchingModel = this.modelsData.find(model => model.name === oldModelName);
                    // If no exact name match, try to find by technical model name
                    if (!matchingModel) {
                        matchingModel = this.modelsData.find(model => model.modelName === oldModelName);
                    }
                    // If still no match, create a default model based on the old model name
                    if (!matchingModel) {
                        console.log(`Creating default model for legacy chat with model: ${oldModelName}`);
                        matchingModel = await this.createModel({
                            name: `Migrated: ${oldModelName}`,
                            apiKey: "", // Will need to be filled by user
                            baseUrl: "",
                            modelName: oldModelName,
                            useProxy: false,
                            useSOCKS5: false,
                            proxyIP: "",
                            proxyPortHttps: 0,
                            proxyLogin: "",
                            proxyPassword: "",
                            timeout: 30,
                            streaming: true,
                        });
                    }
                    // Update the chat to use modelId
                    chat.modelId = matchingModel.id;
                    delete chat.model;
                    hasChanges = true;
                    console.log(`Migrated chat ${chat.id} from model "${oldModelName}" to modelId "${matchingModel.id}"`);
                }
            }
            // Save changes if any migrations were performed
            if (hasChanges) {
                await this.saveChatsData();
                console.log('Chat data migration completed');
            }
        }
        catch (error) {
            console.error('Error during chat data migration:', error);
        }
    }
    static async Init(context) {
        this.context = context;
        try {
            const filePath = this.getChatsDataFilePath();
            if (filePath && fs.existsSync(filePath)) {
                const data = await fs.promises.readFile(filePath, 'utf8');
                this.chatsData = JSON.parse(data) || [];
            }
            else {
                this.chatsData = [];
            }
        }
        catch (error) {
            console.error('Error loading chats data:', error);
            this.chatsData = [];
        }
        // Load models data
        try {
            const modelsFilePath = this.getModelsDataFilePath();
            if (modelsFilePath && fs.existsSync(modelsFilePath)) {
                const data = await fs.promises.readFile(modelsFilePath, 'utf8');
                this.modelsData = JSON.parse(data) || [];
            }
            else {
                this.modelsData = [];
            }
        }
        catch (error) {
            console.error('Error loading models data:', error);
            this.modelsData = [];
        }
        // Migrate old chat data to use modelId instead of model
        await this.migrateChatData();
    }
    // Model management methods
    static async createModel(modelConfig) {
        try {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();
            const modelId = `model_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            const newModel = {
                ...modelConfig,
                id: modelId,
                createAt: timestamp,
                lastUpdate: timestamp,
            };
            this.modelsData.push(newModel);
            await this.saveModelsData();
            return newModel;
        }
        catch (error) {
            console.error('Error creating model:', error);
            throw error;
        }
    }
    static getModelById(modelId) {
        return this.modelsData.find(model => model.id === modelId);
    }
    static getAllModels() {
        return this.modelsData;
    }
    static async updateModel(modelId, updates) {
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
        }
        catch (error) {
            console.error('Error updating model:', error);
            return null;
        }
    }
    static async deleteModel(modelId) {
        try {
            const initialLength = this.modelsData.length;
            this.modelsData = this.modelsData.filter(model => model.id !== modelId);
            const wasDeleted = this.modelsData.length < initialLength;
            if (wasDeleted) {
                await this.saveModelsData();
            }
            return wasDeleted;
        }
        catch (error) {
            console.error('Error deleting model:', error);
            return false;
        }
    }
}
exports.ExtensionData = ExtensionData;
ExtensionData.chatsData = [];
ExtensionData.modelsData = [];
ExtensionData.context = null;
ExtensionData.chatsDataFilePath = '';
ExtensionData.modelsDataFilePath = '';
//# sourceMappingURL=ExtensionData.js.map