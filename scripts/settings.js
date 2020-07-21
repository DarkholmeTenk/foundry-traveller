import { refresh } from "./canvas.js"
import { getLogger } from "./util.js"

const log = getLogger("Settings")

export class Setting {
    constructor(name, data) {
        this.name = name
        this.data = data
    }

    register() {
        if(!this.isRegistered) {
            log(`Registering setting ${name}`, this.data)
            game.settings.register("traveller", this.name, this.data)
            this.isRegistered = true
        }
    }

    get value() {
        this.register()
        return game.settings.get("traveller", this.name) 
    }

    set value(newValue) {
        game.settings.set("traveller", this.name, newValue)
    }

    toggle() {
        this.value = !this.value
    }
}

export class TravellerSettings {
    static ShowTravel = new Setting("ShowTravel", {
        name: "Show Travel",
        scope: "client",
        type: Boolean,
        default: false,
        onChange: ()=>refresh(),
        icon: "fas fa-walking"
    })
    static ShowSiltStrider = new Setting("ShowSiltStrider", {
        name: "Show Silt Strider",
        scope: "client",
        type: Boolean,
        default: false,
        onChange: ()=>refresh(),
        icon: "fas fa-bus"
    })
    static ShowBoat = new Setting("ShowBoat", {
        name: "Show Boat",
        scope: "client",
        type: Boolean,
        default: false,
        onChange: ()=>refresh(),
        icon: "fas fa-anchor"
    })
    static ShowMages = new Setting("ShowMages", {
        name: "Show Mages",
        scope: "client",
        type: Boolean,
        default: false,
        onChange: ()=>refresh(),
        icon: "fas fa-hat-wizard"
    })
    static ShowPropylon = new Setting("ShowPropylon", {
        name: "Show Propylon",
        scope: "client",
        type: Boolean,
        default: false,
        onChange: ()=>refresh(),
        icon: "fab fa-fort-awesome"
    })
    static Togglers = [this.ShowTravel, this.ShowSiltStrider, this.ShowBoat, this.ShowMages, this.ShowPropylon]
}