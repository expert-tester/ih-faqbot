const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        
        const [action, category, page] = interaction.customId.split('_');
        
        if (action === 'faqpage') {
            const client = interaction.client;
            const command = client.commands.get('showfaq');
            if (command) {
                await command.showFaqPage(interaction, category === 'all' ? null : category, parseInt(page));
            }
        }
    },
};