/*
 *  Copyright 1998-2025 by Northwoods Software Corporation. All Rights Reserved.
 */
/*
 * This is an extension and not part of the main GoJS library.
 * The source code for this is at extensionsJSM/RealtimeDragSelectingTool.ts.
 * Note that the API for this class may change with any version, even point releases.
 * If you intend to use an extension in production, you should copy the code to your own source directory.
 * Extensions can be found in the GoJS kit under the extensions or extensionsJSM folders.
 * See the Extensions intro page (https://gojs.net/latest/intro/extensions.html) for more information.
 */

/**
 * The RealtimeDragSelectingTool class lets the user select and deselect Parts within the {@link go.DragSelectingTool.box}
 * during a drag, not just at the end of the drag.
 *
 * If you want to experiment with this extension, try the <a href="../../samples/RealtimeDragSelecting.html">Realtime Drag Selecting</a> sample.
 * @category Tool Extension
 */
class RealtimeDragSelectingTool extends go.DragSelectingTool {
    constructor(init) {
        super();
        this.name = 'RealtimeDragSelecting';
        this._originalSelection = new go.Set();
        this._temporarySelection = new go.Set();
        if (init)
            Object.assign(this, init);
    }
    /**
     * Remember the original collection of selected Parts.
     */
    doActivate() {
        super.doActivate();
        // keep a copy of the original Set of selected Parts
        this._originalSelection = this.diagram.selection.copy();
        // these Part.isSelected may have been temporarily modified
        this._temporarySelection.clear();
        this.diagram.raiseDiagramEvent('ChangingSelection');
    }
    /**
     * Release any references to selected Parts.
     */
    doDeactivate() {
        this.diagram.raiseDiagramEvent('ChangedSelection');
        this._originalSelection.clear();
        this._temporarySelection.clear();
        super.doDeactivate();
    }
    /**
     * Restore the selection which may have been modified during a drag.
     */
    doCancel() {
        const orig = this._originalSelection;
        orig.each((p) => (p.isSelected = true));
        this._temporarySelection.each((p) => {
            if (!orig.has(p))
                p.isSelected = false;
        });
        super.doCancel();
    }
    /**
     * Select Parts within the bounds of the drag-select box.
     */
    doMouseMove() {
        if (this.isActive) {
            super.doMouseMove();
            this.selectInRect(this.computeBoxBounds());
        }
    }
    /**
     * Select Parts within the bounds of the drag-select box.
     */
    doKeyDown() {
        if (this.isActive) {
            super.doKeyDown();
            this.selectInRect(this.computeBoxBounds());
        }
    }
    /**
     * Select Parts within the bounds of the drag-select box.
     */
    doKeyUp() {
        if (this.isActive) {
            super.doKeyUp();
            this.selectInRect(this.computeBoxBounds());
        }
    }
    /**
     * For a given rectangle, select Parts that are within that rectangle.
     * @param r - rectangular bounds in document coordinates.
     */
    selectInRect(r) {
        const diagram = this.diagram;
        const orig = this._originalSelection;
        const temp = this._temporarySelection;
        const e = diagram.lastInput;
        const found = diagram.findPartsIn(r, this.isPartialInclusion);
        if (e.control || e.meta) {
            // toggle or deselect
            if (e.shift) {
                // deselect only
                temp.each((p) => {
                    if (!found.has(p))
                        p.isSelected = orig.has(p);
                });
                found.each((p) => {
                    p.isSelected = false;
                    temp.add(p);
                });
            }
            else {
                // toggle selectedness of parts based on _originalSelection
                temp.each((p) => {
                    if (!found.has(p))
                        p.isSelected = orig.has(p);
                });
                found.each((p) => {
                    p.isSelected = !orig.has(p);
                    temp.add(p);
                });
            }
        }
        else if (e.shift) {
            // extend selection only
            temp.each((p) => {
                if (!found.has(p))
                    p.isSelected = orig.has(p);
            });
            found.each((p) => {
                p.isSelected = true;
                temp.add(p);
            });
        }
        else {
            // select found parts, and unselect all other previously selected parts
            temp.each((p) => {
                if (!found.has(p))
                    p.isSelected = false;
            });
            orig.each((p) => {
                if (!found.has(p))
                    p.isSelected = false;
            });
            found.each((p) => {
                p.isSelected = true;
                temp.add(p);
            });
        }
    }
}
