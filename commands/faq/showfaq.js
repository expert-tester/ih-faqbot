const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
                    await interaction.reply({ content: `No FAQs found in category: ${category}`, ephemeral: true });
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
                    await interaction.reply({ content: 'No FAQs found in the database.', ephemeral: true });
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
                { name: `ID ${entry.id}: ${entry.question}`, value: `**Category:** ${entry.category}\n**Answer:** ${entry.answer}` }
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
        
        // Send or update the response
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [embed], components });
        } else {
            await interaction.reply({ embeds: [embed], components, ephemeral: true });
        }
    }
};