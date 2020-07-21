import { getLoggerFactory } from "../../dc-base/scripts/util.js"

export const getLogger = getLoggerFactory("Traveller")

export function getTravelData(note) {
    if(note.flags) {
        return note.flags.traveller?.travelData || {}
    } else {
        return note.getFlag("traveller", "travelData") || {}
    }
}