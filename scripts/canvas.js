import { log, getTravelData } from "./util.js";
import { p2pRoutes, teleportation } from "./const.js";
import { TravellerSettings } from "./settings.js";

function shift({x, y}, angle, radius = 20) {
    return {x: x - (radius * Math.cos(angle)), y: y - (radius * Math.sin(angle))}
}

function circleLine(graphics, pos1, pos2) {
    let angle = Math.atan2(pos1.y - pos2.y, pos1.x - pos2.x)
    let newPos1 = shift(pos1, angle, 20)
    let newPos2 = shift(pos2, Math.PI + angle, 20)
    graphics.moveTo(newPos1.x, newPos1.y)
            .lineTo(newPos2.x, newPos2.y)
}

function buildClosenessMap(notes) {
    let selected = canvas.tokens.controlled[0]
    let map = {}
    if(selected) {
        teleportation.map(({id, proximity})=>{
            if(proximity) {
                let tpNodes = notes.filter(({travel})=>travel[id])
                let distances = tpNodes.map(({note: n})=>((selected.x - n.x) * (selected.x - n.x)) + ((selected.y - n.y) * (selected.y - n.y)))
                let max = Math.min(...distances)
                let pos = distances.indexOf(max)
                map[id] = (newID)=>newID == tpNodes[pos].note.entryId
            } else {
                map[id] = ()=>true
            }
        })
    }
    return map
}

export class TravelCanvasLayer extends CanvasLayer {

    async draw() {
        await super.draw();
        if(!TravellerSettings.ShowTravel.value) return this
        log("Redrawing canvas travel map")
        let notes = canvas.scene.data.notes.map(note=>{
            let entry = Journal.instance.get(note.entryId) 
            let travel = getTravelData(entry)
            return {note, entry, travel}
        }).filter(({travel})=>travel.isTravel)
        log(`Identified ${notes.length} nodes to draw`, notes)
        this.drawMageLayer(notes);
        p2pRoutes.forEach(({id, color, setting})=>{
            if(!setting.value) return
            this.drawP2PLayer(color, notes, id);
        })
        this.drawTPLayer(notes)
        let promises = notes.map(async ({note, travel})=>{
            let thing = this.addChild(new PIXI.Container());
            let circle = thing.addChild(new PIXI.Graphics());
            circle.lineStyle(2, travel.isDark ? 0 : 0xFFFFFF)
                .drawCircle(note.x, note.y, 20)
        })
        await Promise.all(promises)
        return this;
    }

    drawTPLayer(notes) {
        let container = this.addChild(new PIXI.Container());
        let closest = buildClosenessMap(notes)
        notes.forEach(({note, travel})=>{
            let matched = teleportation.filter(({id})=>travel[id])
            let count = matched.length
            matched.forEach(({id, color}, index)=>{
                let graphics = container.addChild(new PIXI.Graphics());
                let angle = (Math.PI / count) * index
                let position = shift(note, angle, 35)
                if(closest[id] && closest[id](note.entryId)) {
                    graphics.beginFill(color)
                        .lineStyle(2, 0)
                } else {
                    graphics.lineStyle(2, color)
                }
                graphics.drawCircle(position.x, position.y, 10)
                graphics.interactive = true
                graphics.hitArea = new PIXI.Circle(position.x, position.y, 11)
                graphics.mouseover = ()=>log("Mouseover")
                graphics.mouseout = ()=>log("Mouse out")
            })
        })
    }

    drawP2PLayer(color, notes, id) {
        let container = this.addChild(new PIXI.Container());
        let graphics = container.addChild(new PIXI.Graphics());
        graphics.lineStyle(3, color);
        let done = {};
        notes.forEach(({ note, entry, travel }) => {
            let routes = travel[id] || [];
            routes.forEach(route => {
                let target = route.target;
                if (done[`${target}_${note.entryId}`])
                    return;
                done[`${target}_${note.entryId}`] = true;
                done[`${note.entryId}_${target}`] = true;
                let { note: targetNote } = notes.find(({ note }) => note.entryId == target) || {};
                if (targetNote) {
                    circleLine(graphics, note, targetNote);
                }
            });
        });
    }

    drawMageLayer(notes) {
        if(!TravellerSettings.ShowMages.value) return
        let mages = notes.filter(({ travel }) => travel.mages);
        if (mages.length > 1) {
            let center = mages.map(n => n.note).reduce((p, c) => ({ x: p.x + (c.x / mages.length), y: p.y + (c.y / mages.length) }), { x: 0, y: 0 });
            let mageContainer = this.addChild(new PIXI.Container());
            let mageGraphics = mageContainer.addChild(new PIXI.Graphics());
            mageGraphics.lineStyle(3, 0xc529ff)
                .drawCircle(center.x, center.y, 20);
            mages.forEach(mage => {
                circleLine(mageGraphics, mage.note, center);
            });
        }
    }
}

log("Setting up canvas hooks")

Hooks.once("canvasInit", canvas => {
    log("Initted Canvas Travel Layer")
    canvas.TravelLayer = canvas.stage.addChild(new TravelCanvasLayer(canvas));
});

export async function refresh() {
    let args = arguments
    log("Refreshing", args)
    let {TravelLayer} = canvas
    TravelLayer.removeChildren()
    await TravelLayer.draw()
}

Hooks.on("createNote", refresh)
Hooks.on("updateNote", refresh)
Hooks.on("deleteNote", refresh)
Hooks.on("controlToken", refresh)
Hooks.on("updateToken", ()=>setTimeout(refresh, 1000))
Hooks.on("updateJournalEntry", refresh)