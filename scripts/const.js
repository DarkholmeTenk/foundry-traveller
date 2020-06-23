import { TravellerSettings } from "./settings.js"

export const p2pRoutes = [
    {id: "siltstrider", color: 0x756029, key:"Traveller.SiltStrider", setting: TravellerSettings.ShowSiltStrider},
    {id: "boat", color: 0x0090ff, key:"Traveller.Boat", setting: TravellerSettings.ShowBoat},
    {id: "propylon", color: 0x23cd67, key:"Traveller.Propylon", setting: TravellerSettings.ShowPropylon}
]

export const teleportation = [
    {id: "almsivi", key: "Traveller.Almsivi", color: 0xCAC47C, proximity: true},
    {id: "divine", key: "Traveller.Divine", color: 0xFF0C00, proximity: true},
    {id: "direct", key: "Traveller.Direct", color: 0xCD23CB, proximity: false}
]