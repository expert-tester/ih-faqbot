const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'faq_database/adminRole.json');

// Helper function to save admin role to config
function saveAdminRole(guildId, roleId) {
    // Ensure config directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    // Load existing config or create new one
    let config = {};
    if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        try {
            config = JSON.parse(fileContent);
        } catch (error) {
            console.error('Error parsing admin role config:', error);
        }
    }

    // Update config with new role ID
    config[guildId] = roleId;

    // Save updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Set admin role: ${role.name} (${role.id}) for guild: ${guild.name} (${guild.id})!`);
    return true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adminrole')
        .setDescription('Set role as administrator for ih-faq bot.')
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Role to be added')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;
        var roleId = interaction.options.getString('role');
        // Handle mention format <@&123456789>
        if (roleId.startsWith('<@&') && roleId.endsWith('>')) {
            roleId = roleId.substring(3, roleId.length - 1);
        }
        
        const role = guild.roles.cache.find((r) => r.id === roleId);

        if (!role) {
            return interaction.reply({
                content: '❌ Could not find the specified role. Please try again with a valid role.',
                flags: MessageFlags.Ephemeral
            });
        }

        console.log(`Attempting to set admin role: ${role.name} (${role.id}) for guild: ${guild.name} (${guild.id})`);

        // Save the admin role ID to configuration
        try {
            saveAdminRole(guild.id, role.id);
            return interaction.reply({
                content: `✅ Successfully set ${role.name} as the admin role for this bot!`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error setting admin role:', error);
            return interaction.reply({
                content: '❌ Failed to set admin role. Please check the bot logs.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}