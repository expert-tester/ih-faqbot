const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // Reconnect to existing FAQ menus if any
        if (client.faqMenus && client.faqMenus.length > 0) {
            console.log(`Reconnecting to ${client.faqMenus.length} FAQ menu(s)...`);
            
            for (const menu of client.faqMenus) {
                try {
                    const channel = await client.channels.fetch(menu.channelId);
                    if (channel) {
                        try {
                            // Try to fetch the message to ensure it still exists
                            await channel.messages.fetch(menu.messageId);
                            console.log(`Reconnected to FAQ menu in channel ${menu.channelId}`);
                        } catch (err) {
                            console.log(`FAQ menu message in channel ${menu.channelId} no longer exists. Removing from tracking.`);
                            client.faqMenus = client.faqMenus.filter(m => m.messageId !== menu.messageId);
                            
                            // Save the updated menu list
                            const fs = require('fs');
                            const path = require('path');
                            const MENUS_PATH = path.join(__dirname, 'faq_database/', 'faq_menus.json');
                            fs.writeFileSync(MENUS_PATH, JSON.stringify(client.faqMenus, null, 2), 'utf8');
                        }
                    }
                } catch (err) {
                    console.error(`Error reconnecting to FAQ menu in channel ${menu.channelId}:`, err);
                }
            }
        }
    },
};