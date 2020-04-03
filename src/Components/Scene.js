
import './Scene.css';
import React from 'react';
import Pacman from './Pacman';
import Ghost from './Ghost';
import Food from './Food';
import {isMobile} from 'react-device-detect';

class Scene extends React.Component {
    constructor(props) {
        super(props);
        this.pacmanRef = React.createRef();
        this.ghostRefs = [];
        this.foodRefs = [];
        this.noOfGhosts = isMobile ? 2 : 4;
        this.ghostColors = ['red', 'green', 'blue', 'orange'];
        this.directions = ['left', 'up', 'right', 'down'];
        for (var i=0; i<this.noOfGhosts; i++) {
            this.ghostRefs.push(React.createRef());
        }
    }

    componentDidMount() {
        this.crashed = false;
        this.intervalCrash = setInterval(this.lookForCrash.bind(this), 100);
        this.intervalFood = setTimeout(setInterval(this.lookForFood.bind(this), 100), 3000);
    }

    componentWillUnmount() {   
        clearInterval(this.intervalCrash);
        clearInterval(this.intervalFood);
    }

    lookForCrash() {
        var pacman = this.pacmanRef.current;
        for (var i in this.ghostRefs) {
            var ghost = this.ghostRefs[i].current;
            if (this.isRectanglesColliding(
                    pacman.state.position.left, 
                    pacman.state.position.top,
                    pacman.props.pacmanSize,
                    pacman.props.pacmanSize,
                    ghost.state.position.left, 
                    ghost.state.position.top,
                    ghost.props.ghostSize,
                    ghost.props.ghostSize)) {
                this.crashed = true;
            }
    
            if (this.crashed) {
                this.props.gameOver();
                pacman.killed();
                ghost.killed();
                clearInterval(this.intervalCrash);
                break;
            }
        }
    }

    lookForFood() {
        var pacman = this.pacmanRef.current;
        if (!pacman)
            return;
        for (var i in this.foodRefs) {
            for (var j in this.foodRefs[i]) {
                var food = this.foodRefs[i][j].current;
                if (!food.state.hidden && this.isRectanglesColliding(
                        pacman.state.position.left, 
                        pacman.state.position.top,
                        pacman.props.pacmanSize,
                        pacman.props.pacmanSize,
                        food.state.position.left + 25, 
                        food.state.position.top  + 25,
                        this.props.foodCollidingSize,
                        this.props.foodCollidingSize)) {
                    food.ate();
                    this.props.increase();
                }
            }
        }
    }

    isRectanglesColliding(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        if (r1x + r1w >= r2x &&     // r1 right edge past r2 left
            r1x <= r2x + r2w &&       // r1 left edge past r2 right
            r1y + r1h >= r2y &&       // r1 top edge past r2 bottom
            r1y <= r2y + r2h) {       // r1 bottom edge past r2 top
              return true;
          }
          return false;
    }

    render() {
        var foods = [];
        
        var noOfFoodColumns = Math.round((window.innerWidth - 2*this.props.border)/this.props.foodSize);
        var noOfFoodRows = Math.round((window.innerHeight - this.props.topBarHeight - 2*this.props.border)/this.props.foodSize);
        for (var i = 0; i < noOfFoodRows; i++) {
            if (this.foodRefs.length < noOfFoodRows)
                this.foodRefs.push([]);
            for (var j = 0; j < noOfFoodColumns; j++) {
                if (this.foodRefs[i].length < noOfFoodColumns)
                    this.foodRefs[i].push(React.createRef());
                var position = {top: this.props.foodSize*i, left: this.props.foodSize*j};
                foods.push(<Food ref={this.foodRefs[i][j]} position={position}/>)
            }
        }
        let ghosts = [];
        for (var i=0; i<this.noOfGhosts; i++) {
            ghosts.push(<Ghost 
                ref={this.ghostRefs[i]} 
                playing={this.props.playing} 
                position={{top: (i + 1) * window.innerHeight/(this.noOfGhosts + 1), left: (i + 1) * window.innerWidth/(this.noOfGhosts + 1)}} 
                color={this.ghostColors[i]}
                direction={this.directions[Math.floor(Math.random() * 4)]}></Ghost>);
        }
        return (
            <div className="scene">
                {foods}
				<Pacman ref={this.pacmanRef} playing={this.props.playing} position={{top: 0, left: 0}}
                    direction={this.props.direction}
                    randomDirection={this.props.randomDirection}></Pacman>
                {ghosts}
            </div>
        )
    }
}

Scene.defaultProps = {
    border: 10,
    topBarHeight: 40,
    foodSize: 60,
    foodCollidingSize: 10,
    foodBorderBottomDistance: 10
}

export default Scene;