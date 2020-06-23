import { log } from './util.js'
import { TravellerSettings } from './settings.js';

log("Initialising control hooks")

Hooks.on("getSceneControlButtons", (controls) => {
    controls.push({
        name: "travel",
        title: "Traveller.Controls",
        icon: "fas fa-route",
        layer: "TravelCanvasLayer",
        tools: TravellerSettings.Togglers.map(setting => ({
            name: setting.name,
            title: `Traveller.${setting.name}`,
            icon: setting.data.icon,
            active: setting.value,
            toggle: true,
            onClick: () => setting.toggle()
        })),
    });
});
