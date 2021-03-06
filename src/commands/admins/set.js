/**
 * @author Benjamin Guirlet
 * @file
 *      Cette commande permet de définir le ou les rôles d'un salon par rapport au bot.
 *      Elle est réservée aux administrateurs.
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, MessageEmbed } = require( "discord.js" );
// Uniquement pour la documentation.
const { ChannelsManager } = require( `${process.cwd()}/database/modules/ChannelsManager` );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "set" )
	.setDescription( "[admin] Permet d'activer/désactiver des fonctionnalités sur un salon." )
	.setDefaultPermission( false )
	.addBooleanOption( option =>
		option
			.setName( "memes" )
			.setDescription( "Activation/désactivation d'un salon de memes." )
	)
	.addBooleanOption( option =>
		option
			.setName( "reposts" )
			.setDescription( "Activation/désactivation d'un salon de reposts." )
	)
	.addBooleanOption( option =>
		option
			.setName( "threads" )
			.setDescription( "Activation/désactivation des threads dans un salon (bloque les messages)." )
	)
	.addBooleanOption( option =>
		option
			.setName( "feed" )
			.setDescription( "Activation/désactivation du salon du feed." )
	)
	.addBooleanOption( option =>
		option
			.setName( "stats" )
			.setDescription( "Activation/désactivation du salon des stats mensuelles." )
	)
	.addBooleanOption( option =>
		option
			.setName( "logs" )
			.setDescription( "Activation/désactivation du salon des logs." )
	)
	.addBooleanOption( option =>
		option
			.setName( "exp" )
			.setDescription( "Activation/désactivation du système de l'expérience." )
	)
	.addBooleanOption( option =>
		option
			.setName( "all" )
			.setDescription( "Désactive/active toutes les fonctionnalités du salon." )
	)
	.setDefaultPermission(false);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	const options = interaction.options;
	if ( options.data.length === 0 ) {
		await interaction.reply({ content: "Vous devez indiquer au moins un paramètre !", ephemeral: true });
		return;
	}

	const sManager = interaction.client.db.channelsManager;
	if ( options.get ( "memes" ) )
		await sManager.updateChannel( interaction.channelId, "b_memes", options.get( "memes" ).value );
	if ( options.get ( "reposts" ) )
		await sManager.updateChannel( interaction.channelId, "b_reposts", options.get( "reposts" ).value );
	if ( options.get ( "threads" ) )
		await sManager.updateChannel( interaction.channelId, "b_threads", options.get( "threads" ).value );
	if ( options.get ( "feed" ) )
		await sManager.updateChannel( interaction.channelId, "b_feed", options.get( "feed" ).value );
	if ( options.get ( "logs" ) )
		await sManager.updateChannel( interaction.channelId, "b_logs", options.get( "logs" ).value );
	if ( options.get ( "stats" ) )
		await sManager.updateChannel( interaction.channelId, "b_stats", options.get( "stats" ).value );
	if ( options.get ( "exp" ) )
		await sManager.updateChannel( interaction.channelId, "b_exp", options.get( "exp" ).value );
	if ( options.get( "all" ) )
		await changeAllValues( interaction.channelId, options.get( "all" ).value, sManager );

	const channel = await sManager.fetchChannel( interaction.channelId );
	const embed = new MessageEmbed()
		.setDescription(
			`**Memes :** ${channel["b_memes"]}\n` +
			`**Reposts :** ${channel["b_reposts"]}\n` +
			`**Threads :** ${channel["b_threads"]}\n` +
			`**Feed :** ${channel["b_feed"]}\n` +
			`**Logs :** ${channel["b_logs"]}\n` +
			`**Stats :** ${channel["b_stats"]}\n` +
			`**Exp: ** ${channel["b_exp"]}`
		)
		.setAuthor({
			name: "| Fonctionnalités du salon",
			iconURL: interaction.user.avatarURL()
		});

	try {
		await interaction.reply( { embeds: [ embed ], ephemeral: true } );
	}
	catch ( err ) {
		console.log( "Interaction inconnue: commands/admin/set.js:114" );
	}
}


/**
 * Chande les toutes les fonctionnalités d'un salon en fonction de la valeur passée en paramètre.
 * @param {string} channelId L'identifiant du salon.
 * @param {boolean} value La nouvelle valeur des fonctionnalités du salon.
 * @param {ChannelsManager} sManager Le manager pour les salons de la base de données.
 */
async function changeAllValues( channelId, value, sManager ) {
	await sManager.updateChannel( channelId, "b_reposts", value );
	await sManager.updateChannel( channelId, "b_memes", value );
	await sManager.updateChannel( channelId, "b_threads", value );
	await sManager.updateChannel( channelId, "b_feed", value );
	await sManager.updateChannel( channelId, "b_logs", value );
	await sManager.updateChannel( channelId, "b_stats", value );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	adminsOnly: true,
	data: slashCommand,
	execute
}