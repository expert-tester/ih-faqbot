const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showfaq')
        .setDescription('Display the FAQ list')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Filter by category (optional)')
                .setRequired(false)),

    async execute(interaction) {
        const category = interaction.options.getString('category');
        await this.showFaqPage(interaction, category, 1);
    },

    // Method to show a page of FAQ entries
    async showFaqPage(interaction, category, page) {
        const client = interaction.client;
        const ITEMS_PER_PAGE = 5;
        let allEntries = [];

        if (category) {
            // Show FAQs for a specific category
            if (!client.faqDatabase.categories[category] || client.faqDatabase.categories[category].length === 0) {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: `No FAQs found in category: ${category}`, components: [] });
                } else {
                    await interaction.reply({ content: `No FAQs found in category: ${category}`, flags: MessageFlags.Ephemeral });
                }
                return;
            }
            allEntries = client.faqDatabase.categories[category].map(entry => ({ ...entry, category }));
        } else {
            // Show all FAQs across categories
            for (const cat in client.faqDatabase.categories) {
                client.faqDatabase.categories[cat].forEach(entry => {
                    allEntries.push({ ...entry, category: cat });
                });
            }

            if (allEntries.length === 0) {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: 'No FAQs found in the database.', components: [] });
                } else {
                    await interaction.reply({ content: 'No FAQs found in the database.', flags: MessageFlags.Ephemeral });
                }
                return;
            }
        }

        // Sort entries by ID for consistent ordering
        allEntries.sort((a, b) => a.id - b.id);

        // Calculate pagination
        const totalPages = Math.ceil(allEntries.length / ITEMS_PER_PAGE);
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allEntries.length);
        const currentPageEntries = allEntries.slice(startIndex, endIndex);

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle(`FAQ ${category ? `- Category: ${category}` : '- All Categories'}`)
            .setDescription(`Page ${page} of ${totalPages}`)
            .setColor('#3498db')
            .setTimestamp();

        // Add fields for each FAQ
        currentPageEntries.forEach(entry => {
            embed.addFields(
                { name: `${entry.question}`, value: `**Answer:** ${entry.answer}\n**Category:** ${entry.category}` }
            );
        });

        // Add pagination buttons
        const row = new ActionRowBuilder();

        if (page > 1) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`faqpage_${category || 'all'}_${page - 1}`)
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        if (page < totalPages) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`faqpage_${category || 'all'}_${page + 1}`)
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        const components = row.components.length > 0 ? [row] : [];

        if (interaction.customId === "viewall") {
            await interaction.reply({ embeds: [embed], components, flags: MessageFlags.Ephemeral });
            return;
        }

        if (interaction.isButton()) {
            // Button interactions should always update the existing message
            await interaction.update({embeds: [embed], components, flags: MessageFlags.Ephemeral});
        } else if (interaction.replied || interaction.deferred) {
            // Follow-up to existing command interaction
            await interaction.editReply({embeds: [embed], components, flags: MessageFlags.Ephemeral});
        } else {
            // Brand new command interaction
            await interaction.reply({ embeds: [embed], components, flags: MessageFlags.Ephemeral });
        }
    }
};