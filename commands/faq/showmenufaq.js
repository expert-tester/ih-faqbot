const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, Component } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faqmenu')
        .setDescription('Show menu for FAQ'),

    async execute(interaction) {

        // Build menu
        const menuEmbed = new EmbedBuilder()
            .setColor(0xa684c4)
            .setTitle('ImagineHack 2025 FAQ')
            .addFields(
                { name: '📚 Available Actions', value: 'Use the buttons below to navigate the FAQ system.' }
            )
            .setTimestamp();

        // Build buttons
        const viewall = new ButtonBuilder()
            .setCustomId('viewall')
            .setLabel('View All FAQs')
            .setStyle(ButtonStyle.Primary)

        const browsecategory = new ButtonBuilder()
            .setCustomId('browsecategory')
            .setLabel('Browse by Category')
            .setStyle(ButtonStyle.Success)

        const search = new ButtonBuilder()
            .setCustomId('search')
            .setLabel('🔍 Search')
            .setStyle(ButtonStyle.Secondary)

        // Add buttons
        const row = new ActionRowBuilder()
            .addComponents(viewall, browsecategory, search);

        await interaction.reply({ embeds: [menuEmbed], components: [row]});
    }
}