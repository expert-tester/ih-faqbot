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
        } else if (action === 'viewall') {
            const client = interaction.client;
            const command = client.commands.get('showfaq');
            if (command) {
                await command.showFaqPage(interaction, null, 1);
            }
        } else if (action === 'browsecategory') {
            const client = interaction.client;
            const command = client.commands.get('browsecategory');
            if (command) {
                await command.browseCategoryMenu(interaction);
            }
        } else if (action === 'search') {
            const client = interaction.client;
            const command = client.commands.get('searchfaq');
            if (command) {
                await command.showSearchModal(interaction);
            }
        }
    },
};