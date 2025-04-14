"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAI = void 0;
// import * as url from 'url';
const https_proxy_agent_1 = require("https-proxy-agent");
const openai_1 = require("openai");
const ExtensionSettings_1 = require("./ExtensionSettings");
const ExtensionData_1 = require("./ExtensionData");
const socks_proxy_agent_1 = require("socks-proxy-agent");
class OpenAI {
    static async request(messageData, webview = undefined, needPreUpdate = false, needPostUpdate = false) {
        try {
            await ExtensionData_1.ExtensionData.setCurrentChatID(messageData.chatID);
            const conversationSendTextButtonOnClickData = {
                "role": "user",
                "content": messageData.text,
            };
            let agent = undefined;
            if (ExtensionSettings_1.ExtensionSettings.PROXY_URL !== "") {
                let proxyUrl = new URL(ExtensionSettings_1.ExtensionSettings.PROXY_URL);
                if (!ExtensionSettings_1.ExtensionSettings.USE_SOCKS5) {
                    agent = new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
                }
                else if (ExtensionSettings_1.ExtensionSettings.USE_SOCKS5) {
                    agent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
                }
            }
            const openai = new openai_1.OpenAI({
                baseURL: ExtensionSettings_1.ExtensionSettings.OPENAI_MODEL == "deepseek-chat" ? "https://api.deepseek.com" : null,
                apiKey: ExtensionSettings_1.ExtensionSettings.OPENAI_KEY,
                httpAgent: agent || undefined,
            });
            await ExtensionData_1.ExtensionData.addDataToChatById(conversationSendTextButtonOnClickData, messageData.chatID);
            const newChatData = ExtensionData_1.ExtensionData.getChatDataByID(messageData.chatID);
            await ExtensionData_1.ExtensionData.blockChatByID(messageData.chatID);
            if (newChatData && newChatData.conversation) {
                const messagesForAPI = newChatData.conversation.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                }));
                const chatCompletion = await openai.chat.completions.create({
                    messages: messagesForAPI,
                    model: ExtensionSettings_1.ExtensionSettings.OPENAI_MODEL,
                }, {
                    httpAgent: agent || undefined,
                    timeout: 1000 * 30,
                });
                if (chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content) {
                    const conversationAIData = {
                        "role": "assistant",
                        "content": chatCompletion.choices[0].message.content,
                    };
                    await ExtensionData_1.ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
                }
            }
        }
        catch (error) {
            console.log(error);
            const conversationAIData = {
                "role": "assistant",
                "content": error instanceof Error ? error.message : "Unknown error",
            };
            await ExtensionData_1.ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
        }
        finally {
            await ExtensionData_1.ExtensionData.unblockChatByID(messageData.chatID);
        }
    }
    static async commitRequest(diffMessage) {
        let agent = false;
        if (ExtensionSettings_1.ExtensionSettings.USE_PROXY) {
            if (ExtensionSettings_1.ExtensionSettings.PROXY_URL !== "") {
                if (!ExtensionSettings_1.ExtensionSettings.USE_SOCKS5) {
                    const proxyUrl = new URL(ExtensionSettings_1.ExtensionSettings.PROXY_URL);
                    agent = new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
                }
                else if (ExtensionSettings_1.ExtensionSettings.USE_SOCKS5) {
                    const proxyUrl = new URL(ExtensionSettings_1.ExtensionSettings.PROXY_URL);
                    agent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
                }
            }
        }
        const messageForAPI = {
            role: 'user',
            content: diffMessage,
        };
        const messagesForAPI = [messageForAPI].map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
        }));
        const openai = new openai_1.OpenAI({
            apiKey: ExtensionSettings_1.ExtensionSettings.OPENAI_KEY,
            httpAgent: agent || undefined,
        });
        const chatCompletion = await openai.chat.completions.create({
            messages: messagesForAPI,
            model: ExtensionSettings_1.ExtensionSettings.OPENAI_MODEL,
        });
        return chatCompletion.choices && chatCompletion.choices.length > 0
            && chatCompletion.choices[0].message.content ? chatCompletion.choices[0].message.content
            : null;
    }
    static getChatsListData() {
        return ExtensionData_1.ExtensionData.chatsData;
    }
    static getCurrentChatData() {
        return ExtensionData_1.ExtensionData.getCurrentChatData();
    }
    static getCurrentChat() {
        return ExtensionData_1.ExtensionData.currentChatID;
    }
    static async deleteChatDataByID(messageData) {
        try {
            return await ExtensionData_1.ExtensionData.deleteChatDataByID(messageData.chatID);
        }
        catch (error) {
            console.error(error);
        }
    }
    static async createNewChat(model) {
        try {
            return await ExtensionData_1.ExtensionData.createNewChat(model);
        }
        catch (error) {
            console.error(error);
            return -1;
        }
    }
    static async deleteAllChatsData() {
        try {
            return await ExtensionData_1.ExtensionData.deleteAllChatsData();
        }
        catch (error) {
            console.error(error);
        }
    }
    static async changeInputText(text, chatID) {
        await ExtensionData_1.ExtensionData.changeInputText(text, chatID);
    }
    static async setCurrentChatID(id) {
        try {
            return await ExtensionData_1.ExtensionData.setCurrentChatID(id);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.OpenAI = OpenAI;
//# sourceMappingURL=OpenAI.js.map