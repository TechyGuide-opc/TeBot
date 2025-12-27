const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3TeBotBlocks{
    constructor(runtime) {
        this.runtime = runtime;
        this.socket = null;
        this.receivedData = new Uint8Array(8); // Initialize received data array
    }

    getInfo() {
        return {
            id: 'myExtension',
            name: 'TeBot',
            blocks: [
                {
                    opcode: 'openSocket',
                    blockType: BlockType.COMMAND,
                    text: 'open WebSocket connection'
                },
                {
                    opcode: 'closeSocket',
                    blockType: BlockType.COMMAND,
                    text: 'close WebSocket connection'
                },
                {
                    opcode: 'moveForward',
                    blockType: BlockType.COMMAND,
                    text: 'move forward [STEPS]',
                    arguments: {
                        STEPS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'moveBackward',
                    blockType: BlockType.COMMAND,
                    text: 'move backward [STEPS]',
                    arguments: {
                        STEPS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'turnLeft',
                    blockType: BlockType.COMMAND,
                    text: 'turn left'
                },
                {
                    opcode: 'turnRight',
                    blockType: BlockType.COMMAND,
                    text: 'turn right'
                },
                {
                    opcode: 'senseIR',
                    blockType: BlockType.REPORTER,
                    text: 'IR sensor value'
                },
                {
                    opcode: 'senseUltrasonic',
                    blockType: BlockType.REPORTER,
                    text: 'ultrasonic sensor value'
                },
                {
                    opcode: 'displayLED',
                    blockType: BlockType.COMMAND,
                    text: 'display [MATRIX] on 5x5 LED matrix',
                    arguments: {
                        MATRIX: {
                            type: ArgumentType.MATRIX,
                            defaultValue: '00000:00000:00000:00000:00000'
                        }
                    }
                },
                {
                    opcode: 'isSocketConnected',
                    blockType: BlockType.BOOLEAN,
                    text: 'is TeBot connected?'
                }
            ]
        };
    }

    openSocket() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('WebSocket is already open');
            return;
        }

        this.socket = new WebSocket('ws://localhost:5000');

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        this.socket.onmessage = (event) => {
            const reader = new FileReader();
            reader.onload = () => {
                this.receivedData = new Uint8Array(reader.result);
                console.log('Received data from server:', this.receivedData);
            };
            reader.readAsArrayBuffer(event.data);
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    closeSocket() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
            console.log('WebSocket connection closed');
        } else {
            console.log('WebSocket is not open');
        }
    }

    moveForward(args) {
        const steps = Cast.toNumber(args.STEPS);
        console.log(`Moving forward ${steps}`);
        // Send data to the server
        this.sendData(new Uint8Array([0x01, steps]));
    }

    moveBackward(args) {
        const steps = Cast.toNumber(args.STEPS);
        console.log(`Moving backward ${steps}`);
        // Send data to the server
        this.sendData(new Uint8Array([0x02, steps]));
    }

    turnLeft() {
        console.log('Turning left');
        // Send data to the server
        this.sendData(new Uint8Array([0x03]));
    }

    turnRight() {
        console.log('Turning right');
        // Send data to the server
        this.sendData(new Uint8Array([0x04]));
    }

    senseIR() {
        console.log('Getting IR sensor value');
        // Send request to the server
        // Return a placeholder value (replace with actual sensor value)
        return this.receivedData[5];
    }

    senseUltrasonic() {
        console.log('Getting ultrasonic sensor value');
        // Send request to the server
        this.sendData(new Uint8Array([0x06]));
        // Return a placeholder value (replace with actual sensor value)
        return 0;
    }

    displayLED(args) {
        const matrix = args.MATRIX;
        console.log(`Displaying on 5x5 LED matrix: ${matrix}`);
        // Send data to the server
        this.sendData(new Uint8Array([0x07, ...this.matrixToBytes(matrix)]));
    }

    isSocketConnected() {
        const connected = this.socket && this.socket.readyState === WebSocket.OPEN;
        return connected;
    }

    sendData(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        } else {
            console.error('WebSocket is not open');
        }
    }

    matrixToBytes(matrix) {
        // Convert the matrix string to bytes
        return matrix.split(':').map(row => parseInt(row, 2));
    }
}

module.exports = Scratch3TeBotBlocks;
