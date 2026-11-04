#### `usb` compatibility

1. Apply udev rules, e.g.: `SUBSYSTEM=="usb", ATTRS{idVendor}=="04b8", ATTRS{idProduct}=="0202", MODE="0666"`

##### Arch + `curl -fsSL https://bun.sh/install | bash`

Run with the bun runtime, e.g. `bun -b dev`

##### NixOS

Use the flake, run `node-gyp build` within the `node_modules/usb` directory
