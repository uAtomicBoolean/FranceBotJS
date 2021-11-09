/**
 * @author Benjamin Guirlet
 * @description
 *      Event called whenever an event is emitted.
 *      It is used to manually emit events that are not received by the client.
 *      For example, reactions added/removed from messages that are not in the client's cache.
 */


const { client } = require( "../index" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Called whenever an event is received by the client.
 * Some events might not be managed by the client ( such as the not cached reaction ones ) so we emit an event from here
 * to the client.
 * @param packet
 */
async function execute( packet ) {
	// We don't want this to run on unrelated packets
	if ( !['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes( packet.t ) ) return;

	// Grab the channel to check the message from
	const channel = client.channels.cache.get( packet.d.channel_id );

	// There's no need to emit if the message is cached, because the event will fire anyway for that
	if ( channel.messages.cache.has( packet.d.message_id ) ) return;

	// Since we have confirmed the message is not cached, let's fetch it
	channel.messages.fetch( packet.d.message_id ).then( message => {
		// Emojis can have identifiers of name:id format, so we have to account for that case as well
		const emoji = packet.d.emoji.id ? packet.d.emoji.id : packet.d.emoji.name;

		// This gives us the reaction we need to emit the event properly, in top of the message object
		const reaction = message.reactions.cache.get( emoji );

		// Adds the currently reacting user to the reaction's users collection.
		if ( reaction ) reaction.users.cache.set( packet.d.user_id, client.users.cache.get( packet.d.user_id ) );

		// Check which type of event it is before emitting
		if ( packet.t === 'MESSAGE_REACTION_ADD' )
			client.emit( 'messageReactionAdd', reaction, client.users.cache.get( packet.d.user_id ) );
		if ( packet.t === 'MESSAGE_REACTION_REMOVE' )
			client.emit( 'messageReactionRemove', reaction, client.users.cache.get( packet.d.user_id ) );
	} );
}



/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "raw",
	execute
}
