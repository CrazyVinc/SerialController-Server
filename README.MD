# Serial Controller.

## What is Serial Controller?
Serial Controller is a system to execute serial commands on devices such as Arduino in a central place.
The commands on the serial device are controlled by the clients, which are the bridge between the server and the serial device

## Why?
This project is developed to replace the [LEDController](https://github.com/CrazyVinc/LED-Controller).
[LEDController](https://github.com/CrazyVinc/LED-Controller) was a learning project that I will start at the end of 2021. I used the [LEDController](https://github.com/CrazyVinc/LED-Controller) to control the lamps connected to the Arduinos.
I wanted to give the [LEDController](https://github.com/CrazyVinc/LED-Controller) more options than just controlling lamps, so I developed Serial Controller.


## Features:
- [x] Multiple clients.
- [x] Control clients through the console
- [ ] Third party programs are supported via `/3party` socket.io namespace / endpoint.
Be free to contribute to the project!


## Components
The SerialController is split into 3 parts:
- `Client` - A bridge between the server and the serial device
- `WebPanel` - A web panel to manage the device's.
- `Server` - The server makes it possible to manage multiple clients in a central location.


## Socket.io Endpoints:
- `/` - Used for WebPanels.
- `/client` - Used by the clients.
- `/3party` - Used by external programs to directly control an LED Client (Soon).

## Developer Docs
Coming in the future.