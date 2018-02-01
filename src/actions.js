// Actions to dispatch from React UI

export function moveFigure(x, y, save = false) {
    return { type: 'MOVE_FIGURE', x, y, save }
}

export function changeWidth(width) {
    return { type: 'CHANGE_WIDTH', width }
}

export function changeHeight(height) {
    return { type: 'CHANGE_HEIGHT', height }
}

export function toggleBoundaries(toggle) {
    return { type: 'TOGGLE_BOUNDARIES', toggle }
}

export function undoRedo(action) {
    return { type: 'UNDO_REDO', action }
}