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
    static async createNewChat(model) {
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
                model: model,
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
        let data = this.chatsData.find(chat => chat.id === chatID);
        if (data)
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
    }
}
exports.ExtensionData = ExtensionData;
ExtensionData.chatsData = [];
ExtensionData.context = null;
ExtensionData.chatsDataFilePath = '';
//# sourceMappingURL=ExtensionData.js.map