const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listcategories')
        .setDescription('List all available FAQ categories'),
    
    async execute(interaction) {
        const client = interaction.client;
        const categories = Object.keys(client.faqDatabase.categories);
        
        if (categories.length === 0) {
            await interaction.reply({ content: 'No FAQ categories found.', flags: MessageFlags.Ephemeral });
            return;
        }
        
        const embed = new EmbedBuilder()
            .setTitle('FAQ Categories')
            .setDescription('Here are all available FAQ categories:')
            .setColor('#a684c4')
            .addFields(
                { name: 'Categories', value: categories.map(cat => `• ${cat} (${client.faqDatabase.categories[cat].length} entries)`).join('\n') }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};