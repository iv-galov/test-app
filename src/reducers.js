import { Map, List } from 'immutable'

// Initial state of Redux store, contains:
// - ellipse object (Map from Immutable.js)
// - history of ellipse states to implement undo-redo (List from Immutable.js)
// - currentUndo property to handle undo-redo switches
const initialState = Map(
    {figure:
      Map({cx: 100, cy: 100,
        width: 200, height: 100}),
      history: List([
        Map({cx: 100, cy: 100,
          width: 200, height: 100})
      ]),
      currentUndo: undefined,
      boundaries: false}
  )
  
  // Check ellipse overlapping with canvas boundaries
  // parameters: state - current ellipse state, x, y - new position
  function isOverlapBoundaries(state, x, y) {
      if (((x - (state.get("width") / 2)) < 0) || ((y - (state.get("height") / 2)) < 0) ||
          ((x + (state.get("width") / 2)) > 700) || ((y + (state.get("height") / 2)) > 500)) {
        return true;
      }
      else
        return false;
  }
  
  // Reducer handling ellipse moving
  function moveFigureReducer(state = initialState.get("figure"), action,
    boundaries = false) {
    switch (action.type) {
      case 'MOVE_FIGURE':
        // Check if given coordinates can be parsed as Integer
        let x = parseInt(action.x, 10);
        let y = parseInt(action.y, 10);
  
        // Check if given coordinates aren't Nan
        if (isNaN(x) || isNaN(y)) {
          return state;
        }
  
        if (boundaries === true)
          if (isOverlapBoundaries(state, x, y) === true)
            return state;
        
        // return new ellipse state due to merging with new coordinates
        return state.merge({cx: action.x, cy: action.y});
      default:
        return state;
    }
  }
  
  // Reducer handling ellipse width and height changes
  function resizeFigureReducer(state = initialState.get("figure"), action) {
    switch (action.type) {
      case 'CHANGE_WIDTH':
        let w = parseInt(action.width, 10);
        if (isNaN(w)) {
          return state;
        }
        else {
          return state.set("width", w);
        }
      case 'CHANGE_HEIGHT':
        let h = parseInt(action.height, 10);
        if (isNaN(h)) {
          return state;
        }
        else {
          return state.set("height", h);
        }
      default:
        return state;
    }
  }
  
  // Reducer to check if ellipse intersects boundaries
  function toggleBoundariesReducer(state = initialState, action) {
    var figure = state.get("figure");
    var newState = state.set("boundaries", action.toggle);
    if (action.toggle === true) {
      let cx = figure.get("cx");
      let cy = figure.get("cy");
      let rx = figure.get("width") / 2;
      let ry = figure.get("height") / 2;
  
      let newX = cx;
      let newY = cy;
  
      // If ellipse was out of boundaries before toggling checkbox
      // move ellipse to the edge of boundaries
      if ((cx - rx) < 0)
        newX = rx;
      else if ((cx + rx) > 700)
        newX = 700 - rx;
  
      if ((cy - ry) < 0)
        newY = ry;
      else if ((cy + ry) > 500)
        newY = 500 - ry;
      
      newState = newState.set("figure", figure.merge({"cx": newX, "cy": newY}));
    }
  
    return newState;
  }
  
  // Function to save new ellipse state to history
  function saveHistory(state = initialState, save = false) {
    if (save === false) {
      return state;
    } 
  
    var currentUndo = state.get("currentUndo");
    var newState = state.get("figure");
    
    // If no undo clicked then add new state to history
    if (currentUndo === undefined) {
      var previousState = state.get("history").last();

      // Don't add to history the same state
      if (previousState.equals(newState)) {
        return state;
      }
      else {
        var history = state.get("history");
        return state.set("history", history.push(newState));
      }
    }

    // If undo-redo was made, save current undo history with new ellipse state 
    // and reject available redo states
    else {
        var historySlice = state.get("history").slice(0, currentUndo + 1);
        var newHistory = historySlice.push(newState);
        return state.merge({"history": newHistory, "currentUndo": undefined});
    }
  }
  
  // Reducer to handle undo redo actions: change current figure state according to history
  function undoRedoReducer(state = initialState, action) {
    var history = state.get("history");
    switch (action.action) {
      case 'undo':
        // handle first undo after change
        if (state.get("currentUndo") === undefined) {
          let i = history.count() - 1;
          return state.merge({"figure": history.get(i - 1), "currentUndo": i - 1});
        }
        // handle further undo
        else {
          let i = state.get("currentUndo");
          return state.merge({"figure": history.get(i - 1), "currentUndo": i - 1});
        }
      case 'redo':
        let i = state.get("currentUndo");
        return state.merge({"figure": history.get(i + 1), "currentUndo": i + 1});
      default:
        return state;
    }
  }
  
  // Root reducer calling other reducers on appropriate action
  function testApp(state = initialState, action) {
    switch (action.type) {
      case 'MOVE_FIGURE':
        return saveHistory(state.set("figure", 
          moveFigureReducer(state.get("figure"), action, state.get("boundaries"))), action.save);
      case 'CHANGE_WIDTH':
        return saveHistory(state.set("figure", 
          resizeFigureReducer(state.get("figure"), action)), true);
      case 'CHANGE_HEIGHT':
        return saveHistory(state.set("figure", 
          resizeFigureReducer(state.get("figure"), action)), true);
      case 'TOGGLE_BOUNDARIES':
        return toggleBoundariesReducer(state, action);
      case 'UNDO_REDO':
        return undoRedoReducer(state, action);
      default:
        return state;
    }
  }

export default testApp