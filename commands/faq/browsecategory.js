const { StringSelectMenuBuilder, SlashCommandBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('browsecategory')
        .setDescription('Browse FAQs by Category'),
    async execute(interaction) {
        await this.browseCategoryMenu(interaction);
    },

    async browseCategoryMenu(interaction) {
        try {
            // Load JSON data dynamically (will pick up changes without restart)
            const rawData = fs.readFileSync(path.join(__dirname, 'faq_database/faq_database.json')); // Path of JSON database
            const faqData = JSON.parse(rawData);
            
            const categories = Object.keys(faqData.categories);
            
            if (categories.length === 0) {
                return await interaction.reply({
                    content: 'No categories available yet!',
                    flags: MessageFlags.Ephemeral
                });
            }
            
            const select = new StringSelectMenuBuilder()
                .setCustomId('browsecategorymenu')
                .setPlaceholder('Select a Category')
                .addOptions(
                    categories.map(category => ({
                        label: `Category ${category}`,
                        description: `${faqData.categories[category].length} FAQ(s) available`,
                        value: category
                    }))
                );
            
            await interaction.reply({
                components: [new ActionRowBuilder().addComponents(select)],
                flags: MessageFlags.Ephemeral
            });
            
        } catch (error) {
            console.error('Error loading FAQ data:', error);
            await interaction.reply({
                content: 'There was an error loading the FAQ categories.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};