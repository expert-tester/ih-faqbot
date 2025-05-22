const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, Component } = require('discord.js');
const { hasAdminRole } = require('./adminrolechecker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faqmenu')
        .setDescription('Show menu for FAQ'),

    async execute(interaction) {

        // Check if the user has admin role
        if (!hasAdminRole(interaction)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command. Only admins can use this command.',
                flags: MessageFlags.Ephemeral
            });
        }

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

        await interaction.reply({ embeds: [menuEmbed], components: [row] });
    }
}