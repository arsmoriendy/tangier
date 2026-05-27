#### `usb` compatibility

1. Apply udev rules, e.g.: `SUBSYSTEM=="usb", ATTRS{idVendor}=="04b8", ATTRS{idProduct}=="0202", MODE="0666"`

##### Arch + `curl -fsSL https://bun.sh/install | bash`

Run with the bun runtime, e.g. `bun -b dev`

##### TODO

1. Fix print
2. Show item count
3. Float qty

###### Backlog

1. Server function authorization
2. Per item quantity threshold
3. Auto set price based on quantity threshold
4. Item categories (category columns: `hierarchy_level`, `hierarchy_name` ("category", "sub category"), `name` ("food", "beverages"))
5. group transaction items based on new category column
6. backup and restore
7. export and import
8. Delete dialogs
