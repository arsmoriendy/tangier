{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        name = "escpos-dev";

        buildInputs = with pkgs; [
          nodejs
          libusb1
          node-gyp
          bun
          pkg-config
          python3
          gnumake
          gcc
        ];

        shellHook = ''
          export PKG_CONFIG_PATH="${pkgs.libusb1.dev}/lib/pkgconfig:$PKG_CONFIG_PATH"
        '';
      };
    };
}
