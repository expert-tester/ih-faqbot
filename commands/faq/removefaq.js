const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removefaq')
        .setDescription('Remove an FAQ entry')
        .addIntegerOption(option => 
            option.setName('id')
                .setDescription('The ID of the FAQ to remove')
                .setRequired(true)),
    
    async execute(interaction) {
        const client = interaction.client;
        const id = interaction.options.getInteger('id');
        const { entry, category } = client.findFaqEntry(id);
        
        if (!entry) {
            await interaction.reply({ content: `❌ FAQ with ID ${id} not found.`, ephemeral: true });
            return;
        }
        
        // Remove the FAQ entry
        client.faqDatabase.categories[category] = client.faqDatabase.categories[category].filter(faq => faq.id !== id);
        
        // Clean up empty categories
        if (client.faqDatabase.categories[category].length === 0) {
            delete client.faqDatabase.categories[category];
        }
        
        client.saveDatabase();
        
        await interaction.reply({
            content: `✅ FAQ with ID ${id} removed successfully.`,
            ephemeral: true
        });
    },
};