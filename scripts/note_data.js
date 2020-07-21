import { getTravelData, getLogger } from "./util.js"
import { p2pRoutes, teleportation } from "./const.js"

const log = getLogger("NoteData")

function internalFlatten(data) {
    Object.keys(data).forEach(key=>{
        let val = data[key]
        if(typeof val === "object") {
            let isArr = Object.keys(val).length > 0 && Object.keys(val).every(key=>!isNaN(parseInt(key)))
            if(isArr) {
                data[key] = Object.values(val)
            } else {
                internalFlatten(val)
            }
        }
    })
}

function flattenData(original, formData) {
    let data = mergeObject(original, formData)
    internalFlatten(data)
    return data
}


async function fixReciprocal(myEntry, myTravel, otherNodes) {
    let promises = otherNodes.map(async ({entry, travel})=>{
        let changed = false
        p2pRoutes.forEach(({id})=>{
            if(!travel[id]) {
                travel[id] = []
            }
            if(!myTravel[id]) {
                myTravel[id] = []
            }
            let isOtherInMe = myTravel[id].find(e=>e.target == entry._id)
            let amIInOther = travel[id].find(e=>e.target == myEntry._id)
            if(isOtherInMe && !amIInOther) {
                log(`Travel ${id} not in other [${entry.name}] fixing`)
                travel[id].push({...isOtherInMe, target: myEntry._id})
                changed = true
            } else if(!isOtherInMe && amIInOther) {
                log(`Travel ${id} in other [${entry.name}] after removal`)
                travel[id] = travel[id].filter(e=>e.target != myEntry._id)
                changed = true
            }
        })
        if(changed) {
            await entry.setFlag("traveller", "travelData", travel)
        }
    })
    await Promise.all(promises)
}

class TravelDataForm extends FormApplication {
    constructor(note, travelData, otherNodes) {
        super(note)
        this.note = note
        this.data = travelData
        this.otherNodes = otherNodes
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["form"],
            closeOnSubmit: true,
            submitOnChange: false,
            submitOnClose: false,
            popOut: true,
            editable: game.user.isGM,
            width: 500,
            height: 800,
            template: "modules/traveller/templates/travel_config.html",
            id: "travel-config",
            title: game.i18n.localize("Traveller.ConfigTitle")
        });
    }

    getData() {
        let p2pMap = p2pRoutes.map(d=>{
            return {...d, data: this.data[d.id]}
        })
        let tpMap = teleportation.map(d=>{
            return {...d, set: this.data[d.id]}
        })
        return {
            p2pRoute: p2pMap,
            tpRoute: tpMap,
            data: this.data,
            otherNodes: this.otherNodes
        }
    }

    async _updateObject(_, formData) {
        let data = flattenData({}, formData)
        log("Form data", formData, data)
        await this.note.setFlag("traveller", "travelData", data)
        await fixReciprocal(this.note, data, this.otherNodes)
    }

    activateListeners(html) {
        let addRowButtons = html.find("a[name='add-row']")
        addRowButtons.on("click", async (e)=>{
            e.preventDefault()
            let target = e.target
            let type = target.attributes["data-type"].value
            let rows = this.data[type] = this.data[type] || []
            rows.push({target: "shrug"}) 
            this.render()
        })
        let saveCloseButton = html.find("button[name='submit']");
        saveCloseButton.on("click", async (e)=>{
            e.preventDefault()
            await this.submit()
        });
    }
}

Hooks.on('renderJournalSheet', (app, html, data) => {
    log("Opening journal sheet")
    let title = game.i18n.localize('Traveller.NoteButton');
    let openBtn = $(`<a class="open-travel-links" title="${title}"><i class="fas fa-clipboard"></i>${title}</a>`);
    openBtn.click(ev => {
        let note = app.entity
        let travel = getTravelData(note)
        let otherNodes = Journal.instance.map(entry=>{
            let travel = getTravelData(entry)
            return { entry, travel}
        }).filter(({entry, travel})=>travel.isTravel && entry != note)
        let TravelApp = new TravelDataForm(note, travel, otherNodes)
        TravelApp.render(true)
    });
    html.closest('.app').find('.open-travel-links').remove();
    let titleElement = html.closest('.app').find('.window-title');
    openBtn.insertAfter(titleElement);
});