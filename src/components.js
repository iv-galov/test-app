import React from 'react'
import { connect } from 'react-redux'
import {moveFigure, changeWidth, changeHeight, toggleBoundaries, undoRedo} from './actions'

// Ellipse component
class Ellipse extends React.Component {
    constructor(props) {
      super(props);
      this.isMoveAllowed = false;

      // property to consider mouse offset while moving ellipse
      this.delta = { x: 0, y: 0 }
    }
  
    // on mousedown allow to move ellipse
    handleMouseDown = (e) => {
      if (e.nativeEvent.which === 1) {
        this.isMoveAllowed = true;
        this.delta = {
          x: this.props.store.cx - e.clientX,
          y: this.props.store.cy - e.clientY,
        }
      }
    }
  
    // on mouseup stop moving ellipse and remember new position
    handleMouseUp = (e) => {
      var newX = e.clientX + this.delta.x;
      var newY = e.clientY + this.delta.y;
      this.props.dispatch(moveFigure(newX, newY, true));
      this.isMoveAllowed = false;
    }
  
    handleMouseMove = (e) => {
      if (this.isMoveAllowed) {
        var newX = e.clientX + this.delta.x;
        var newY = e.clientY + this.delta.y;
        this.props.dispatch(moveFigure(newX, newY));
      }
    }
  
    render() {
      return (
        <ellipse className="ellipse"
          cx={this.props.store.cx}
          cy={this.props.store.cy}
          rx={this.props.store.width / 2}
          ry={this.props.store.height / 2}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove}
        />
      );
    }
  }
  
  // Canvas component
  function Canvas(props) {
    return (
      <svg className="canvas">
        <EllipseConnected />
      </svg>
    );
  }
  
   // Settings component
  class Settings extends React.Component {  
    // handle click on input boxes to get new values to change ellipse
    handleClick = (i, e) => {
      var num = parseInt(prompt("Please enter your name"), 10);
      switch(i) {
        case 1: {
          this.props.dispatch(moveFigure(num, this.props.store.cy, true));
          return;
        }
        case 2: {
          this.props.dispatch(moveFigure(this.props.store.cx, num, true));
          return;
        }
        case 3: {
          this.props.dispatch(changeWidth(num));
          return;
        }
        case 4: {
          this.props.dispatch(changeHeight(num));
          return;
        }
        default:
          return;
      }
    }
  
    // handler to toggle boundaries checking on checkbox click
    handleToggleCheckbox = (e) => {
      this.props.dispatch(toggleBoundaries(e.target.checked));
    }
  
    render() {
      return (
        <div className="settings">
          <table><tbody>
            <tr><td>X:</td>
              <td>
                <input className="input" id="inp1" type="text" readOnly
                  value={this.props.store.cx}
                  onClick={() => this.handleClick(1)}/>
              </td></tr>
            <tr><td>Y:</td><td>
              <input value={this.props.store.cy} readOnly
                onClick={() => this.handleClick(2)}/>
            </td></tr>
            <tr><td>Width:</td><td>
              <input value={this.props.store.width} readOnly
                onClick={() => this.handleClick(3)}/>
            </td></tr>
            <tr><td>Height:</td><td>
              <input value={this.props.store.height} readOnly
                onClick={() => this.handleClick(4)}/>
            </td></tr>
            <tr><td>Enable<br/>boundaries:</td><td>
              <input className="checkbox" type="checkbox" onChange={this.handleToggleCheckbox}/>
            </td></tr>
          </tbody></table>
          <UndoRedoConnected/>
        </div>
      );
    }
  }
  
  // Component with Undo and Redo buttons
  function UndoRedo(props) {
    // handle button clicks
    const handleClick = (e) => {
      switch(e.target.name){
        case "undo":
          props.dispatch(undoRedo("undo"));
          return;
        case "redo":
          props.dispatch(undoRedo("redo"));
          return;
        default:
          return;
      }
    }
  
    // render buttons: if there are no appropriate states in undo-redo history
    // buttons are disabled
    return (
      <div className="undoredo">
        <button type="button" name="undo" onClick={handleClick}
          disabled={((props.store.size <= 1) ||
            (props.store.currentUndo === 0)) ? true : false}>
          {"<= Undo"}
        </button>
        <button type="button" name="redo" onClick={handleClick}
          disabled={((props.store.currentUndo === undefined)||(props.store.currentUndo === props.store.size - 1)) ? true : false}>
          {"Redo =>"}
        </button>
      </div>
    );
  }
  
  // Root component
  class TestApp extends React.Component {
    render() {
      return (
        <div className="TestApp">
          <Canvas />
          <SettingsConnected />
        </div>
      );
    }
  }

  // function to map properties from Redux store to React ellipse component
  function mapStateToProps(state) {
    var figure = state.get("figure");
    return {
      //store: state
       store: {cx: figure.get("cx"), cy: figure.get("cy"),
         width: figure.get("width"), height: figure.get("height")}
    }
  }
  
  // function to map properties from Redux store to React undo-redo component
  function mapStateToPropsUR(state) {
    var history = state.get("history");
    return {
      //store: state
       store: {size: history.count(),
                currentUndo: state.get("currentUndo")}
    }
  }
  
  // create new componentes connected to Redux store and
  // automatically rerendering on store update
  const EllipseConnected = connect(mapStateToProps)(Ellipse);
  const SettingsConnected = connect(mapStateToProps)(Settings);
  const UndoRedoConnected = connect(mapStateToPropsUR)(UndoRedo);

export default TestApp