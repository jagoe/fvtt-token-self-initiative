Hooks.on("ready", () =>{
    game.socket.on('module.self-player-init', async data => {
        console.log(data);
        if (game.user.isGM && data.event == "set-initiative") {
            let available_combats = game.combats.filter(combat => combat.scene.id == data.token.sceneId);
            if (available_combats.length == 0) {
                return;
            }

            let combat = available_combats[0];
            await Promise.all(
                combat.combatants
                .filter(combatan => combatan.token.id == data.token.id)
                .map(c => c.update({initiative: data.initiative})));
        }
    });
}); 

Hooks.on("chatCommandsReady", function(chatCommands) {
    chatCommands.registerCommand(chatCommands.createCommandFromData({
      commandKey: "/init",
      invokeOnCommand: (chatlog, messageText, chatdata) => {
        console.log("Invoked /init");
        console.log(messageText);
        let initiative = parseInt(messageText);
        if (Number.isNaN(initiative)) {
            console.log("Error while parsing initiative");
            return;
        }
        
        let token_list = canvas.tokens.ownedTokens.filter(token => token.inCombat);
        if (token_list.length != 1) {
            token_list = canvas.tokens.controlled.filter(token => token.inCombat);
        }

        return token_list.filter(token => token.isOwner).map(player_token => {
            game.socket.emit('module.self-player-init', {
                event: "set-initiative",
                token: {
                    id: player_token.id,
                    sceneId: player_token.scene.id,
                  },
                initiative: initiative,
            });
        });
        
      },
      shouldDisplayToChat: false,
      createdMessageType: 1,
      iconClass: "fa-sticky-note",
      description: "Set initiative for selected or owned tokens"
    }));
  });
  
