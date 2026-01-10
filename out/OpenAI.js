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
                "id": messageData.messageId,
            };
            // Get chat data and model configuration
            const chatData = ExtensionData_1.ExtensionData.getChatDataByID(messageData.chatID);
            if (!chatData) {
                throw new Error('Chat data not found');
            }
            const modelConfig = ExtensionData_1.ExtensionData.getModelById(chatData.modelId);
            if (!modelConfig) {
                throw new Error('Model configuration not found');
            }
            let agent = undefined;
            if (modelConfig.useProxy) {
                try {
                    let proxyUrl;
                    if (!modelConfig.useSOCKS5) {
                        if (modelConfig.proxyLogin && modelConfig.proxyPassword && modelConfig.proxyIP && modelConfig.proxyPortHttps) {
                            proxyUrl = `http://${modelConfig.proxyLogin}:${modelConfig.proxyPassword}@${modelConfig.proxyIP}:${modelConfig.proxyPortHttps}`;
                        }
                        else if (modelConfig.proxyIP && modelConfig.proxyPortHttps) {
                            proxyUrl = `http://${modelConfig.proxyIP}:${modelConfig.proxyPortHttps}`;
                        }
                        else {
                            throw new Error('Invalid proxy configuration');
                        }
                    }
                    else {
                        proxyUrl = `socks5h://${modelConfig.proxyLogin}:${modelConfig.proxyPassword}@${modelConfig.proxyIP}:${modelConfig.proxyPortHttps}`;
                    }
                    const parsedProxyUrl = new URL(proxyUrl);
                    if (!modelConfig.useSOCKS5) {
                        const agentOptions = {
                            rejectUnauthorized: false,
                            timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : 30000
                        };
                        agent = new https_proxy_agent_1.HttpsProxyAgent(parsedProxyUrl, agentOptions);
                    }
                    else {
                        agent = new socks_proxy_agent_1.SocksProxyAgent(parsedProxyUrl);
                    }
                }
                catch (error) {
                    console.error('Proxy URL parsing error:', error);
                }
            }
            else {
                // Try to use system proxy as fallback
                const systemProxy = process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy;
                if (systemProxy) {
                    try {
                        const agentOptions = {
                            rejectUnauthorized: false,
                            timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : 30000
                        };
                        agent = new https_proxy_agent_1.HttpsProxyAgent(systemProxy, agentOptions);
                    }
                    catch (error) {
                        console.error('System proxy error:', error);
                    }
                }
            }
            let finalBaseurl = modelConfig.baseUrl || null;
            // Auto-detect base URL if not provided
            if (!finalBaseurl) {
                if (modelConfig.modelName === "deepseek-chat") {
                    finalBaseurl = "https://api.deepseek.com";
                }
                else if (modelConfig.modelName === "alibaba/tongyi-deepresearch-30b-a3b") {
                    finalBaseurl = "https://openrouter.ai/api/v1";
                }
                else if (modelConfig.modelName === "llama3.1:8b" || modelConfig.modelName === "llama3.1:8b-instruct-q5_K_M") {
                    finalBaseurl = "http://localhost:11434/v1";
                }
            }
            const openai = new openai_1.OpenAI({
                baseURL: finalBaseurl,
                apiKey: modelConfig.apiKey || "ollama",
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
                if (modelConfig.streaming) {
                    // Streaming mode
                    let fullContent = '';
                    const stream = await openai.chat.completions.create({
                        messages: messagesForAPI,
                        model: modelConfig.modelName,
                        stream: true,
                    }, {
                        httpAgent: agent || undefined,
                        timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : undefined,
                    });
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            fullContent += content;
                            // Send streaming update to webview
                            if (webview) {
                                webview.postMessage({
                                    command: 'streamingMessageUpdate',
                                    chatID: messageData.chatID,
                                    content: fullContent
                                });
                            }
                        }
                    }
                    if (fullContent) {
                        const conversationAIData = {
                            "role": "assistant",
                            "content": fullContent,
                        };
                        await ExtensionData_1.ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
                        // Send completion message to finalize streaming
                        if (webview) {
                            webview.postMessage({
                                command: 'streamingComplete',
                                chatID: messageData.chatID,
                                chatData: ExtensionData_1.ExtensionData.getChatDataByID(messageData.chatID)
                            });
                        }
                    }
                    return true; // Streaming was used
                }
                else {
                    // Non-streaming mode
                    const chatCompletion = await openai.chat.completions.create({
                        messages: messagesForAPI,
                        model: modelConfig.modelName,
                    }, {
                        httpAgent: agent || undefined,
                        timeout: modelConfig.timeout ? modelConfig.timeout * 1000 : undefined,
                    });
                    if (chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message.content) {
                        const conversationAIData = {
                            "role": "assistant",
                            "content": chatCompletion.choices[0].message.content,
                        };
                        await ExtensionData_1.ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
                    }
                    return false; // Non-streaming mode
                }
            }
        }
        catch (error) {
            console.error(error);
            const conversationAIData = {
                "role": "assistant",
                "content": error instanceof Error ? error.message : "Unknown error",
            };
            await ExtensionData_1.ExtensionData.addDataToChatById(conversationAIData, messageData.chatID);
            return false; // Error occurred, treat as non-streaming
        }
        finally {
            await ExtensionData_1.ExtensionData.unblockChatByID(messageData.chatID);
        }
        return false; // Fallback return
    }
    static async commitRequest(diffMessage) {
        let agent = undefined;
        if (ExtensionSettings_1.ExtensionSettings.USE_PROXY && ExtensionSettings_1.ExtensionSettings.PROXY_URL !== "") {
            try {
                const proxyUrl = new URL(ExtensionSettings_1.ExtensionSettings.PROXY_URL);
                if (!ExtensionSettings_1.ExtensionSettings.USE_SOCKS5) {
                    const agentOptions = {
                        rejectUnauthorized: false,
                        timeout: ExtensionSettings_1.ExtensionSettings.TIMEOUT ? ExtensionSettings_1.ExtensionSettings.TIMEOUT * 1000 : 30000
                    };
                    agent = new https_proxy_agent_1.HttpsProxyAgent(proxyUrl, agentOptions);
                }
                else if (ExtensionSettings_1.ExtensionSettings.USE_SOCKS5) {
                    agent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
                }
            }
            catch (error) {
                console.error('Commit request proxy error:', error);
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
    static async deleteChatDataByID(chatID) {
        try {
            const id = typeof chatID === 'number' ? chatID : chatID.chatID;
            return await ExtensionData_1.ExtensionData.deleteChatDataByID(id);
        }
        catch (error) {
            console.error(error);
        }
    }
    static async createNewChat(modelId) {
        try {
            return await ExtensionData_1.ExtensionData.createNewChat(modelId);
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
    static async deleteMessageFromChat(chatID, messageId) {
        try {
            return await ExtensionData_1.ExtensionData.deleteMessageFromChat(chatID, messageId);
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    static async setCurrentChatID(id) {
        try {
            return await ExtensionData_1.ExtensionData.setCurrentChatID(id);
        }
        catch (error) {
            console.error(error);
        }
    }
    // Model management methods
    static async createModel(modelConfig) {
        return await ExtensionData_1.ExtensionData.createModel(modelConfig);
    }
    static getModelById(modelId) {
        return ExtensionData_1.ExtensionData.getModelById(modelId);
    }
    static getAllModels() {
        return ExtensionData_1.ExtensionData.getAllModels();
    }
    static async updateModel(modelId, updates) {
        return await ExtensionData_1.ExtensionData.updateModel(modelId, updates);
    }
    static async deleteModel(modelId) {
        return await ExtensionData_1.ExtensionData.deleteModel(modelId);
    }
}
exports.OpenAI = OpenAI;
//# sourceMappingURL=OpenAI.js.map