export function log(message, ...args) {
    console.log(`TRAVELLER | ${message}`, ...args)
}

export function getTravelData(note) {
    if(note.flags) {
        return note.flags.traveller?.travelData || {}
    } else {
        return note.getFlag("traveller", "travelData") || {}
    }
}